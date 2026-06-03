-- Migration: api_keys schema
-- Description: Durable schema for developer-owned API keys

CREATE TABLE IF NOT EXISTS public.api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    prefix text NOT NULL,
    secret_digest text NOT NULL,
    quota_override_limit integer,
    is_active boolean NOT NULL DEFAULT true,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique prefix for fast lookup and collision prevention
CREATE UNIQUE INDEX idx_api_keys_prefix ON public.api_keys(prefix);

-- Indexes for listing user keys and filtering active ones
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;

-- Enforce maximum of 5 active keys per user via trigger
CREATE OR REPLACE FUNCTION public.check_max_active_api_keys()
RETURNS TRIGGER AS $$
DECLARE
    active_count integer;
BEGIN
    IF NEW.is_active = true THEN
        SELECT count(*) INTO active_count 
        FROM public.api_keys 
        WHERE user_id = NEW.user_id AND is_active = true;
        
        -- If it's an update, we should exclude the current row from the count if it's already active
        -- But for simplicity, we count all currently active. If it's an insert, active_count must be < 5.
        -- If it's an update from inactive to active, active_count must be < 5.
        -- Wait, if it's already active and we are updating something else, the trigger fires if OF is_active,
        -- but wait, if it's already active and we update it to active, it's counted.
        -- Let's just exclude the current id if it exists.
        IF TG_OP = 'UPDATE' THEN
            SELECT count(*) INTO active_count 
            FROM public.api_keys 
            WHERE user_id = NEW.user_id AND is_active = true AND id != NEW.id;
        END IF;

        IF active_count >= 5 THEN
            RAISE EXCEPTION 'Maximum of 5 active API keys allowed per user.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_active_api_keys
    BEFORE INSERT OR UPDATE OF is_active
    ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.check_max_active_api_keys();

-- Enable RLS and explicitly do not add any policies.
-- This ensures that only the service_role key can access the data,
-- effectively blocking all browser-side CRUD access.
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

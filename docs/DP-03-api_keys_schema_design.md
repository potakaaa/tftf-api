# API Keys Schema and Architecture

This document details the database schema, security configuration, and backend repository architecture for the Developer API Keys implementation in the TFTF Edge API (tracked as `[DP-03]`).

## 1. Database Schema

The `api_keys` table is defined in the `public` schema in Supabase. This table manages the lifecycle and validation of developer-owned API keys.

### Columns

- `id` (uuid): Primary key, automatically generated using `gen_random_uuid()`.
- `user_id` (uuid): Foreign key referencing `auth.users(id)`. This links the API key to a specific developer account. Configured with `ON DELETE CASCADE` to ensure keys are purged if an account is deleted.
- `name` (text): A user-defined friendly name for the key (e.g., "Production Key", "Testing").
- `prefix` (text): The visible prefix of the key (e.g., `tftf_live_xxxx`). Used for fast lookups in the database when authenticating requests.
- `secret_digest` (text): The hashed version of the secret key. **Crucially, the plaintext secret is never stored.** The backend hashes the generated key using a strong cryptographic hash (like SHA-256) before storage.
- `quota_override_limit` (integer, nullable): An optional field to override the default rate limit/quota for this specific key.
- `is_active` (boolean): Indicates whether the key is currently active. Defaults to `true`.
- `revoked_at` (timestamptz): The exact timestamp when the key was revoked. Null if the key is still active.
- `created_at` (timestamptz): Creation timestamp.
- `updated_at` (timestamptz): Last modification timestamp.

### Indexes

To ensure the API remains highly performant during route calculation requests and dashboard rendering, specific indexes were added:

1. **`idx_api_keys_prefix` (UNIQUE)**: A unique index on the `prefix` column. When a request comes in with an API key, the backend extracts the prefix and looks up the record. This unique index ensures O(1) lookup times and prevents prefix collisions.
2. **`idx_api_keys_user_id`**: An index on the `user_id` column to quickly fetch all keys belonging to a specific developer for their dashboard view.
3. **`idx_api_keys_active`**: A partial index on `is_active` where `is_active = true`. This significantly speeds up queries that need to filter out revoked keys.

## 2. Security and Access Control

### Row Level Security (RLS)

Security is handled at the database level using Postgres Row Level Security (RLS). 

```sql
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
```

**Zero Policies:** We explicitly *did not* write any RLS policies for the `anon` or `authenticated` roles. In Supabase, this means the table is completely locked down. A malicious actor cannot query, insert, update, or delete records from this table directly from the browser (e.g., via the Supabase JS client).

All interactions with the `api_keys` table **must** flow through the backend API, which uses a highly privileged `service_role` key that bypasses RLS.

### Maximum 5 Active Keys Constraint

To prevent developers from generating an unlimited number of active keys, a strict database-level constraint is enforced.

Instead of relying on backend application logic (which can be susceptible to race conditions under heavy concurrent load), a Postgres **Trigger** is utilized.

```sql
CREATE TRIGGER enforce_max_active_api_keys
    BEFORE INSERT OR UPDATE OF is_active
    ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.check_max_active_api_keys();
```

The trigger executes a function that counts the currently active keys for the `user_id`. If the count is 5 or more, the database throws an exception (`RAISE EXCEPTION`), immediately halting the transaction.

## 3. Backend Repository Architecture

The Python backend interacts with the Supabase database via the `ApiKeysRepository` class located at `apps/api/app/data/api_keys.py`.

This repository encapsulates all database queries and exposes safe, domain-specific methods:

- `create_key(...)`: Attempts to insert a new key record.
- `get_key_by_prefix(prefix)`: Used heavily by the authentication middleware to fetch the `secret_digest` and quota limits for an incoming request.
- `list_user_keys(user_id)`: Used by the developer portal backend. It intentionally omits the `secret_digest` from the returned payload for safety, even though the backend is secure.
- `revoke_key(user_id, key_id)`: Marks a key as inactive and sets the `revoked_at` timestamp.

The repository requires a `supabase.Client` instance initialized with the `service_role` key to successfully execute these queries past the RLS restrictions.

## 4. Integration with Upstream Tasks (DP-01 & DP-02)

This implementation strictly adheres to the boundaries of `[DP-03]` and cleanly anticipates the infrastructure and environment setup in `[DP-01]` and `[DP-02]`. There are no conflicts.

### DP-01 (Infrastructure Provisioning)
DP-01 is meant purely for creating the managed services. It explicitly marks schema migrations as out of scope. Because we've already written the migration (`supabase/migrations/20260603104300_api_keys.sql`), completing DP-01 simply involves provisioning the Supabase project in the cloud and running `supabase db push` to apply our schema.

### DP-02 (Environment Configuration)
DP-02 handles adding environment variables and strongly-typed backend config. 
- **Digest Pepper**: DP-02 will configure a server-side pepper for hashing API keys. Our `ApiKeysRepository` does not generate hashes itself; it receives the final `secret_digest`. This separation of concerns means the endpoints built later can securely hash the key using the DP-02 pepper and pass it to our repository without any coupling issues.
- **Connection Details**: Note that DP-02 mentions adding a "Postgres connection setting." Because our repository uses the official `supabase-py` client (which interacts with the database via PostgREST rather than a raw Postgres TCP connection), DP-02 should be implemented by adding the **Supabase URL** and **Supabase Service Role Key** to the environment configuration, rather than a traditional SQLAlchemy/asyncpg connection string. Our `ApiKeysRepository` is designed to have this initialized `supabase.Client` injected into it.

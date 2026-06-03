import logging
import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client

logger = logging.getLogger(__name__)


class ApiKeysRepository:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    def create_key(
        self,
        user_id: UUID,
        name: str,
        prefix: str,
        secret_digest: str,
        quota_override_limit: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Creates a new API key for the user. Relies on DB trigger to enforce max 5 active keys."""
        data = {
            "user_id": str(user_id),
            "name": name,
            "prefix": prefix,
            "secret_digest": secret_digest,
        }
        if quota_override_limit is not None:
            data["quota_override_limit"] = quota_override_limit

        try:
            response = self.supabase.table("api_keys").insert(data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logger.error(f"Error creating API key for user {user_id}: {e}")
            raise

    def get_key_by_prefix(self, prefix: str) -> Optional[Dict[str, Any]]:
        """Retrieves a specific key by prefix, useful for authentication middleware."""
        try:
            response = (
                self.supabase.table("api_keys")
                .select("*")
                .eq("prefix", prefix)
                .eq("is_active", True)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error fetching API key with prefix {prefix}: {e}")
            return None

    def list_user_keys(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Lists all keys for a user, omitting secret_digest for safety."""
        try:
            response = (
                self.supabase.table("api_keys")
                .select(
                    "id, name, prefix, quota_override_limit, is_active, created_at, revoked_at"
                )
                .eq("user_id", str(user_id))
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error listing API keys for user {user_id}: {e}")
            return []

    def revoke_key(self, user_id: UUID, key_id: UUID) -> bool:
        """Revokes an API key by setting it to inactive and recording the timestamp."""
        try:
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()

            response = (
                self.supabase.table("api_keys")
                .update(
                    {
                        "is_active": False,
                        "revoked_at": now,
                    }
                )
                .eq("id", str(key_id))
                .eq("user_id", str(user_id))
                .eq("is_active", True)
                .execute()
            )

            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error revoking API key {key_id} for user {user_id}: {e}")
            return False

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_RUNNER_DIR = Path(__file__).resolve().parents[2] / "native"


class Settings(BaseSettings):
    app_name: str = "TFTF Edge API"
    cors_origins: list[str] = ["http://localhost:3000"]
    cors_origin_regex: str = r"http://(localhost|127\.0\.0\.1)(:\d+)?"
    log_level: str = "INFO"
    runner_dir: Path = DEFAULT_RUNNER_DIR
    runner_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="TFTF_",
        extra="ignore",
    )


settings = Settings()

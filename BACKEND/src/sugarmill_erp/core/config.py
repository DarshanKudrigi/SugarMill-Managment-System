from urllib.parse import parse_qs, urlencode, urlparse, urlunparse
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def clean_database_url(url: str) -> str:
    if not url:
        return url
    if url.startswith("postgresql://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    elif url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://"):]

    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)

    # asyncpg expects 'ssl', not 'sslmode'
    if "sslmode" in query_params:
        ssl_val = query_params.pop("sslmode")[0]
        if ssl_val in ("require", "verify-ca", "verify-full"):
            query_params["ssl"] = ["require"]

    # remove channel_binding as asyncpg does not accept it as a connect kwarg
    query_params.pop("channel_binding", None)

    new_query = urlencode(query_params, doseq=True)
    return urlunparse(parsed._replace(query=new_query))


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sugar Mill ERP"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:kanumonu%40123@localhost:5432/sugarmill_erp"
    DEBUG: bool = False

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def format_database_url(cls, v: str) -> str:
        return clean_database_url(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()



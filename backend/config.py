import datetime
from pathlib import Path
from pydantic import BaseSettings


class Config(BaseSettings):
    url: str
    start_date: datetime.date
    postgres_host: str
    postgres_port: str
    postgres_user: str
    postgres_password: str
    postgres_database: str

    static_dir: Path
    fragment_dir: Path
    data_dir: Path

    login_expires_at: datetime.datetime
    session_expires_at: datetime.datetime



config = Config() # type: ignore

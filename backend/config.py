import datetime
from pathlib import Path
from pydantic import BaseSettings


class Config(BaseSettings):
    start_date: datetime.date
    postgres_host: str
    postgres_port: str
    postgres_user: str
    postgres_password: str
    postgres_database: str

    static_dir: Path
    data_dir: Path

config = Config() # type: ignore

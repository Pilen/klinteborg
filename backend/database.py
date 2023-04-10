import psycopg
import psycopg_pool
from psycopg.types.json import Json, Jsonb
import contextlib
from types import TracebackType
from typing import Any, LiteralString, Iterator, Self, Annotated
from fastapi import Depends
from backend.config import config


class DatabaseError(Exception):
    pass


class DBPool:
    def __init__(self) -> None:
       connect = dict(
           host = config.postgres_host,
           port = config.postgres_port,
           user = config.postgres_user,
           password = config.postgres_password,
           dbname = config.postgres_database,
           row_factory = psycopg.rows.dict_row,
           autocommit = True,
       )
       self.pgpool = psycopg_pool.ConnectionPool(kwargs=connect, open=False)

    def open(self) -> None:
        self.pgpool.open()

    def close(self) -> None:
        self.pgpool.close()

    @contextlib.contextmanager
    def connection(self) -> Iterator["DB"]:
        with self.pgpool.connection() as pgconn:
            yield DB(pgconn)

    @contextlib.contextmanager
    def transaction(self) -> Iterator["Tx"]:
        with self.pgpool.connection() as pgconn:
            print("Made a new transaction from the pool")
            with pgconn.transaction():
                yield Tx(pgconn)

dbpool = DBPool()

def make_tx() -> Iterator["Tx"]:
    # TODO: this is a hack
    dbpool.pgpool.check()
    with dbpool.transaction() as tx:
        yield tx
TX = Annotated["Tx", Depends(make_tx)]

class DB:
    def __init__(self, pgconn: psycopg.Connection | None = None) -> None:
        if pgconn is None:
            self.pgconn = psycopg.connect(
                host = config.postgres_host,
                port = config.postgres_port,
                user = config.postgres_user,
                password = config.postgres_password,
                dbname = config.postgres_database,
                row_factory = psycopg.rows.dict_row,
                autocommit = True)
        self._is_in_use = False

    @contextlib.contextmanager
    def transaction(self) -> Iterator["Tx"]:
        if self._is_in_use:
            raise DatabaseError("DB is already in use")
        self._is_in_use = True
        try:
            with self.pgconn.transaction():
                tx = Tx(self.pgconn)
                yield tx
        finally:
            self._is_in_use = False

    def __enter__(self) -> Self:
        return self
    def __exit__(
            self,
            exc_type: type[BaseException] | None,
            exc_val: BaseException | None,
            exc_tb: TracebackType | None,
    ) -> None:
        self.pgconn.__exit__(exc_type, exc_val, exc_tb)


class Tx:
    def __init__(self, pgconn: psycopg.Connection) -> None:
        self.pgconn = pgconn
        self.cursor = self.pgconn.cursor()

    def insert(self, table: LiteralString, **kwargs: Any) -> None:
        self.insert_row(table, kwargs)
        # _check_identifier(table, kwargs)
        # columns = ", ".join(kwargs.keys())
        # values = ", ".join("%s" for i in range(len(kwargs)))
        # query = f"INSERT INTO {table} ({columns}) VALUES ({values})"
        # self.cursor.execute(query, tuple(kwargs.values()))

    def _make_query(self, table: LiteralString, row: dict[str, Any]) -> str:
        _check_identifier(table, row)
        columns = ", ".join(row.keys())
        # values = ", ".join("%s" for i in range(len(row)))
        values = ", ".join(v.text if isinstance(v, RawSQL) else "%s" for v in row.values())
        query = f"INSERT INTO {table} ({columns}) VALUES ({values})"
        return query

    def insert_row(self, table: LiteralString, row: dict[str, Any]) -> None:
        query = self._make_query(table, row)
        values = tuple(value for value in row.values() if not isinstance(value, RawSQL))
        self.cursor.execute(query, values)

    def insert_many(self, table: LiteralString, rows: list[dict[str, Any]]) -> None:
        if not rows:
            return # No rows
        row = rows[0]
        query = self._make_query(table, row)
        values = [tuple(value for value in row.values() if not isinstance(value, RawSQL))
                  for row in rows]
        self.cursor.executemany(query, values)

    def fetch_maybe(self, query: LiteralString, *args: Any) -> dict[str, Any] | None:
        if query.count("?") != len(args):
            raise DatabaseError("Wrong number of SQL arguments for query: {query}")
        query = query.replace("?", "%s")
        self.cursor.execute(query, args)
        return self.cursor.fetchone()

    def fetch_one(self, query: LiteralString, *args: Any) -> dict[str, Any]:
        if query.count("?") != len(args):
            raise DatabaseError("Wrong number of SQL arguments for query: {query}")
        query = query.replace("?", "%s")
        self.cursor.execute(query, args)
        value = self.cursor.fetchone()
        if value is None:
            raise DatabaseError(f"No value for: {query}")
        return value

    def fetch_all(self, query: LiteralString, *args: Any) -> list[dict[str, Any]]:
        if query.count("?") != len(args):
            raise DatabaseError("Wrong number of SQL arguments for query: {query}")
        query = query.replace("?", "%s")
        self.cursor.execute(query, args)
        return self.cursor.fetchall()

    def execute(self, query: LiteralString, *args: Any) -> None:
        if query.count("?") != len(args):
            raise DatabaseError("Wrong number of SQL arguments for query: {query}")
        query = query.replace("?", "%s")
        self.cursor.execute(query, args)

    def affected(self) -> int:
        return self.cursor.rowcount

class RawSQL:
    def __init__(self, text: LiteralString):
        self.text = text

def _check_identifier(table: str, kwargs: dict[str, Any]) -> None:
    if not table.isidentifier():
        raise DatabaseError(f"Table name is not a valid identifier: {table}")
    for key in kwargs:
        if not key.isidentifier():
            raise DatabaseError(f"Column name is not a valid identifier: {key}")

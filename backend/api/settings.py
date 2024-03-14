import json
import pydantic
from typing import Any, Annotated
from fastapi import APIRouter, Body

from backend.database import TX, make_tx, TX, Json

router = APIRouter()

@router.get("/all")
def all(tx: TX):
    rows = tx.fetch_all("SELECT * FROM settings")
    return rows

@router.post("/set")
def set(tx: TX,
        setting: Annotated[str, Body()],
        category: Annotated[str, Body()],
        value: Annotated[Any, Body()]):
    # tx.execute("""
    # INSERT INTO settings (setting, value)
    # VALUES (?, ?)
    # ON CONFLICT (setting)
    # DO
    # UPDATE SET value = EXCLUDED.value
    # """, setting, Json(value))

    tx.execute("""
    UPDATE settings
       SET value = ?
     WHERE setting = ?
       AND category = ?
    """, Json(value), setting, category)

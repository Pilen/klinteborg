from typing import Any, Annotated
from fastapi import APIRouter, Body

from backend.database import TX, make_tx, TX

router = APIRouter()


@router.post("/add-person")
def add_person(
        tx: TX,
        fdfid: Annotated[int, Body()],
        gruppe: Annotated[str, Body()]):
    tx.insert("gruppe_medlemmer", fdfid=fdfid, gruppe=gruppe)


@router.post("/remove-person")
def remove_person(
        tx: TX,
        fdfid: Annotated[int, Body()],
        gruppe: Annotated[str, Body()]):
    tx.execute("""
    DELETE FROM gruppe_medlemmer
          WHERE fdfid = ?
            AND gruppe = ?
    """, fdfid, gruppe)


@router.post("/set-tovholder")
def set_tovholder(
        tx: TX,
        fdfid: Annotated[int, Body()],
        gruppe: Annotated[str, Body()],
        is_tovholder: Annotated[bool, Body()],
):
    tx.execute("""
    UPDATE gruppe_medlemmer
       SET tovholder = ?
     WHERE fdfid = ?
       AND gruppe = ?
    """, is_tovholder, fdfid, gruppe)


@router.get("/all")
def all(tx: TX):
    grupper = tx.fetch_all("""
    SELECT gruppe,
           type,
           beskrivelse,
           minimum_antal,
           maximum_antal
      FROM grupper
    """)
    deltagere = tx.fetch_all("""
      SELECT gruppe,
             array_agg(json_build_object('fdfid', fdfid, 'tovholder', tovholder)) AS medlemmer
        FROM gruppe_medlemmer
    GROUP BY gruppe
    """)
    deltagere_by_gruppe = {row["gruppe"]: row["medlemmer"] for row in deltagere}
    for gruppe in grupper:
        gruppe["medlemmer"] = deltagere_by_gruppe.get(gruppe["gruppe"], [])
    return grupper

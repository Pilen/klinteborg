import json
import pydantic
from typing import Any, Annotated
from fastapi import APIRouter, Body

from backend.database import TX, make_tx, TX, Json


router = APIRouter()


@router.get("/grupper-giving-minus")
def grupper_giving_minus(tx: TX):
    # import time
    # time.sleep(10)
    return tx.fetch_one("""SELECT array_agg(gruppe) FROM grupper_med_minus""")["array_agg"]


@router.post("/set-gruppe-giving-minus")
def set_gruppe_minus(
        tx: TX,
        gruppe: Annotated[str, Body()],
        minus: Annotated[bool, Body()]):
    if minus:
        tx.execute("""
        INSERT INTO grupper_med_minus (gruppe)
        VALUES (?)
        ON CONFLICT DO NOTHING
        """, gruppe)
    else:
        tx.execute("""
        DELETE FROM grupper_med_minus
        WHERE gruppe = ?
        """, gruppe)




@pydantic.dataclasses.dataclass()
class ArbejdsbyrdeBesvarelseGroup:
    gruppe: str
    før: int | None
    under: int | None
    erfaring: bool | None

@pydantic.dataclasses.dataclass()
class ArbejdsbyrdeBesvarelse:
    id: int | None
    grupper: list[ArbejdsbyrdeBesvarelseGroup]
    vægtning: int | None

@router.post("/arbejdsbyrde/besvarelse/save")
def arbejdsbyrde_besvarelse_save(
        tx: TX,
        besvarelse: Annotated[ArbejdsbyrdeBesvarelse, Body()]):
    if (besvarelse.id is None):
        # Save a new
        tx.insert("arbejdsbyrde_besvarelser",
                  grupper = json.dumps(besvarelse.grupper, indent=4, default=pydantic.json.pydantic_encoder),
                  vægtning = besvarelse.vægtning)
    else:
        tx.execute("""
        UPDATE arbejdsbyrde_besvarelser
        SET grupper = ?,
            vægtning = ?,
        WHERE id = ?
        """, Json(besvarelse.grupper), besvarelse.vægtning, besvarelse.id)

@router.get("/arbejdsbyrde/besvarelse/all")
def arbejdsbyrde_besvarelse_all(tx: TX):
    rows = tx.fetch_all("SELECT * from arbejdsbyrde_besvarelser")
    return rows



@router.get("/arbejdsbyrde/custom-score/all")
def arbejdsbyrde_custom_score_all(tx: TX):
    rows = tx.fetch_all("SELECT gruppe, score from arbejdsbyrde_custom_scores");
    result = {row["gruppe"]: row["score"] for row in rows}
    return result

# @router.post("/arbejdsbyrde/custom_score/save")
# def arbejdsbyrde_custom_score_save(
#         tx: TX,
#         gruppe: Annotated[str, Body()],
#         score: Annotated[int, Body()]):
#     tx.execute("""
#     INSERT INTO arbejdsbyrde_custom_scores (gruppe, score)
#     VALUES (?, ?)
#     ON CONFLICT (gruppe)
#     DO
#     UPDATE SET score = EXCLUDED.score
#     """, gruppe, score)

# @router.post("/arbejdsbyrde/custom_score/delete")
# def arbejdsbyrde_custom_score_delete(tx: TX, gruppe: Annotated[str, Body()]):
#     tx.execute("""
#     DELETE FROM arbejdsbyrde_custom_scores
#           WHERE gruppe = ?
#     """, gruppe)

@router.post("/arbejdsbyrde/custom-score/save-all")
def arbejdsbyrde_custom_score_save_all(tx: TX, scores: Annotated[dict[str, float], Body()]):
    tx.execute("DELETE FROM arbejdsbyrde_custom_scores")
    tx.insert_many("arbejdsbyrde_custom_scores",
                   [{"gruppe": gruppe, "score": score} for gruppe, score in scores.items()])


@router.get("/livgruppe-antal")
def livgruppe_antal(tx: TX):
    rows = tx.fetch_all("SELECT * FROM ledere_antal_livgrupper")
    return rows

@pydantic.dataclasses.dataclass()
class ModelLedereAntalLivgrupper:
    fdfid: int
    antal_uge1: int
    antal_uge2: int
    locked: bool

@router.post("/save-livgruppe-antal")
def save_livgruppe_antal(tx: TX, rows: Annotated[list[ModelLedereAntalLivgrupper], Body()]):
    rows = [(m.fdfid, m.antal_uge1, m.antal_uge2, m.locked) for m in rows]
    tx.execute_many("""
    INSERT INTO   ledere_antal_livgrupper (fdfid, antal_uge1, antal_uge2, locked)
         VALUES   (?, ?, ?, ?)
    ON CONFLICT   (fdfid)
    DO UPDATE SET antal_uge1 = EXCLUDED.antal_uge1,
                  antal_uge2 = EXCLUDED.antal_uge2,
                  locked = EXCLUDED.locked
    """, rows)

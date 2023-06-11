from typing import Any, Annotated
from fastapi import APIRouter, Depends

from backend.database import TX, make_tx, TX
import backend.deltagere

router = APIRouter()


@router.get("/import_excel")
# def import_excel(tx: Annotated[TX, Depends(make_tx)]) -> Any:
def import_excel(tx: TX) -> Any:
    backend.deltagere.import_excel(tx)

@router.get("/list")
def list(tx: TX) -> backend.deltagere.Deltager:
    rows = tx.fetch_all("SELECT * from deltagere")
    deltagere = [backend.deltagere.Deltager(**row) for row in rows]
    return deltagere


# @router.get("/experiment")
# def experiment() -> Any:
#     import datetime
#     d = backend.deltagere.Deltager(
#         fdfid = 123,
#         row = {"a": "A"},
#         problemer = ["ingen"],
#         navn = "abc",
#         er_voksen = True,
#         stab = backend.deltagere.Stab.VÆBNERSTAB,
#         patrulje = backend.deltagere.Patrulje.TUMLINGE_1,
#         uge1 = True,
#         uge2 = False,
#         dage = [backend.deltagere.Tilstede.JA],
#         dage_x = [backend.deltagere.Tilstede.JA],
#         ankomst_type = backend.deltagere.Transport.FÆLLES,
#         ankomst_dato = datetime.date(2023, 6, 24),
#         ankomst_tidspunkt = None,
#         afrejse_type = backend.deltagere.Transport.EGEN,
#         afrejse_dato = datetime.date(2023, 6, 26),
#         afrejse_tidspunkt = 10,
#     )
#     return d

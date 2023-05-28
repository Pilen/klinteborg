import datetime
import enum
import xlrd # type: ignore
# from dataclasses import field
import pydantic
from pathlib import Path
from typing import ClassVar, Self, TypeVar, Any, Iterator

from backend.database import TX, Json, Jsonb
from backend.config import config

class Stab(enum.Enum):
    RESTEN = "Resten"
    INDESTAB = "Indestab"
    PILTESTAB = "Piltestab"
    VÆBNERSTAB = "Væbnerstab"

class Patrulje(enum.Enum):
    NUMLINGE =        "Numlinge"
    PUSLINGE_1 =      "1. Puslinge"
    PUSLINGE_2 =      "2. Puslinge"
    TUMLINGE_1 =      "1. Tumlinge"
    TUMLINGE_2 =      "2. Tumlinge"
    PILTE_1 =         "1. Pilte"
    PILTE_2 =         "2. Pilte"
    VÆBNERE_1 =       "1. Væbnere"
    VÆBNERE_2 =       "2. Væbnere"
    SENIORVÆBNERE_1 = "1. Seniorvæbnere"
    SENIORVÆBNERE_2 = "2. Seniorvæbnere"
    UKENDT =          "?"
    INGEN =           "Ingen"

STAB_BY_PATRULJE = {
    Patrulje.NUMLINGE: Stab.RESTEN,
    Patrulje.PUSLINGE_1: Stab.INDESTAB,
    Patrulje.PUSLINGE_2: Stab.INDESTAB,
    Patrulje.TUMLINGE_1: Stab.INDESTAB,
    Patrulje.TUMLINGE_2: Stab.INDESTAB,
    Patrulje.PILTE_1: Stab.PILTESTAB,
    Patrulje.PILTE_2: Stab.PILTESTAB,
    Patrulje.VÆBNERE_1: Stab.VÆBNERSTAB,
    Patrulje.VÆBNERE_2: Stab.VÆBNERSTAB,
    Patrulje.SENIORVÆBNERE_1: Stab.VÆBNERSTAB,
    Patrulje.SENIORVÆBNERE_2: Stab.VÆBNERSTAB,
    Patrulje.UKENDT: Stab.RESTEN,
}

class Tilstede(enum.Enum):
    JA = "Ja"
    NEJ = "Nej"
    MÅSKE = "Måske"
    DELVIST = "Delvist"

class Transport(enum.Enum):
    FÆLLES = "Fælles"
    EGEN = "Egen"
    SAMKØRSEL = "Samkørsel"

TIDSPUNKTER = {
    "kl. 9 og tidligere": 9,
    "kl. 10": 10,
    "kl. 11": 11,
    "kl. 12": 12,
    "kl. 13": 13,
    "kl. 14": 14,
    "kl. 15": 15,
    "kl. 16": 16,
    "kl. 17": 17,
    "kl. 18": 18,
    "kl. 19": 19,
    "senere": 10,
}

DAGE = [
    "Deltagelse Uge 1: / Lørdag 1",
    "Deltagelse Uge 1: / Søndag 1",
    "Deltagelse Uge 1: / Mandag 1",
    "Deltagelse Uge 1: / Tirsdag 1",
    "Deltagelse Uge 1: / Onsdag 1",
    "Deltagelse Uge 1: / Torsdag 1",
    "Deltagelse Uge 1: / Fredag 1",
    "Deltagelse Uge 1: / Lørdag 2",
    "Deltagelse Uge 2: / Lørdag 2",
    "Deltagelse Uge 2: / Søndag 2",
    "Deltagelse Uge 2: / Mandag 2",
    "Deltagelse Uge 2: / Tirsdag 2",
    "Deltagelse Uge 2: / Onsdag 2",
    "Deltagelse Uge 2: / Torsdag 2",
    "Deltagelse Uge 2: / Fredag 2",
    "Deltagelse Uge 2: / Lørdag 3",
]

@pydantic.dataclasses.dataclass()
class Deltager:
    fdfid: int
    row: dict[str, str]
    problemer: list[str]
    navn: str
    er_voksen: bool
    stab: Stab
    patrulje: Patrulje
    uge1: bool
    uge2: bool
    dage: list[Tilstede]
    dage_x: list[Tilstede]

    ankomst_type: Transport
    ankomst_dato: datetime.date
    ankomst_tidspunkt: int | None
    afrejse_type: Transport
    afrejse_dato: datetime.date
    afrejse_tidspunkt: int | None

    @pydantic.validator("dage", "dage_x", pre=True)
    def validate(cls, value: Any, field: Any) -> Any:
        type_ = field.type_ # the inner type, aka the enum
        if isinstance(value, str):
            value = value.removeprefix("{").removesuffix("}")
            value = value.removeprefix("[").removesuffix("]")
            return [type_(v) for v in value.split(",")]
        return value

    def __getitem__(self, key:str) -> str:
        return self.row[key]

class Foo(pydantic.BaseModel):
    x: int
    y: str
    s: Stab
    ss: list[Stab]





def _one_of(*args: Any, lax: bool = True) -> Any:
    result = None
    for arg in args:
        if arg:
            if lax:
                assert result is None or arg == result, args
            else:
                assert result is None, args
            result = arg
    return result

def _make_deltager(row: dict[str, str]) -> Deltager:
    # deltager = Deltager()
    deltager = Deltager.__new__(Deltager) # Hack to avoid pydantic
    id_, navn_= row["Partner"].split(" ", 1)
    deltager.fdfid = int(id_)
    print(deltager.fdfid)
    deltager.row = row
    deltager.problemer = []
    deltager.navn = navn_.strip()

    opgave = row["Opgave på lejren"]
    patrulje = row["Patrulje"]
    age_group = row["Vælg Barn eller Voksen"]

    # deltager.patrulje = patrulje
    if age_group == "Voksen (eller senior)":
        assert opgave != ""
        if opgave == "Leder/senior":
            assert patrulje != ""
            if patrulje.startswith("Ved ikke endnu"):
                patrulje = "?"
            deltager.er_voksen = True
            deltager.patrulje = Patrulje(patrulje)
            deltager.stab = STAB_BY_PATRULJE[deltager.patrulje]
        else:
            assert patrulje == ""
            deltager.er_voksen = True
            deltager.patrulje = Patrulje.INGEN
            deltager.stab = Stab.RESTEN
    elif age_group == "Barn":
        assert opgave == ""
        # assert patrulje != "" # Is this correct? what about tantebørn?
        if patrulje == "":
            deltager.patrulje = Patrulje.UKENDT
            deltager.problemer.append("Ukendt patrulje")
        else:
            deltager.patrulje = Patrulje(patrulje)
        deltager.er_voksen = False
        deltager.stab = STAB_BY_PATRULJE[deltager.patrulje]
    else:
        assert False

    when = _one_of(row["Hvornår deltager du (B)?"], row["Hvornår deltager du (V)?"], lax=True)
    if when.startswith("Begge"):
        deltager.uge1 = True
        deltager.uge2 = True
    elif when.startswith("Uge 1"):
        deltager.uge1 = True
        deltager.uge2 = False
    elif when.startswith("Uge 2"):
        deltager.uge1 = False
        deltager.uge2 = True
    else:
        assert False

    when_are_you_there(deltager)
    when_did_you_cross(deltager)
    return deltager

def when_are_you_there(deltager: Deltager) -> None:
    dato_start = config.start_date
    dato_midt = dato_start + datetime.timedelta(days=7)
    dato_slut = dato_start + datetime.timedelta(days=15)
    ankomst_type = _one_of(deltager["Ankomst til lejren (U2)"], deltager["Ankomst til lejren (U1/B)"])
    afrejse_type = _one_of(deltager["Hjemrejse fra lejren (U2/B)"], deltager["Hjemrejse fra lejren (U1)"])

    if ankomst_type.startswith("Egen"):
        deltager.ankomst_type = Transport.EGEN
        if deltager["Ankomstdato egen transport (ankomst på lejren)"] == "":
            deltager.problemer.append("Deltager mangler \"Ankomstdato egen transport (ankomst på lejren)\"")
            deltager.ankomst_dato = datetime.date(3000, 1, 1)
            deltager.ankomst_tidspunkt = None
        else:
            deltager.ankomst_dato = datetime.datetime.strptime(deltager["Ankomstdato egen transport (ankomst på lejren)"], "%d-%m-%Y").date()
            deltager.ankomst_tidspunkt = TIDSPUNKTER[deltager["Ca. tidspunkt egen transport (ankomst på lejren)"]]
    elif ankomst_type.startswith("Fælles"):
        deltager.ankomst_type = Transport.FÆLLES
        deltager.ankomst_tidspunkt = None
        if deltager.uge1: # just uge1 or both
            deltager.ankomst_dato = dato_start
        elif deltager.uge2:
            assert False
    elif ankomst_type.startswith("Samkørsel"):
        deltager.ankomst_type = Transport.SAMKØRSEL
        deltager.ankomst_tidspunkt = None
        if deltager.uge1: # just uge1 or both
            assert False
        elif deltager.uge2:
            deltager.ankomst_dato = dato_midt
    else:
        assert False

    if afrejse_type.startswith("Egen"):
        deltager.afrejse_type = Transport.EGEN
        deltager.afrejse_dato = datetime.datetime.strptime(deltager["Afrejsedato egen transport (afrejser lejren)"], "%d-%m-%Y").date()
        deltager.afrejse_tidspunkt = TIDSPUNKTER[deltager["Ca. afrejse tidspunkt egen transport (afrejser lejren)"]]
    elif afrejse_type.startswith("Fælles"):
        deltager.afrejse_type = Transport.FÆLLES
        deltager.afrejse_tidspunkt = None
        if deltager.uge2: # just uge2 or both
            deltager.afrejse_dato = dato_slut
        elif deltager.uge1:
            assert False
    elif afrejse_type.startswith("Samkørsel"):
        deltager.afrejse_type = Transport.FÆLLES
        deltager.afrejse_tidspunkt = None
        if deltager.uge2: # just uge2 or both
            assert False
        elif deltager.uge1:
            deltager.afrejse_dato = dato_midt
    else:
        assert False

    if (deltager.ankomst_dato < dato_start):
        deltager.problemer.append("Deltager en ulovlig dato (ankommer før lejren)")
    elif(deltager.ankomst_dato > dato_slut):
        deltager.problemer.append("Deltager en ulovlig dato (ankommer efter lejren)")
    elif deltager.afrejse_dato < dato_start:
        deltager.problemer.append("Deltager en ulovlig dato (afrejser før lejren)")
    elif deltager.afrejse_dato > dato_slut:
        deltager.problemer.append("Deltager en ulovlig dato (afrejser efter lejren)")
    elif deltager.ankomst_dato == deltager.afrejse_dato:
        deltager.problemer.append("Deltager en tager afsted samme dag som ankomst")
    elif deltager.ankomst_dato > deltager.afrejse_dato:
        deltager.problemer.append("Deltager ankommer efter afrejse")

    dage = []
    for i in range(15):
        day = dato_start + datetime.timedelta(days=i)
        if day < deltager.ankomst_dato:
            dage.append(Tilstede.NEJ)
        elif day > deltager.afrejse_dato:
            dage.append(Tilstede.NEJ)
        else:
            dage.append(Tilstede.JA)
    deltager.dage = dage

def when_did_you_cross(deltager: Deltager) -> None:
    deltager.dage_x = [Tilstede.MÅSKE] * 15
#     if self.alder == Alder["v"]:
#         entire = _one_of(
#             row["Deltager du hele den valgte periode (U1)"],
#             row["Deltager du hele den valgte periode (U2)"],
#             row["Deltager du hele den valgte periode (B)"]
#         )
#         if entire.startswith("Hele den valgte periode"):
#             if deltager.uge1 and deltager.uge2:
#                 days = ["+", "+",    "+", "+", "+", "+", "+",    "+", "+",    "+", "+", "+", "+", "+",    "+"]
#             elif deltager.uge1:
#                 days = ["+", "+",    "+", "+", "+", "+", "+",    "+", "_",    "_", "_", "_", "_", "_",    "_"]
#             elif deltager.uge2:
#                 days = ["_", "_",    "_", "_", "_", "_", "_",    "+", "+",    "+", "+", "+", "+", "+",    "+"]
#             else:
#                 assert False
#         elif entire.startswith("Kun nogle dage"):
#             # Assume this corresponds to the uge
#             days = []
#             for dag in DAGE:
#                 if row[dag] == "X":
#                     days.append("+")
#                 elif row[dag] == "":
#                     days.append("_")
#                 else:
#                     assert False, (dag, row[dag])
#         elif entire.startswith("Ved ikke endnu"):
#             if deltager.uge1 and deltager.uge2:
#                 days = ["?", "?",    "?", "?", "?", "?", "?",    "?", "?",    "?", "?", "?", "?", "?",    "?"]
#             elif deltager.uge1:
#                 days = ["?", "?",    "?", "?", "?", "?", "?",    "?", "_",    "_", "_", "_", "_", "_",    "_"]
#             elif deltager.uge2:
#                 days = ["_", "_",    "_", "_", "_", "_", "_",    "?", "?",    "?", "?", "?", "?", "?",    "?"]
#             else:
#                 assert False

#         if deltager.days != days:
#             print(deltager["Deltagernavn"], visualize_days(self.days), "  ", visualize_days(days))
#     deltager.dage_x = days
#     return deltager


def _load(path: Path) -> Iterator[dict[str, str]]:
    wb = xlrd.open_workbook(path)
    ws = wb.sheet_by_index(0)
    rows = ws.get_rows()
    headers = [c.value for c in next(rows)]
    for row in rows:
        yield {h: c.value for c, h in zip(row, headers)}

def _is_good(row: dict[str, str]) -> bool:
    return (row["Status"] != "Afmeldt" and
            row["Status"] != "Annulleret" and
            row["Deltagernavn"] != "")



def import_excel(tx: TX) -> None:
    try:
        rows = list(_load(config.data_dir / "event.registration.xls"))
        good_rows = [row for row in rows if _is_good(row)]
        deltagere = [_make_deltager(row) for row in good_rows]
        tx.execute("""DELETE FROM deltagere""")
        rows = tx.fetch_all("""
        SELECT fdfid,
               navn
          FROM fdfids
        """)
        existing_ids: dict[int, str] = {row["fdfid"]: row["navn"] for row in rows} # type: ignore
        new_count = 0
        inserted_count = 0
        for deltager in deltagere:
            if deltager.fdfid in existing_ids:
                if deltager.navn != existing_ids[deltager.fdfid]:
                    tx.execute("""
                    UPDATE fdfids
                       SET navn = ?
                     WHERE fdfid = ?
                    """, deltager.navn, deltager.fdfid)
            else:
                new_count += 1
                print(deltager.navn)
                tx.insert("fdfids", fdfid = deltager.fdfid, navn = deltager.navn)
            inserted_count += 1
            tx.insert(
                "deltagere",
                fdfid = deltager.fdfid ,
                row = Jsonb(deltager.row),
                problemer = deltager.problemer,
                navn = deltager.navn,
                er_voksen = deltager.er_voksen,
                stab = deltager.stab.value,
                patrulje = deltager.patrulje.value,
                uge1 = deltager.uge1,
                uge2 = deltager.uge2,
                dage = [d.value for d in deltager.dage],
                dage_x = [d.value for d in deltager.dage_x],
                ankomst_type = deltager.ankomst_type.value,
                ankomst_dato = deltager.ankomst_dato,
                ankomst_tidspunkt = deltager.ankomst_tidspunkt,
                afrejse_type = deltager.afrejse_type.value,
                afrejse_dato = deltager.afrejse_dato,
                afrejse_tidspunkt = deltager.afrejse_tidspunkt,
            )
        existing_count = len(existing_ids)
        print(f"{inserted_count=} {new_count=} {existing_count=}")

    except Exception:
        raise

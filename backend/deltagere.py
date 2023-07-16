import datetime
import enum
import re
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
    SENIOR =          "Senior"
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
    Patrulje.SENIOR: Stab.RESTEN,
    Patrulje.UKENDT: Stab.RESTEN,
    Patrulje.INGEN: Stab.RESTEN,
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
    "senere": 20,
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
class Pårørende:
    navn: str
    email: str
    telefon: list[str]

@pydantic.dataclasses.dataclass()
class Deltager:
    fdfid: int
    row: dict[str, str]
    tilmeldt_dato: datetime.datetime
    sidst_ændret_dato: datetime.datetime
    problemer: list[str]
    navn: str
    gammelt_medlemsnummer: int | None
    fødselsdato: datetime.date | None
    adresse: str
    telefon: str
    pårørende: list[Pårørende]

    er_voksen: bool
    stab: Stab
    patrulje: Patrulje
    bordhold_uge1: int | None
    bordhold_uge2: int | None
    uge1: bool
    uge2: bool
    dage: list[Tilstede]
    dage_x: list[Tilstede]
    upræcis_periode: bool

    ankomst_type: Transport
    ankomst_dato: datetime.date | None
    ankomst_tidspunkt: int | None
    afrejse_type: Transport
    afrejse_dato: datetime.date | None
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
    deltager.bordhold_uge1 = None
    deltager.bordhold_uge2 = None

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
            if patrulje == Patrulje.NUMLINGE.value:
                deltager.er_voksen = True
                deltager.patrulje = Patrulje(patrulje)
                deltager.stab = STAB_BY_PATRULJE[deltager.patrulje]
            else:
                assert patrulje == "", patrulje
                deltager.er_voksen = True
                deltager.patrulje = Patrulje.INGEN
                deltager.stab = Stab.RESTEN
    elif age_group == "Barn":
        assert opgave == ""
        # assert patrulje != "" # Is this correct? what about tantebørn?
        if patrulje == "":
            deltager.patrulje = Patrulje.UKENDT
            deltager.problemer.append("Ukendt patrulje")
        elif patrulje.startswith("Ved ikke endnu"):
            deltager.patrulje = Patrulje.UKENDT
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
    dato_slut = dato_start + datetime.timedelta(days=14)
    ankomst_type = _one_of(deltager["Ankomst til lejren (U2)"], deltager["Ankomst til lejren (U1/B)"])
    afrejse_type = _one_of(deltager["Hjemrejse fra lejren (U2/B)"], deltager["Hjemrejse fra lejren (U1)"])
    deltager.upræcis_periode = False

    if ankomst_type.startswith("Egen"):
        deltager.ankomst_type = Transport.EGEN
        if deltager["Ankomstdato egen transport (ankomst på lejren)"] == "":
            deltager.problemer.append("Deltager mangler \"Ankomstdato egen transport (ankomst på lejren)\"")
            deltager.upræcis_periode = True
            deltager.ankomst_dato = None
        else:
            deltager.ankomst_dato = datetime.datetime.strptime(deltager["Ankomstdato egen transport (ankomst på lejren)"], "%d-%m-%Y").date()
        if deltager["Ca. tidspunkt egen transport (ankomst på lejren)"] == "":
            deltager.problemer.append("Deltager mangler \"Ca. tidspunkt egen transport (ankomst på lejren)\"")
            deltager.upræcis_periode = True
            deltager.ankomst_tidspunkt = None
        else:
            deltager.ankomst_tidspunkt = TIDSPUNKTER[deltager["Ca. tidspunkt egen transport (ankomst på lejren)"]]
    elif ankomst_type.startswith("Fælles"):
        deltager.ankomst_type = Transport.FÆLLES
        deltager.ankomst_dato = dato_start
        deltager.ankomst_tidspunkt = None
        if deltager["Ankomstdato egen transport (ankomst på lejren)"] != "":
            deltager.problemer.append("Deltager ankommer med fælles transport, men har angivet \"Ankomstdato egen transport (ankomst på lejren)\"")
            deltager.upræcis_periode = True
        if deltager["Ca. tidspunkt egen transport (ankomst på lejren)"] != "":
            deltager.problemer.append("Deltager ankommer med fælles transport, men har angivet \"Ca. tidspunkt egen transport (ankomst på lejren)\"")
            deltager.upræcis_periode = True
        # assert deltager["Ankomstdato egen transport (ankomst på lejren)"] == ""
        # assert deltager["Ca. tidspunkt egen transport (ankomst på lejren)"] == ""
        assert deltager.uge1 # just uge1 or both
    elif ankomst_type.startswith("Samkørsel"):
        deltager.ankomst_type = Transport.SAMKØRSEL
        deltager.ankomst_dato = dato_midt
        deltager.ankomst_tidspunkt = None
        if deltager["Ankomstdato egen transport (ankomst på lejren)"] != "":
            deltager.problemer.append("Deltager ankommer med samkørsel, men har angivet \"Ankomstdato egen transport (ankomst på lejren)\"")
            deltager.upræcis_periode = True
        if deltager["Ca. tidspunkt egen transport (ankomst på lejren)"] != "":
            deltager.problemer.append("Deltager ankommer med samkørsel, men har angivet \"Ca. tidspunkt egen transport (ankomst på lejren)\"")
            deltager.upræcis_periode = True
        # assert deltager["Ankomstdato egen transport (ankomst på lejren)"] == ""
        # assert deltager["Ca. tidspunkt egen transport (ankomst på lejren)"] == ""
        assert deltager.uge2 and not deltager.uge1
    else:
        assert False

    if afrejse_type.startswith("Egen"):
        deltager.afrejse_type = Transport.EGEN
        if deltager["Afrejsedato egen transport (afrejser lejren)"] == "":
            deltager.problemer.append("Deltager mangler \"Afrejsedato egen transport (afrejser lejren)\"")
            deltager.upræcis_periode = True
            deltager.afrejse_dato = None
        else:
            deltager.afrejse_dato = datetime.datetime.strptime(deltager["Afrejsedato egen transport (afrejser lejren)"], "%d-%m-%Y").date()
        if deltager["Ca. afrejse tidspunkt egen transport (afrejser lejren)"] == "":
            deltager.problemer.append("Deltager mangler \"Ca. afrejse tidspunkt egen transport (afrejser lejren)\"")
            deltager.upræcis_periode = True
            deltager.afrejse_tidspunkt = None
        else:
            deltager.afrejse_tidspunkt = TIDSPUNKTER[deltager["Ca. afrejse tidspunkt egen transport (afrejser lejren)"]]
    elif afrejse_type.startswith("Fælles"):
        deltager.afrejse_type = Transport.FÆLLES
        deltager.afrejse_dato = dato_slut
        deltager.afrejse_tidspunkt = None
        if deltager["Afrejsedato egen transport (afrejser lejren)"] != "":
            deltager.problemer.append("Deltager afrejser med fælles transport, men har angivet \"Afrejsedato egen transport (afrejser lejren)\"")
            deltager.upræcis_periode = True
        if deltager["Ca. afrejse tidspunkt egen transport (afrejser lejren)"] != "":
            deltager.problemer.append("Deltager afrejser med fælles transport, men har angivet \"Ca. afrejse tidspunkt egen transport (afrejser lejren)\"")
            deltager.upræcis_periode = True
        # assert deltager["Afrejsedato egen transport (afrejser lejren)"] == ""
        # assert deltager["Ca. afrejse tidspunkt egen transport (afrejser lejren)"] == ""
        # assert deltager.uge2, deltager.navn # just uge2 or both
        if not deltager.uge2:
            deltager.problemer.append("Deltager tager med fælles transport hjem, men er der ikke i uge 2")
    elif afrejse_type.startswith("Samkørsel"):
        deltager.afrejse_type = Transport.SAMKØRSEL
        deltager.afrejse_dato = dato_midt
        deltager.afrejse_tidspunkt = None
        if deltager["Afrejsedato egen transport (afrejser lejren)"] != "":
            deltager.problemer.append("Deltager afrejser med samkørsel, men har angivet \"Afrejsedato egen transport (afrejser lejren)\"")
            deltager.upræcis_periode = True
        if deltager["Ca. afrejse tidspunkt egen transport (afrejser lejren)"] != "":
            deltager.problemer.append("Deltager afrejser med samkørsel, men har angivet \"Ca. afrejse tidspunkt egen transport (afrejser lejren)\"")
            deltager.upræcis_periode = True
        # assert deltager["Afrejsedato egen transport (afrejser lejren)"] == ""
        # assert deltager["Ca. afrejse tidspunkt egen transport (afrejser lejren)"] == ""
        # assert deltager.uge1 and not deltager.uge2, (deltager.uge1, deltager.uge2, deltager.navn)
        if not deltager.uge1 or deltager.uge2:
            deltager.problemer.append("Deltager afrejser med samkørsel, er her i uge 1, men ikke i uge 2")

    else:
        assert False

    if deltager.ankomst_dato is not None:
        if deltager.ankomst_dato < dato_start:
            deltager.problemer.append("Deltager en ugyldig dato (ankommer før lejren)")
            deltager.upræcis_periode = True
        if deltager.ankomst_dato > dato_slut:
            deltager.problemer.append("Deltager en ugyldig dato (ankommer efter lejren)")
            deltager.upræcis_periode = True
    if deltager.afrejse_dato is not None:
        if deltager.afrejse_dato < dato_start:
            deltager.problemer.append("Deltager en ugyldig dato (afrejser før lejren)")
            deltager.upræcis_periode = True
        if deltager.afrejse_dato > dato_slut:
            deltager.problemer.append("Deltager en ugyldig dato (afrejser efter lejren)")
            deltager.upræcis_periode = True
    if deltager.ankomst_dato is not None and deltager.afrejse_dato is not None:
        if deltager.ankomst_dato == deltager.afrejse_dato:
            deltager.problemer.append("Deltager en tager afsted samme dag som ankomst")
            deltager.upræcis_periode = True
        if deltager.ankomst_dato > deltager.afrejse_dato:
            deltager.problemer.append("Deltager ankommer efter afrejse")
            deltager.upræcis_periode = True

    if deltager.upræcis_periode:
        deltager.dage = [Tilstede.MÅSKE] * 15
    else:
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
        # TODO: handle timezone!
        yield {h: c.value if c.ctype != xlrd.XL_CELL_DATE else xlrd.xldate.xldate_as_datetime(c.value, wb.datemode)
               for c, h in zip(row, headers)}

ALL_STATUS = set(["Bekræftet", "Kladde", "Afventer godkendelse", "Afmeldt", "Annulleret", "Afbud",   "Ikke fremmødt"])
GOOD_STATUS = set(["Bekræftet", "Kladde", "Afventer godkendelse"])
def _is_good(row: dict[str, str]) -> bool:
    if row["Status"] not in ALL_STATUS:
        raise Exception(f"Ukendt status: {row['Status']}")
    return (row["Status"] in GOOD_STATUS and row["Deltagernavn"] != "")
    # return (row["Status"] != "Afmeldt" and
    #         row["Status"] != "Annulleret" and
    #         row["Status"] != "Afbud" and
    #         row["Deltagernavn"] != "")


def load_bordhold_wiki(path, deltagere):
    print(len(deltagere))
    text = path.read_text()
    lines = iter(text.split("\n"))
    uge1 = []
    uge2 = []
    bordhold = []
    uge = uge1
    # uge.append(bordhold)
    for line in lines:
        if line == "=== Uge 1 ===":
            break
    i = 1
    for line in lines:
        if (line.startswith("{|") or
            line == "|+" or
            line == "|-" or
            line == "|}" or
            line == "|" or
            line == "|'''Numlinge'''" or
            line == "|'''Numlingeledere'''" or
            line == ""):
            continue
        if line == "=== Stabsdage ===":
            break
        if line == "=== Uge 2 ===":
            uge = uge2
            bordhold = []
            # uge.append(bordhold)
            i = 1
            continue
        if line.startswith("!Bordhold "):
            assert line == f"!Bordhold {i}", (repr(line), repr(f"!Bordhold {i}"))
            bordhold = []
            uge.append(bordhold)
            i += 1
            continue
        if line.startswith("| class="):
            match = re.fullmatch('\\| class="bg_([^"]+)" *\\|(.*)', line)
            assert match, line
            patrulje = match.group(1)
            navn = match.group(2)
            if navn == "":
                continue
            bordhold.append((patrulje, navn))
            continue
        if line.startswith("|"):
            match = re.fullmatch("\\|(.+)", line)
            assert match, line
            navn = match.group(1)
            if "/" in navn :
                for n in navn.split("/"):
                    bordhold.append((None, n.strip()))
            else:
                bordhold.append((None, navn))
            continue
    import collections
    navne = collections.defaultdict(list)
    full_name = {}
    for deltager in deltagere:
        match = re.match("([^- ]+)", deltager.navn)
        assert match
        fornavn = match.group(1)
        patrulje = None if deltager.er_voksen else deltager.patrulje
        navne[(patrulje, fornavn)].append(deltager)
        full_name[deltager.navn] = deltager
    print("\n".join(full_name.keys()))
    patrulje_map = {
        "1pus": Patrulje.PUSLINGE_1,
        "2pus": Patrulje.PUSLINGE_2,
        "1tum": Patrulje.TUMLINGE_1,
        "2tum": Patrulje.TUMLINGE_2,
        "1pilt": Patrulje.PILTE_1,
        "2pilt": Patrulje.PILTE_2,
        "1vaeb": Patrulje.VÆBNERE_1,
        "2vaeb": Patrulje.VÆBNERE_2,
        "1senvaeb": Patrulje.SENIORVÆBNERE_1,
        "2senvaeb": Patrulje.SENIORVÆBNERE_2,
        "numling": Patrulje.NUMLINGE,
        "numleder": None,
        None: None
    }
    special = {
        (None, "CC"): "Carl Christian David Dam",
        (None, "Helene P"): "Helene Pehrsson",
        (None, "Helene S"): "Helene Skyggebjerg Kjær",
        (None, "Jens A"): "Jens Arffmann",
        (None, "Kasper P"): "Kasper Hvidberg Pedersen",
        (None, "Kasper R"): "Kasper Kongstad Riel",
        (None, "Maja K"): "Maja Baaner Klitgaard",
        (None, "Maja R"): "Maja Bar Rasmussen",
        (None, "Oliver B"): "Oliver Degn Bjerrum",
        (None, "Oliver D"): "Oliver Rafn Dan",
        (None, "Oliver J"): "Oliver Stenberg Jakobsen",
        (None, "Sebastian A"): "Sebastian Aadal Jørgensen",
        (None, "Sebastian B"): "Sebastian Rieskov Bang",
        (None, "Sebastian L"): "Sebastian Lyngø Jakobsen",
        (None, "Søren P"): "Søren Egede Pilgård",
        (None, "Thomas L"): "Thomas Paul Lund",
        (None, "Simon"): "Simon Rieskov Bang",
        (None, "Sine"): "Sine Freltoft Simonsen",
        # ("1senvaeb", "Luca"): "Saga Luca Hauge",
        ("1senvaeb", "Luca"): "Luca (Saga) Hauge",
        ("2vaeb", "Freya (Ida)"): "Freya Ida Egstrup",
        ("1senvaeb", "Maja V"): "Maja Brønnum Vestergaard",
        ("1senvaeb", "Maya R"): "Maya Warren Radford",
        ("1pilt", "Lina R"): "Lina Sorvad Rydik",
        ("1pilt", "Lina F"): "Lina Kofod-Frederiksen",
        ("1vaeb", "Mikkel"): "Mikkel Lassen", # ???? han er 1.senvæb
        ("2pilt", "Theodor (lør-søn)"): "Theodor Hald Boje",
        ("2pus", "Merle (lør-søn)"): "Merle Hald Boje",
        ("numleder", "Mette"): "Mette Salmark",
        ("numleder", "Maria"): "Maria Kennedy",
        ("numleder", "Simon"): "Simon Damkjær Andersen",
        ("numleder", "Thomas"): "Thomas Hoffmann",
        ("numleder", "Malene"): "Malene Grysbæk",
    }
    for (uge, iu) in ((uge1, 1), (uge2, 2)):
        for num, bordhold in enumerate(uge, 1):
            for b_patrulje, b_navn in bordhold:
                patrulje = patrulje_map[b_patrulje]
                if (b_patrulje, b_navn) in special:
                    navn = special[(b_patrulje, b_navn)]
                    deltager = full_name[navn]
                else:
                    found = navne.get((patrulje, b_navn), [])
                    if len(found) != 1:
                        print("BAD:", repr(b_navn), repr(b_patrulje), [f.navn for f in found])
                        continue
                    deltager = found[0]
                if iu == 1:
                    deltager.bordhold_uge1 = num
                elif iu == 2:
                    deltager.bordhold_uge2 = num
                else:
                    assert False
                # setattr(deltager, f"bordhold_uge{iu}", num)



def load_stamdata(path):
    """
    Medlemsnummer
    Status
    Tilmeldingsdato
    Sidst ændret den
    Vis navn
    Partner/Fødselsdato
    Partner/Komplet adresse
    Partner/E-mail
    Partner/Mobil
    Partner/Pårørende (primære)/Vis navn
    Partner/Pårørende (primære)/E-mail
    Partner/Pårørende (primære)/Telefon
    Partner/Pårørende (primære)/Mobil
    """
    rows = list(_load(path))
    current = None
    stamdata = {}
    for row in rows:
        is_bad = False
        if row["Medlemsnummer"] == "" and row["Vis navn"].startswith("Tilmelding "):
            continue
        if row["Medlemsnummer"] != "" and row["Status"] not in GOOD_STATUS:
            is_bad = True
            # continue
        if row["Medlemsnummer"] != "":
            # https://stackoverflow.com/questions/10559767/how-to-convert-ms-excel-date-from-float-to-date-format-in-ruby
            # epoch = datetime.date(1899, 12, 30)
            # fødselsdato = epoch + datetime.timedelta(days=int(row["Partner/Fødselsdato"]))
            fødselsdato = row["Partner/Fødselsdato"]
            tilmeldt_dato = row["Tilmeldingsdato"]
            sidst_ændret_dato = row["Sidst ændret den"]
            print(type(tilmeldt_dato), repr(tilmeldt_dato))
            print(type(sidst_ændret_dato), repr(sidst_ændret_dato))
            assert isinstance(fødselsdato, datetime.datetime)
            assert isinstance(tilmeldt_dato, datetime.datetime)
            assert isinstance(sidst_ændret_dato, datetime.datetime)
            match = re.fullmatch("C/O ([0-9]{4})\n(.*)", row["Partner/Komplet adresse"], re.MULTILINE|re.DOTALL)
            if match:
                gammelt_medlemsnummer = int(match.group(1))
                adresse = match.group(2)
            else:
                gammelt_medlemsnummer = None
                adresse = row["Partner/Komplet adresse"]
            current = {
                "fdfid": int(row["Medlemsnummer"]),
                "tilmeldt_dato": tilmeldt_dato,
                "sidst_ændret_dato": sidst_ændret_dato,
                "navn": row["Vis navn"],
                "gammelt_medlemsnummer": gammelt_medlemsnummer,
                "fødselsdato": fødselsdato,
                # "børneattest": row["Partner/Børneattest/Status"],
                "adresse": adresse,
                "telefon": row["Partner/Mobil"],
                "pårørende": [],
            }
            if not is_bad:
                # We need to create the current, but not save it, else the relatives of a `is_bad` is added to the next deltager
                assert current["fdfid"] not in stamdata, (current["fdfid"], current["navn"])
                stamdata[current["fdfid"]] = current
        if not isinstance(row["Partner/Pårørende (primære)/Vis navn"], str) or row["Partner/Pårørende (primære)/Vis navn"] == "":
            assert not isinstance(row["Partner/Pårørende (primære)/E-mail"], str) or row["Partner/Pårørende (primære)/E-mail"] == ""
            assert not isinstance(row["Partner/Pårørende (primære)/Mobil"], str) or row["Partner/Pårørende (primære)/Mobil"] == ""
            assert not isinstance(row["Partner/Pårørende (primære)/Telefon"], str) or row["Partner/Pårørende (primære)/Telefon"] == ""
            continue
        navn = re.sub("^([0-9]+ )", "", row["Partner/Pårørende (primære)/Vis navn"])
        pårørende = {
            "navn": navn,
            "email": row["Partner/Pårørende (primære)/E-mail"],
            "telefon": [x for x in [row["Partner/Pårørende (primære)/Mobil"], row["Partner/Pårørende (primære)/Telefon"]] if x],
        }
        if pårørende["navn"] == 0:
            assert pårørende["email"] == "" and pårørende["telefon"] == ""
            continue
        current["pårørende"].append(pårørende)
    return stamdata


def import_excel(tx: TX) -> None:
    try:
        rows = list(_load(config.data_dir / "event.registration.xls"))
        stamdata = load_stamdata(config.data_dir / "stamdata.xls")
        good_rows = [row for row in rows if _is_good(row)]
        deltagere = [_make_deltager(row) for row in good_rows]
        load_bordhold_wiki(config.data_dir / "bordhold.txt", deltagere)
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
            if deltager.fdfid in stamdata:
                stam = stamdata[deltager.fdfid]
                if deltager.navn != stam["navn"]:
                    deltager.problemer.append(f"Deltager har forskellige navne i tilmelding og stamdata \"{deltager.navn}\" \"{stam['navn']}\"")
                if not deltager.er_voksen and len(stam["pårørende"]) < 1:
                    deltager.problemer.append("Deltager har ingen pårørende")

            else:
                deltager.problemer.append(f"Der er ingen stamdata for denne person {deltager.navn}")
                stam = None
                # assert False, deltager.navn
            print(deltager.navn, deltager.bordhold_uge1, deltager.bordhold_uge2)
            tx.insert(
                "deltagere",
                fdfid = deltager.fdfid ,
                row = Jsonb(deltager.row),
                tilmeldt_dato = stam["tilmeldt_dato"],
                sidst_ændret_dato = stam["sidst_ændret_dato"],
                problemer = deltager.problemer,
                navn = deltager.navn,
                gammelt_medlemsnummer = stam["gammelt_medlemsnummer"] if stam else None,
                fødselsdato = stam["fødselsdato"],
                adresse = stam["adresse"],
                telefon = stam["telefon"],
                pårørende = Jsonb(stam["pårørende"]),
                er_voksen = deltager.er_voksen,
                stab = deltager.stab.value,
                patrulje = deltager.patrulje.value,
                bordhold_uge1 = deltager.bordhold_uge1,
                bordhold_uge2 = deltager.bordhold_uge2,
                uge1 = deltager.uge1,
                uge2 = deltager.uge2,
                dage = [d.value for d in deltager.dage],
                dage_x = [d.value for d in deltager.dage_x],
                upræcis_periode = deltager.upræcis_periode,
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

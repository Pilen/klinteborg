import enum
import datetime
import pydantic
from typing import Any

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


@pydantic.dataclasses.dataclass()
class Pårørende():
    fdfid: int
    navn: str
    email: str | None
    telefon: list[str]


@pydantic.dataclasses.dataclass()
class Stamdata():
    fdfid: int
    tilmeldt_dato: datetime.datetime
    sidst_ændret_dato: datetime.datetime
    navn: str
    gammelt_medlemsnummer: int | None
    fødselsdato: datetime.date
    email: str | None
    adresse: str
    telefon: str | None
    pårørende: list[Pårørende]


@pydantic.dataclasses.dataclass()
class Deltager:
    fdfid: int
    tilmelding: dict[str, str | bool | int | None | datetime.date]
    tilmeldt_dato: datetime.datetime
    sidst_ændret_dato: datetime.datetime
    problemer: list[str]
    navn: str
    gammelt_medlemsnummer: int | None
    fødselsdato: datetime.date | None
    adresse: str
    telefon: str | None
    pårørende: list[Pårørende]

    er_voksen: bool
    stab: Stab
    patrulje: Patrulje
    bordhold_uge1: int | None
    bordhold_uge2: int | None
    uge1: bool
    uge2: bool
    dage: list[Tilstede]
    upræcis_periode: bool

    ankomst_type: Transport
    ankomst_dato: datetime.date | None
    ankomst_tidspunkt: int | None
    afrejse_type: Transport
    afrejse_dato: datetime.date | None
    afrejse_tidspunkt: int | None

    # @pydantic.validator("dage", "dage_x", pre=True)
    @pydantic.validator("dage", pre=True)
    def validate(cls, value: Any, field: Any) -> Any:
        type_ = field.type_ # the inner type, aka the enum
        if isinstance(value, str):
            value = value.removeprefix("{").removesuffix("}")
            value = value.removeprefix("[").removesuffix("]")
            return [type_(v) for v in value.split(",")]
        return value

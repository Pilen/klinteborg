from typing import Any, Annotated
from fastapi import APIRouter, Depends

from backend.database import TX, make_tx, TX
import backend.deltagere

router = APIRouter()

@router.get("/all")
def all(tx: TX) -> backend.deltagere.Deltager:
    rows = tx.fetch_all("SELECT * from deltagere")
    deltagere = [backend.deltagere.Deltager(**row) for row in rows]
    return deltagere

@router.get("/export")
def export(tx: TX):
    rows = tx.fetch_all("SELECT * from deltagere")
    deltagere = [backend.deltagere.Deltager(**row) for row in rows]
    import json
    import csv
    import pydantic
    from backend.config import config
    path = config.data_dir / "deltagere.json"
    path.write_text(json.dumps(deltagere, indent=4, default=pydantic.json.pydantic_encoder))
    headers = [
        "fdfid",
        "navn",
        "gammelt_medlemsnummer",
        "fødselsdato",
        "adresse",
        "telefon",
        "pårørende",
        "er_voksen",
        "stab",
        "patrulje",
        "uge1",
        "uge2",
        "ankomst_type",
        "ankomst_dato",
        "ankomst_tidspunkt",
        "afrejse_type",
        "afrejse_dato",
        "afrejse_tidspunkt",
        "----",
        "Deltagernavn",
        "E-mail",
        "Partner",
        "Status",
        "Vælg Barn eller Voksen",
        "Hvornår deltager du (B)?",
        "Hvornår deltager du (V)?",
        "Opgave på lejren",
        "Patrulje",
        "Patrulje Uge 1",
        "Forældre eller andre pårørende vil også gerne med",
        "Deltager du hele den valgte periode (U1)",
        "Deltager du hele den valgte periode (U2)",
        "Deltager du hele den valgte periode (B)",
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
        "Ankomst til lejren (U2)",
        "Ankomst til lejren (U1/B)",
        "Ankomstdato egen transport (ankomst på lejren)",
        "Ca. tidspunkt egen transport (ankomst på lejren)",
        "Hjemrejse fra lejren (U2/B)",
        "Hjemrejse fra lejren (U1)",
        "Afrejsedato egen transport (afrejser lejren)",
        "Ca. afrejse tidspunkt egen transport (afrejser lejren)",
        "Køresyge? / Ofte køresyge (opkast)",
        "Har du nogen fødevareallergier eller er vegetar så skriv det her",
        "Sygdom og medicin",
        "Tåler ikke penicillin? / Tåler ikke penicillin",
        "Tåler ikke bedøvelse? / Tåler ikke bedøvelse",
        "Stivkrampevaccination:",
        "Andre helbredsoplysninger:",
        "TUT-penge (U1)",
        "TUT-penge (U2)",
        "TUT-penge (B)",
        "TUT-penge vælg:",
        "Sangbog",
        "Voksen-oplysninger / Ønskes 2-/4-mands værelse (i stedet for sovesal)",
        "Leder-oplysninger / Tutvagt",
        "Leder-oplysninger / Bundgarnspæl",
        "Andre oplysninger",
        "Køn",
    ]
    rows = [headers]
    for deltager in deltagere:
        row = [
            deltager.fdfid,
            deltager.navn,
            deltager.gammelt_medlemsnummer or "",
            deltager.fødselsdato.isoformat() if deltager.fødselsdato else  "",
            deltager.adresse,
            deltager.telefon,
            " | ".join([f"{p.navn} {p.email} {'/'.join(p.telefon)}" for p in  deltager.pårørende]),
            str(deltager.er_voksen),
            deltager.stab.value,
            deltager.patrulje.value,
            str(deltager.uge1),
            str(deltager.uge2),
            deltager.ankomst_type.value,
            deltager.ankomst_dato.isoformat() if deltager.ankomst_dato else "",
            deltager.ankomst_tidspunkt,
            deltager.afrejse_type.value,
            deltager.afrejse_dato.isoformat() if deltager.afrejse_dato else "",
            deltager.afrejse_tidspunkt,
            "",
            deltager.row["Deltagernavn"],
            deltager.row["E-mail"],
            deltager.row["Partner"],
            deltager.row["Status"],
            deltager.row["Vælg Barn eller Voksen"],
            deltager.row["Hvornår deltager du (B)?"],
            deltager.row["Hvornår deltager du (V)?"],
            deltager.row["Opgave på lejren"],
            deltager.row["Patrulje"],
            deltager.row["Patrulje Uge 1"],
            deltager.row["Forældre eller andre pårørende vil også gerne med"],
            deltager.row["Deltager du hele den valgte periode (U1)"],
            deltager.row["Deltager du hele den valgte periode (U2)"],
            deltager.row["Deltager du hele den valgte periode (B)"],
            deltager.row["Deltagelse Uge 1: / Lørdag 1"],
            deltager.row["Deltagelse Uge 1: / Søndag 1"],
            deltager.row["Deltagelse Uge 1: / Mandag 1"],
            deltager.row["Deltagelse Uge 1: / Tirsdag 1"],
            deltager.row["Deltagelse Uge 1: / Onsdag 1"],
            deltager.row["Deltagelse Uge 1: / Torsdag 1"],
            deltager.row["Deltagelse Uge 1: / Fredag 1"],
            deltager.row["Deltagelse Uge 1: / Lørdag 2"],
            deltager.row["Deltagelse Uge 2: / Lørdag 2"],
            deltager.row["Deltagelse Uge 2: / Søndag 2"],
            deltager.row["Deltagelse Uge 2: / Mandag 2"],
            deltager.row["Deltagelse Uge 2: / Tirsdag 2"],
            deltager.row["Deltagelse Uge 2: / Onsdag 2"],
            deltager.row["Deltagelse Uge 2: / Torsdag 2"],
            deltager.row["Deltagelse Uge 2: / Fredag 2"],
            deltager.row["Deltagelse Uge 2: / Lørdag 3"],
            deltager.row["Ankomst til lejren (U2)"],
            deltager.row["Ankomst til lejren (U1/B)"],
            deltager.row["Ankomstdato egen transport (ankomst på lejren)"],
            deltager.row["Ca. tidspunkt egen transport (ankomst på lejren)"],
            deltager.row["Hjemrejse fra lejren (U2/B)"],
            deltager.row["Hjemrejse fra lejren (U1)"],
            deltager.row["Afrejsedato egen transport (afrejser lejren)"],
            deltager.row["Ca. afrejse tidspunkt egen transport (afrejser lejren)"],
            deltager.row["Køresyge? / Ofte køresyge (opkast)"],
            deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"],
            deltager.row["Sygdom og medicin"],
            deltager.row["Tåler ikke penicillin? / Tåler ikke penicillin"],
            deltager.row["Tåler ikke bedøvelse? / Tåler ikke bedøvelse"],
            deltager.row["Stivkrampevaccination:"],
            deltager.row["Andre helbredsoplysninger:"],
            deltager.row["TUT-penge (U1)"],
            deltager.row["TUT-penge (U2)"],
            deltager.row["TUT-penge (B)"],
            deltager.row["TUT-penge vælg:"],
            deltager.row["Sangbog"],
            deltager.row["Voksen-oplysninger / Ønskes 2-/4-mands værelse (i stedet for sovesal)"],
            deltager.row["Leder-oplysninger / Tutvagt"],
            deltager.row["Leder-oplysninger / Bundgarnspæl"],
            deltager.row["Andre oplysninger"],
            deltager.row["Køn"],
            ]
        rows.append(row)
    path = config.data_dir / "deltagere.csv"
    with path.open("w", newline="") as file:
        writer = csv.writer(file, delimiter=";", quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for row in rows:
            writer.writerow(row)


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

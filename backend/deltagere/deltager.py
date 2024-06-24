import datetime
import json
import pydantic

from backend.database import TX, Json, Jsonb
from backend.definitions import Stab, Patrulje, STAB_BY_PATRULJE, Tilstede, Transport, Deltager
from backend.deltagere.tilmelding import load_tilmeldinger, simplify_tilmelding
from backend.deltagere.stamdata import load_stamdata
from backend.deltagere.utils import maybe_convert_datetime_to_date
from backend.config import config

# "Numlinge",
# "1. Puslinge",
# "2. Puslinge",
# "1. Tumlinge",
# "2. Tumlinge",
# "1. Pilte",
# "2. Pilte",
# "1. Væbnere",
# "2. Væbnere",
# "1. Seniorvæbnere",
# "2. Seniorvæbnere",
# "Senior"

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

def one_of(*args):
    result = None
    for arg in args:
        if arg:
            assert result is None, args
            # if lax:
            #     assert result is None or arg == result, args
            # else:
            #     assert result is None, args
            result = arg
    return result

def _patrulje(tilmelding):
    PATRULJER = {
        "Numlinge":     "Numlinge",
        "1. puslinge":  "1. Puslinge",
        "2. puslinge":  "2. Puslinge",
        "1. tumlinge":  "1. Tumlinge",
        "2. tumlinge":  "2. Tumlinge",
        "1. pilt":      "1. Pilte",
        "2. pilt":      "2. Pilte",
        "1. væbner":    "1. Væbnere",
        "2. væbner":    "2. Væbnere",
        "1. sen. væb.": "1. Seniorvæbnere",
        "2. sen. væb.": "2. Seniorvæbnere",
        "Senior":       "Senior"
    }

    patrulje1 = tilmelding["Patrulje Uge 1"]
    patrulje2 = tilmelding["Patrulje Uge 2"]
    hold = tilmelding["Deltagers hold"]
    patrulje = None
    if not patrulje1 and patrulje2:
        patrulje = PATRULJER[patrulje2]
    elif patrulje1 and not patrulje2:
        patrulje = PATRULJER[patrulje1]
    elif not patrulje1 and not patrulje2:
        patrulje = None
    else:
        assert patrulje1 == patrulje2
        patrulje = PATRULJER[patrulje1]
    if hold == "Ledere uden klasse":
        return patrulje
    elif patrulje and hold:
        assert patrulje == hold, (patrulje, hold)
        return patrulje
    elif not patrulje:
        return hold
    elif not hold:
        return patrulje
    assert False


def _opgave(tilmelding):
    opgave = tilmelding["Opgave på lejren"]
    alders_gruppe = tilmelding["Vælg Barn eller Voksen"]
    patrulje = _patrulje(tilmelding)

    if alders_gruppe == "Voksen (eller senior)":
        assert opgave
        if opgave == "Leder/senior":
            if patrulje is None:
                print("Leder uden patrulje", tilmelding["Deltagernavn"])
                patrulje = "?"
            # assert patrulje
            assert patrulje != "Numlinge" # Probably wrong!
            return (True, Patrulje(patrulje))
        elif opgave == "Frivillig (du vil få mere information omkring arbejdsopgaver)":
            assert not patrulje
            return (True, Patrulje.INGEN)
        elif opgave == "Numlingeforælder":
            assert patrulje == "Numlinge"
            # assert not patrulje, patrulje
            return (True, Patrulje.NUMLINGE)
        else:
            assert False
    elif alders_gruppe == "Barn":
        assert patrulje
        return (False, Patrulje(patrulje))
    else:
        assert False

def _uge(tilmelding):
    when = one_of(tilmelding["Hvornår deltager du (B)?"], tilmelding["Hvornår deltager du (V)?"])
    if when.startswith("Begge"):
        return (True, True)
    elif when.startswith("Uge 1"):
        return (True, False)
    elif when.startswith("Uge 2"):
        return (False, True)
    assert False


def _when_are_you_there(tilmelding, er_voksen):
    dato_start = config.start_date
    dato_midt = dato_start + datetime.timedelta(days=7)
    dato_slut = dato_start + datetime.timedelta(days=14)

    ankomst_type = one_of(tilmelding["Ankomst til lejren (U1/B)"], tilmelding["Ankomst til lejren (U2)"])
    afrejse_type = one_of(tilmelding["Hjemrejse fra lejren (U1)"], tilmelding["Hjemrejse fra lejren (U2/B)"])
    ankomst_dato = maybe_convert_datetime_to_date(tilmelding["Ankomstdato egen transport (ankomst på lejren)"])
    afrejse_dato = maybe_convert_datetime_to_date(tilmelding["Afrejsedato egen transport (afrejser lejren)"])
    ankomst_tidspunkt = tilmelding["Ca. tidspunkt egen transport (ankomst på lejren)"]
    afrejse_tidspunkt = tilmelding["Ca. afrejse tidspunkt egen transport (afrejser lejren)"]
    problemer = []
    uge1, uge2 = _uge(tilmelding)

    if ankomst_type.startswith("Egen"):
        ankomst_type = Transport.EGEN
        if not ankomst_dato:
            problemer.append("Deltager mangler \"Ankomstdato egen transport (ankomst på lejren)\"")
            ankomst_dato = None
        else:
            pass
        if not ankomst_tidspunkt:
            problemer.append("Deltager mangler \"Ca. tidspunkt egen transport (ankomst på lejren)\"")
            ankomst_tidspunkt = None
        else:
            ankomst_tidspunkt = TIDSPUNKTER[ankomst_tidspunkt]
    elif ankomst_type.startswith("Fællestransport"):
        ankomst_type = Transport.FÆLLES
        if ankomst_dato and ankomst_dato != dato_start:
            problemer.append("Deltager ankommer med fælles transport, men har angivet \"Ankomstdato egen transport (ankomst på lejren)\"")
        if ankomst_tidspunkt:
            problemer.append("Deltager ankommer med fælles transport, men har angivet \"Ca. tidspunkt egen transport (ankomst på lejren)\"")
        ankomst_tidspunkt = None
        ankomst_dato = dato_start
        if not uge1:
            problemer.append("Deltager ankommer med fælles transport, men er der ikke i uge 1")
    elif ankomst_type.startswith("Samkørsel"):
        ankomst_type = Transport.SAMKØRSEL
        if ankomst_dato and ankomst_dato != dato_start:
            problemer.append("Deltager ankommer med fælles transport, men har angivet \"Ankomstdato egen transport (ankomst på lejren)\"")
        if ankomst_tidspunkt:
            problemer.append("Deltager ankommer med fælles transport, men har angivet \"Ca. tidspunkt egen transport (ankomst på lejren)\"")
        ankomst_dato = dato_midt
        ankomst_tidspunkt = None
        if uge1:
            problemer.append("Deltager ankommer med samkørsel, men er der i uge 1")
        if not uge2:
            problemer.append("Deltager ankommer med samkørsel, men er der ikke i uge 2")
    else:
        assert False

    if afrejse_type.startswith("Egen"):
        afrejse_type = Transport.EGEN
        if not afrejse_dato:
            problemer.append("Deltager mangler \"Afrejsedato egen transport (afrejser lejren)\"")
            afrejse_dato = None
        else:
            pass
        if not afrejse_tidspunkt:
            problemer.append("Deltager mangler \"Ca. afrejse tidspunkt egen transport (afrejser lejren)\"")
            afrejse_tidspunkt = None
        else:
            afrejse_tidspunkt = TIDSPUNKTER[afrejse_tidspunkt]
    elif afrejse_type.startswith("Fælles"):
        afrejse_type = Transport.FÆLLES
        if afrejse_dato and afrejse_dato != dato_slut:
            problemer.append("Deltager afrejser med fælles transport, men har angivet \"Afrejsedato egen transport (afrejser lejren)\"")
        if afrejse_tidspunkt:
            problemer.append("Deltager afrejser med fælles transport, men har angivet \"Ca. afrejse tidspunkt egen transport (afrejser lejren)\"")
        afrejse_dato = dato_slut
        afrejse_tidspunkt = None
        if not uge2:
            problemer.append("Deltager afrejse_tidspunkt med fælles transport, men er der ikke i uge 2")
    elif afrejse_type.startswith("Samkørsel"):
        afrejse_type = Transport.SAMKØRSEL
        if afrejse_dato and afrejse_dato != dato_midt:
            problemer.append("Deltager afrejser med fælles transport, men har angivet \"Afrejsedato egen transport (afrejser lejren)\"")
        if afrejse_tidspunkt:
            problemer.append("Deltager afrejser med fælles transport, men har angivet \"Ca. afrejse tidspunkt egen transport (afrejser lejren)\"")
        afrejse_dato = dato_midt
        afrejse_tidspunkt = None
        if not uge1:
            problemer.append("Deltager afrejser med samkørsel, men er der ikke i uge 1")
        if uge2:
            problemer.append("Deltager afrejser med samkørsel, men er der i uge 2")
    else:
        assert False

    if ankomst_dato is not None:
        if ankomst_dato < dato_start:
            problemer.append("Deltager en ugyldig dato (ankommer før lejren)")
        if ankomst_dato > dato_slut:
            problemer.append("Deltager en ugyldig dato (ankommer efter lejren)")
    if afrejse_dato is not None:
        if afrejse_dato < dato_start:
            problemer.append("Deltager en ugyldig dato (afrejser før lejren)")
        if afrejse_dato > dato_slut:
            problemer.append("Deltager en ugyldig dato (afrejser efter lejren)")
    if ankomst_dato is not None and afrejse_dato is not None:
        if ankomst_dato == afrejse_dato:
            problemer.append("Deltager tager afsted samme dag som ankomst")
        if ankomst_dato > afrejse_dato:
            problemer.append("Deltager ankommer efter afrejse")

    if problemer:
        dage = [Tilstede.MÅSKE] * 15
    else:
        dage = []
        for i in range(15):
            dag = dato_start + datetime.timedelta(days=i)
            if dag < ankomst_dato:
                dage.append(Tilstede.NEJ)
            elif dag > afrejse_dato:
                dage.append(Tilstede.NEJ)
            else:
                dage.append(Tilstede.JA)


    DAGE = [
        tilmelding["Deltagelse Uge 1: / Lørdag 1"],
        tilmelding["Deltagelse Uge 1: / Søndag 1"],
        tilmelding["Deltagelse Uge 1: / Mandag 1"],
        tilmelding["Deltagelse Uge 1: / Tirsdag 1"],
        tilmelding["Deltagelse Uge 1: / Onsdag 1"],
        tilmelding["Deltagelse Uge 1: / Torsdag 1"],
        tilmelding["Deltagelse Uge 1: / Fredag 1"],
        tilmelding["Deltagelse Uge 1: / Lørdag 2"] or tilmelding["Deltagelse Uge 2: / Lørdag 2"],
        tilmelding["Deltagelse Uge 2: / Søndag 2"],
        tilmelding["Deltagelse Uge 2: / Mandag 2"],
        tilmelding["Deltagelse Uge 2: / Tirsdag 2"],
        tilmelding["Deltagelse Uge 2: / Onsdag 2"],
        tilmelding["Deltagelse Uge 2: / Torsdag 2"],
        tilmelding["Deltagelse Uge 2: / Fredag 2"],
        tilmelding["Deltagelse Uge 2: / Lørdag 3"],
    ]

    deltagelse = one_of(tilmelding["Deltager du hele den valgte periode (U1)"],
                        tilmelding["Deltager du hele den valgte periode (U2)"],
                        tilmelding["Deltager du hele den valgte periode (B)"])

    if er_voksen:
        if deltagelse == "Hele den valgte periode":
            J = Tilstede.JA
            N = Tilstede.NEJ
            if uge1 and uge2:
                if ankomst_dato != dato_start:
                    problemer.append("Har angivet \"Hele den valgte periode\" men ankommer ikke den dag")
                if afrejse_dato != dato_slut:
                    problemer.append("Har angivet \"Hele den valgte periode\" men afrejser ikke den dag")
                # dage_x = [J, J,    J, J, J, J, J,    J, J,    J, J, J, J, J,    J,]
            elif uge1:
                if ankomst_dato != dato_start:
                    problemer.append("Har angivet \"Hele den valgte periode\" men ankommer ikke den dag")
                if afrejse_dato != dato_midt:
                    problemer.append("Har angivet \"Hele den valgte periode\" men afrejser ikke den dag")
                # dage_x = [J, J,    J, J, J, J, J,    J, N,    N, N, N, N, N,    N,]
            elif uge2:
                if ankomst_dato != dato_midt:
                    problemer.append("Har angivet \"Hele den valgte periode\" men ankommer ikke den dag")
                if afrejse_dato != dato_slut:
                    problemer.append("Har angivet \"Hele den valgte periode\" men afrejser ikke den dag")
                # dage_x = [N, N,    N, N, N, N, N,    J, J,    J, J, J, J, J,    J,]
            else:
                assert False
            # assert all(not dag for dag in DAGE)
            if any(dag for dag in DAGE):
                problemer.append("Deltager hele den valgte periode, men har krydset specifikke dage af")
            dage_x = dage
        if deltagelse == "Kun nogle dage (vælges)":
            dage_x = []
            if uge1 and uge2:
                assert tilmelding["Deltagelse Uge 1: / Lørdag 2"] == tilmelding["Deltagelse Uge 2: / Lørdag 2"]
            elif uge1:
                assert not tilmelding["Deltagelse Uge 2: / Lørdag 2"]
            elif uge2:
                assert not tilmelding["Deltagelse Uge 1: / Lørdag 2"]

            for i, dag in enumerate(DAGE):
                dato = dato_start + datetime.timedelta(days=i)
                if dato < ankomst_dato:
                    # assert not dag
                    if dag:
                        problemer.append("Har krydset sig af på en dag, før de ankommer")
                elif dato == ankomst_dato:
                    if ankomst_tidspunkt == None and dato == dato_start:
                        assert dag
                    elif ankomst_tidspunkt >= 14:
                        if dag:
                            problemer.append("??? Måske skal personen ikke betale for ankomst dag")
                        else:
                            problemer.append("??? Har ikke krydset af ved ankomst dag")
                    else:
                        assert dag
                elif dato == afrejse_dato:
                    if afrejse_tidspunkt == None and dato == dato_slut:
                        assert dag
                    elif afrejse_tidspunkt <= 12:
                        if dag:
                            problemer.append("??? Måske skal personen ikke betale for afrejse dag")
                        else:
                            problemer.append("??? Har ikke krydset af ved afrejse dag")
                    elif not dag:
                        problemer.append("??? Måske skal personen betale for en dag mere")
                    else:
                        assert dag
                elif dato > afrejse_dato:
                    assert not dag
                else:
                    if not dag:
                        problemer.append("??? Dage ikke tilstede")
                        dage[i] = Tilstede.NEJ
    else:
        if any(dag for dag in DAGE):
            problemer.append("Barn med kryds i dage")
            print("Barn med kryds i dage", tilmelding["Deltagernavn"])
        # for dag in DAGE:
        #     assert not dag

    return (uge1, uge2,
            ankomst_type, ankomst_dato, ankomst_tidspunkt,
            afrejse_type, afrejse_dato, afrejse_tidspunkt,
            problemer,
            dage)

DAGE1 = [
    "Deltagelse Uge 1: / Lørdag 1",
    "Deltagelse Uge 1: / Søndag 1",
    "Deltagelse Uge 1: / Mandag 1",
    "Deltagelse Uge 1: / Tirsdag 1",
    "Deltagelse Uge 1: / Onsdag 1",
    "Deltagelse Uge 1: / Torsdag 1",
    "Deltagelse Uge 1: / Fredag 1",
]
DAGE2 = [
    "Deltagelse Uge 2: / Søndag 2",
    "Deltagelse Uge 2: / Mandag 2",
    "Deltagelse Uge 2: / Tirsdag 2",
    "Deltagelse Uge 2: / Onsdag 2",
    "Deltagelse Uge 2: / Torsdag 2",
    "Deltagelse Uge 2: / Fredag 2",
    "Deltagelse Uge 2: / Lørdag 3",
]
DAGEB = DAGE1 + ["Deltagelse Uge 1: / Lørdag 2"] + DAGE2
# DAGE_LØRDAG = [
#     "Deltagelse Uge 1: / Lørdag 2",
#     "Deltagelse Uge 2: / Lørdag 2",
# ]
def make_deltager(tilmelding, stamdata_map) -> Deltager:
    # tilmelding is a row from the tilmelding sheet
    # Assertions about tilmelding is already done
    # deltager = Deltager.__new__(Deltager)
    fdfid_, navn = tilmelding["Partner"].split(" ", 1)
    print(navn)
    fdfid = int(fdfid_)
    assert tilmelding["Deltagernavn"] == navn

    er_voksen, patrulje = _opgave(tilmelding)
    (uge1, uge2,
     ankomst_type, ankomst_dato, ankomst_tidspunkt,
     afrejse_type, afrejse_dato, afrejse_tidspunkt,
     problemer,
     dage) = _when_are_you_there(tilmelding, er_voksen)
    upræcis_periode = len(problemer) > 0

    stamdata = stamdata_map[fdfid]
    if navn != stamdata.navn:
        problemer.append(f"Deltager har forskellige navne i tilmelding og stamdata \"{deltager.navn}\" \"{stam.navn}\"")
    if not er_voksen and len(stamdata.pårørende) < 1:
        problemer.append("Deltager har ingen pårørende")
    if maybe_convert_datetime_to_date(tilmelding["Fødselsdato"]) != stamdata.fødselsdato:
        print("####################forkert fødselsdato")
        problemer.append(f"To forskellige fødselsdatoer angivet i tilmelding {tilmelding['Fødselsdato']} og medlemsservice {stamdata.fødselsdato}")

    deltager = Deltager(
        fdfid = fdfid,
        tilmelding = tilmelding,
        tilmeldt_dato = stamdata.tilmeldt_dato,
        sidst_ændret_dato = stamdata.sidst_ændret_dato,
        problemer = problemer,
        navn = navn,
        gammelt_medlemsnummer = stamdata.gammelt_medlemsnummer,
        fødselsdato = stamdata.fødselsdato,
        adresse = stamdata.adresse,
        telefon = stamdata.telefon,
        pårørende = stamdata.pårørende,

        er_voksen = er_voksen,
        stab = STAB_BY_PATRULJE[patrulje],
        patrulje = patrulje,
        bordhold_uge1 = None,
        bordhold_uge2 = None,
        uge1 = uge1,
        uge2 = uge2,
        dage = dage,
        upræcis_periode = upræcis_periode,

        ankomst_type = ankomst_type,
        ankomst_dato = ankomst_dato,
        ankomst_tidspunkt = ankomst_tidspunkt,
        afrejse_type = afrejse_type,
        afrejse_dato = afrejse_dato,
        afrejse_tidspunkt = afrejse_tidspunkt,
    )

    return deltager


def get_fdfids(tx: TX) -> dict[int, str]:
    rows = tx.fetch_all("""
    SELECT fdfid,
           navn
      FROM fdfids
    """)
    fdfids = {row["fdfid"]: row["navn"] for row in rows}
    return fdfids

def import_data(tx: TX):
    tilmeldinger = load_tilmeldinger()
    stamdata_map = load_stamdata()
    deltagere = [make_deltager(tilmelding, stamdata_map) for tilmelding in tilmeldinger]
    tx.execute("""DELETE FROM deltagere""")
    fdfids = get_fdfids(tx)
    count_new = 0
    count_inserted = 0
    for deltager in deltagere:
        if deltager.fdfid in fdfids:
            if deltager.navn != fdfids[deltager.fdfid]:
                tx.execute("""
                UPDATE fdfids
                   SET navn = ?
                 WHERE fdfid = ?
                """, deltager.navn, deltager.fdfid)
        else:
            count_new += 1
            tx.insert("fdfids", fdfid = deltager.fdfid, navn = deltager.navn)
        count_inserted += 1
        tx.insert(
            "deltagere",
            fdfid = deltager.fdfid,
            tilmelding = Jsonb(simplify_tilmelding(deltager.tilmelding)),
            tilmeldt_dato = deltager.tilmeldt_dato,
            sidst_ændret_dato = deltager.sidst_ændret_dato,
            problemer = deltager.problemer,
            navn = deltager.navn,
            gammelt_medlemsnummer = deltager.gammelt_medlemsnummer,
            fødselsdato = deltager.fødselsdato,
            adresse = deltager.adresse,
            telefon = deltager.telefon,
            # pårørende = Jsonb(deltager.pårørende),
            pårørende = json.dumps(deltager.pårørende, indent=2, default=pydantic.json.pydantic_encoder),
            er_voksen = deltager.er_voksen,
            stab = deltager.stab.value,
            patrulje = deltager.patrulje.value,
            bordhold_uge1 = deltager.bordhold_uge1,
            bordhold_uge2 = deltager.bordhold_uge2,
            uge1 = deltager.uge1,
            uge2 = deltager.uge2,
            dage = [d.value for d in deltager.dage],
            upræcis_periode = False,
            ankomst_type = deltager.ankomst_type.value,
            ankomst_dato = deltager.ankomst_dato,
            ankomst_tidspunkt = deltager.ankomst_tidspunkt,
            afrejse_type = deltager.afrejse_type.value,
            afrejse_dato = deltager.afrejse_dato,
            afrejse_tidspunkt = deltager.afrejse_tidspunkt,
        )
    count_existing = len(fdfids)
    for deltager in deltagere:
        if deltager.problemer:
            print(deltager.navn, deltager.problemer)
    print(f"{count_inserted=} {count_new=} {count_existing=}")


if __name__ == "__main__":
    import_data()

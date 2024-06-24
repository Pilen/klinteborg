import re
import datetime
from backend.load import load
from backend.config import config
from backend.definitions import Pårørende, Stamdata
from backend.deltagere.utils import maybe_convert_datetime_to_date

def simplify_header(header):
    return header.strip()
    # return header.rsplit("(", 1)[0].strip()

def load_stamdata():
    """
    Medlemsnummer                        (member_number)
    Status                               (state)
    Tilmeldingsdato                      (date_open)
    Sidst ændret den                     (__last_update)
    Vis navn                             (display_name)
    Partner/Fødselsdato                  (partner_id/birthdate_date)
    Partner/Komplet adresse              (partner_id/complete_address)
    Partner/E-mail                       (partner_id/email)
    Partner/Mobil                        (partner_id/mobile)
    Partner/Pårørende (primære)/Vis navn (partner_id/relation_primary_member_ids/display_name)
    Partner/Pårørende (primære)/E-mail   (partner_id/relation_primary_member_ids/email)
    Partner/Pårørende (primære)/Telefon  (partner_id/relation_primary_member_ids/phone)
    Partner/Pårørende (primære)/Mobil    (partner_id/relation_primary_member_ids/mobile)
    """
    rows = load(config.data_dir / "stamdata.xlsx")
    current = None
    stamdata = {}
    for row in rows:
        row = {simplify_header(key): value for key, value in row.items()}
        if row["Medlemsnummer"] is not None:
            fødselsdato = maybe_convert_datetime_to_date(row["Partner/Fødselsdato"])
            tilmeldt_dato = row["Tilmeldingsdato"]
            sidst_ændret_dato = row["Sidst ændret den"]
            assert type(fødselsdato) == datetime.date
            match = re.fullmatch("C/O ([0-9]{4})\n(.*)", row["Partner/Komplet adresse"], re.MULTILINE|re.DOTALL)
            if match:
                gammelt_medlemsnummer = int(match.group(1))
                adresse = match.group(2)
            else:
                gammelt_medlemsnummer = None
                adresse = row["Partner/Komplet adresse"]
            current = Stamdata(
                fdfid = int(row["Medlemsnummer"]),
                tilmeldt_dato = tilmeldt_dato,
                sidst_ændret_dato = sidst_ændret_dato,
                navn = row["Vis navn"],
                gammelt_medlemsnummer = gammelt_medlemsnummer,
                fødselsdato = fødselsdato,
                email = row["Partner/E-mail"],
                adresse = adresse,
                telefon = row["Partner/Mobil"],
                pårørende = [],
            )
            assert current.fdfid not in stamdata
            stamdata[current.fdfid] = current
        if row["Partner/Pårørende (primære)/Vis navn"] is None:
            assert row["Partner/Pårørende (primære)/E-mail"] is None
            assert row["Partner/Pårørende (primære)/Telefon"] is None
            assert row["Partner/Pårørende (primære)/Mobil"] is None
            continue
        telefon = []
        if row["Partner/Pårørende (primære)/Mobil"]:
            telefon.append(row["Partner/Pårørende (primære)/Mobil"])
        if row["Partner/Pårørende (primære)/Telefon"] and row["Partner/Pårørende (primære)/Telefon"] != row["Partner/Pårørende (primære)/Mobil"]:
            telefon.append(row["Partner/Pårørende (primære)/Telefon"])
        match = re.fullmatch("([0-9]+) (.*)", row["Partner/Pårørende (primære)/Vis navn"])
        pårørende = Pårørende(
            fdfid = int(match.group(1)),
            navn = match.group(2),
            email = row["Partner/Pårørende (primære)/E-mail"],
            telefon = telefon)
        current.pårørende.append(pårørende)
    return stamdata

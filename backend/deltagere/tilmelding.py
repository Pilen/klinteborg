import re
from datetime import date, datetime
from backend.load import load
from backend.config import config



def has_type(type):
    def check(value):
        assert isinstance(value, type)
        # if isinstance(type_, tuple):
        #     for t in type_:
        #         if type(value) == t:
        #             return
        #     assert False
        # assert type(value) == type_
    return check

def has_pattern(pattern):
    pattern = re.compile(pattern)
    def check(value):
        assert isinstance(value, str)
        assert pattern.fullmatch(value)
    return check

def has_value(*values):
    values = set(values)
    def check(value):
        assert value in values
    return check

def has_type_or_false(type):
    check_ = has_type(type)
    def check(value):
        assert value == False or isinstance(value, type)
        # assert value == False or check_(value)
    return check


ROW_FORMAT = {
    "Deltagernavn": has_type(str),
    "E-mail": has_type((type(None), str)),
    "Partner": has_pattern("([0-9]+) .+"),
    "Status": has_value("Tilmeldt", "Kladde"),
    "Vælg Barn eller Voksen": has_value("Barn", "Voksen (eller senior)"),
    "Hvornår deltager du (B)?": has_value(False,
                                          "Begge Uger (29. juni - 13. juli)",
                                          "Uge 1 (29. juni - 6. juli)",
                                          "Uge 2 (6. juli - 13. juli)"),
    "Hvornår deltager du (V)?": has_value(False,
                                          "Begge Uger (29. juni - 13. juli)",
                                          "Uge 1 (29. juni - 6. juli)",
                                          "Uge 2 (6. juli - 13. juli)"),
    "Opgave på lejren": has_value(False,
                                  "Leder/senior",
                                  "Frivillig (du vil få mere information omkring arbejdsopgaver)",
                                  "Numlingeforælder"),
    "Patrulje Uge 1": has_value(False,
                                "1. puslinge",
                                "2. puslinge",
                                "1. tumlinge",
                                "2. tumlinge",
                                "1. pilt",
                                "2. pilt",
                                "1. væbner",
                                "2. væbner",
                                "1. sen. væb.",
                                "2. sen. væb."),
    "Patrulje Uge 2": has_value(False,
                                "Numlinge",
                                "1. puslinge",
                                "2. puslinge",
                                "1. tumlinge",
                                "2. tumlinge",
                                "1. pilt",
                                "2. pilt",
                                "1. væbner",
                                "2. væbner",
                                "1. sen. væb.",
                                "2. sen. væb."),
    "Forældre eller andre pårørende vil også gerne med": has_value(None),
    "Deltager du hele den valgte periode (U1)": has_value(False,
                                                          "Hele den valgte periode",
                                                          "Kun nogle dage (vælges)"),
    "Deltager du hele den valgte periode (U2)": has_value(False,
                                                          "Hele den valgte periode",
                                                          "Kun nogle dage (vælges)"),
    "Deltager du hele den valgte periode (B)": has_value(False,
                                                          "Hele den valgte periode",
                                                          "Kun nogle dage (vælges)"),
    "Deltagelse Uge 1: / Lørdag 1": has_type(bool),
    "Deltagelse Uge 1: / Søndag 1": has_type(bool),
    "Deltagelse Uge 1: / Mandag 1": has_type(bool),
    "Deltagelse Uge 1: / Tirsdag 1": has_type(bool),
    "Deltagelse Uge 1: / Onsdag 1": has_type(bool),
    "Deltagelse Uge 1: / Torsdag 1": has_type(bool),
    "Deltagelse Uge 1: / Fredag 1": has_type(bool),
    "Deltagelse Uge 1: / Lørdag 2": has_type(bool),
    "Deltagelse Uge 2: / Lørdag 2": has_type(bool),
    "Deltagelse Uge 2: / Søndag 2": has_type(bool),
    "Deltagelse Uge 2: / Mandag 2": has_type(bool),
    "Deltagelse Uge 2: / Tirsdag 2": has_type(bool),
    "Deltagelse Uge 2: / Onsdag 2": has_type(bool),
    "Deltagelse Uge 2: / Torsdag 2": has_type(bool),
    "Deltagelse Uge 2: / Fredag 2": has_type(bool),
    "Deltagelse Uge 2: / Lørdag 3": has_type(bool),
    "Ankomst til lejren (U2)": has_value(False,
                                         "Egen transport",
                                         "Samkørsel hjælp ønskes"),
    "Ankomst til lejren (U1/B)": has_value(False,
                                           "Fællestransport med tog",
                                           "Egen transport"),
    "Ankomstdato egen transport (ankomst på lejren)": has_type_or_false(date),
    "Ca. tidspunkt egen transport (ankomst på lejren)": has_value(False,
                                                                  "kl. 9 og tidligere",
                                                                  "kl. 10",
                                                                  "kl. 11",
                                                                  "kl. 12",
                                                                  "kl. 13",
                                                                  "kl. 14",
                                                                  "kl. 15",
                                                                  "kl. 16",
                                                                  "kl. 17",
                                                                  "kl. 18",
                                                                  "kl. 19",
                                                                  "senere"),
    "Hjemrejse fra lejren (U2/B)": has_value(False,
                                             "Fællestransport med bus",
                                             "Egen transport"),
    "Hjemrejse fra lejren (U1)": has_value(False,
                                           "Egen transport",
                                           "Samkørsel hjælp ønskes"),
    "Afrejsedato egen transport (afrejser lejren)": has_type_or_false(date),
    "Ca. afrejse tidspunkt egen transport (afrejser lejren)": has_value(False,
                                                                        "kl. 9 og tidligere",
                                                                        "kl. 10",
                                                                        "kl. 11",
                                                                        "kl. 12",
                                                                        "kl. 13",
                                                                        "kl. 14",
                                                                        "kl. 15",
                                                                        "kl. 16",
                                                                        "kl. 17",
                                                                        "kl. 18",
                                                                        "kl. 19",
                                                                        "senere"),
    "Køresyge? / Ofte køresyge (opkast)": has_type(bool),
    "Har du nogen fødevareallergier eller er vegetar": has_value("Ja", "Nej"),
    "Beskriv dine fødevareallergier:": has_type((type(None), str)),
    "Sygdom og medicin": has_type((type(None), str)),
    "Allergier: / Tåler ikke penicillin": has_type(bool),
    "Allergier: / Tåler ikke bedøvelse?": has_type(bool),
    "Stivkrampevaccination:": has_value("Følger vaccinationsprogram",
                                        "Ingen vaccination",
                                        "Er udløbet",
                                        "Ved ikke"),
    "Andre helbredsoplysninger:": has_type((type(None), str)),
    "TUT-penge (U1)": has_value(False,
                                "Standard 10 kr. per dag (pus/tum/pilt)",
                                "Frit valg (væbner/sen.væbner og ældre"), # Note, missing end paren
    "TUT-penge (U2)": has_value(False,
                                "Standard 10 kr. per dag (pus/tum/pilt)",
                                "Frit valg (væbner/sen.væbner og ældre)"),
    "TUT-penge (B)": has_value(False,
                                "Standard 10 kr. per dag (pus/tum/pilt)",
                                "Frit valg (væbner/sen.væbner og ældre"), # Note, missing end paren
    "TUT-penge vælg:": has_value(False,
                                 "000 kr. (kun for voksne)",
                                 "100 kr.",
                                 "150 kr.",
                                 "200 kr.",
                                 "250 kr.",
                                 "300 kr.",
                                 "400 kr.",
                                 "500 kr."),
    "Sangbog": has_value(False,
                         "Årets sangbog uden spiralryg (pris 75,-)",
                         "Årets sangbog med spiralryg (pris 89,-)"),
    "Voksen-oplysninger / Ønskes 2-/4-mands værelse (i stedet for sovesal)": has_type(bool),
    "Leder-oplysninger / Tutvagt": has_type(bool),
    "Leder-oplysninger / Bundgarnspæl": has_type(bool),
    "Andre oplysninger": has_type((type(None), str)),
    "Bordhold": has_type(int),
    "Værelse": has_type(int),
    "Kasserer prisjustering": has_type(int),
    "Køn": has_value("Mand",
                     "Kvinde",
                     "Andet"),
    "Fødselsdato": has_type(date),
    "Deltagers landsdel": has_value(False),
    "Deltagers netværk": has_value(False),
    "Deltagers kreds": has_value(False),
    "Deltagers hold": has_value(False,
                                "Numlinge",
                                "1. Puslinge",
                                "2. Puslinge",
                                "1. Tumlinge",
                                "2. Tumlinge",
                                "1. Pilte",
                                "2. Pilte",
                                "1. Væbnere",
                                "2. Væbnere",
                                "1. Seniorvæbnere",
                                "2. Seniorvæbnere",
                                "Senior",
                                "Ledere uden klasse"),
}

def simplify_tilmelding(tilmelding):
    return {key: value.isoformat() if isinstance(value, date) else value
            for key, value in tilmelding.items()}

def validate(row):
    if row.keys() != ROW_FORMAT.keys():
        row_keys = set(row.keys())
        format_keys = set(ROW_FORMAT.keys())
        errors = []
        if len(row_keys - format_keys) > 0:
            errors.append(f"Unknown columns: {row_keys - format_keys}")
        if len(format_keys - row_keys) > 0:
            errors.append(f"Missing columns: {format_keys - row_keys}")
        raise Exception("\n".join(errors))

    for variable, validator in ROW_FORMAT.items():
        value = row[variable]
        try:
            validator(value)
        except AssertionError as e:
            raise Exception(f"Value in column \"{variable}\" has a bad value: {value!r}")

    id_, navn_ = row["Partner"].split(" ", 1)
    assert row["Deltagernavn"] == navn_



def load_tilmeldinger():
    tilmeldinger = load(config.data_dir / "Arrangementstilmelding (event.registration).xlsx")
    for tilmelding in tilmeldinger:
        validate(tilmelding)
    return tilmeldinger

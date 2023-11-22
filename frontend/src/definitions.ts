import {addDays, calculateModa} from "src/utils";

////////////////////////////////////////////////////////////////////////////////
// Køn
////////////////////////////////////////////////////////////////////////////////

export class Køn {
    order: number;
    name: string;
    abbreviation: string;

    constructor(order, name, abbreviation) {
        // Køn._instances[
        this.order = order;
        this.name = name;
        this.abbreviation = abbreviation;
    }

    static _instances: Map<string, Køn> = new Map();
    public static get(name: string) {
        return Køn._instances.get(name);
    }
    public static define(køn: Køn) {
        Køn._instances.set(køn.name, køn);
    }
}
Køn.define(new Køn(1, "Mand", "M"));
Køn.define(new Køn(2, "Kvinde", "K"));
Køn.define(new Køn(3, "Andet", "A"));

////////////////////////////////////////////////////////////////////////////////
// Stab
////////////////////////////////////////////////////////////////////////////////

export class Stab {
    order: number;
    name: string;
    constructor(order, name) {
        this.order = order;
        this.name = name;
    }

    static _instances: Map<string, Stab> = new Map();
    public static get(name: string) {
        return Stab._instances.get(name);
    }
    public static define(stab: Stab) {
        Stab._instances.set(stab.name, stab);
    }
}
Stab.define(new Stab(1, "Indestab"));
Stab.define(new Stab(2, "Piltestab"));
Stab.define(new Stab(3, "Væbnerstab"));
Stab.define(new Stab(4, "Resten"));


////////////////////////////////////////////////////////////////////////////////
// Patrulje
////////////////////////////////////////////////////////////////////////////////

export class Patrulje {
    order: number;
    name: string;
    abbreviation: string;
    stab: Stab;
    constructor(order, name, abbreviation, stab) {
        this.order = order;
        this.name = name;
        this.abbreviation = abbreviation;
        this.stab = stab;
    }

    static _instances: Map<string, Patrulje> = new Map();
    public static get(name: string) {
        return Patrulje._instances.get(name);
    }
    public static define(patrulje: Patrulje) {
        Patrulje._instances.set(patrulje.name, patrulje);
    }

}
// "\xa0" is a non-breaking space
Patrulje.define(new Patrulje(1,  "Numlinge",         "Num",   Stab.get("Resten")));
Patrulje.define(new Patrulje(2,  "1. Puslinge",      "1.\xa0Pu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(3,  "2. Puslinge",      "2.\xa0Pu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(4,  "1. Tumlinge",      "1.\xa0Tu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(5,  "2. Tumlinge",      "2.\xa0Tu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(6,  "1. Pilte",         "1.\xa0Pi", Stab.get("Piltestab")));
Patrulje.define(new Patrulje(7,  "2. Pilte",         "2.\xa0Pi", Stab.get("Piltestab")));
Patrulje.define(new Patrulje(8,  "1. Væbnere",       "1.\xa0Væ", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(9,  "2. Væbnere",       "2.\xa0Væ", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(10, "1. Seniorvæbnere", "1.\xa0Sv", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(11, "2. Seniorvæbnere", "2.\xa0Sv", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(12, "Senior",           "Sen",   Stab.get("Resten")));
Patrulje.define(new Patrulje(13, "?",                "?",     Stab.get("Resten")));
Patrulje.define(new Patrulje(14, "Ingen",            "-",     Stab.get("Resten")));


////////////////////////////////////////////////////////////////////////////////
// Tilstede
////////////////////////////////////////////////////////////////////////////////

export enum Tilstede {
    "Ja" = "Ja",
    "Nej" = "Nej",
    "Måske" = "Måske",
    "Delvist" = "Delvist",
}


////////////////////////////////////////////////////////////////////////////////
// Transport
////////////////////////////////////////////////////////////////////////////////

export enum Transport {
    // FÆLLES = "Fælles",
    // EGEN = "Egen",
    // SAMKØRSEL = "Samkørsel",

    "Fælles" = "Fælles",
    "Egen" = "Egen",
    "Samkørsel" = "Samkørsel",
}


////////////////////////////////////////////////////////////////////////////////
// Transport
////////////////////////////////////////////////////////////////////////////////
export const DAYS = [
    "1. Lørdag",
    "1. Søndag",
    "1. Mandag",
    "1. Tirsdag",
    "1. Onsdag",
    "1. Torsdag",
    "1. Fredag",
    "2. Lørdag",
    "2. Søndag",
    "2. Mandag",
    "2. Tirsdag",
    "2. Onsdag",
    "2. Torsdag",
    "2. Fredag",
    "3. Lørdag",
];

export const TILMELDING_HEADERS = [
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


export const START_DATE = new Date("2023/06/24");
export const END_DATE = addDays(START_DATE, 14);
export const DATES = [
    addDays(START_DATE, 0),  // 1. Lørdag
    addDays(START_DATE, 1),  // 1. Søndag
    addDays(START_DATE, 2),  // 1. Mandag
    addDays(START_DATE, 3),  // 1. Tirsdag
    addDays(START_DATE, 4),  // 1. Onsdag
    addDays(START_DATE, 5),  // 1. Torsdag
    addDays(START_DATE, 6),  // 1. Fredag
    addDays(START_DATE, 7),  // 2. Lørdag
    addDays(START_DATE, 8),  // 2. Søndag
    addDays(START_DATE, 9),  // 2. Mandag
    addDays(START_DATE, 10), // 2. Tirsdag
    addDays(START_DATE, 11), // 2. Onsdag
    addDays(START_DATE, 12), // 2. Torsdag
    addDays(START_DATE, 13), // 2. Fredag
    addDays(START_DATE, 14), // 3. Lørdag
];

export const START_DATE_MODA = calculateModa(START_DATE);
export const END_DATE_MODA = calculateModa(START_DATE);

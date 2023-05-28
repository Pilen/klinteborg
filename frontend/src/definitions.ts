////////////////////////////////////////////////////////////////////////////////
// Køn
////////////////////////////////////////////////////////////////////////////////

export class Køn {
    order: number;
    name: string;
    abbreviation: string;
    constructor(order, name, abbreviation) {
        this.order = order;
        this.name = name;
        this.abbreviation = abbreviation;
    }

    // public static get(name: string) {
    //     return Køn._instances[name];
    // }
}
export let KØN = {
    "Mand": new Køn(0, "Mand", "M"),
    "Kvinde": new Køn(1, "Kvinde", "K"),
    "Andet": new Køn(2, "Andet", "A"),
}

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
}
export let STAB = {
    "Indestab": new Stab(0, "Indestab"),
    "Piltestab": new Stab(1, "Piltestab"),
    "Væbnerstab": new Stab(2, "Væbnerstab"),
    "Resten": new Stab(3, "Resten"),
}


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
}
export let PATRULJE = {
    "Numlinge":         new Patrulje(0,  "Numlinge",         "Num", STAB["Resten"]),
    "1. Puslinge":      new Patrulje(1,  "1. Puslinge",      "1. Pu", STAB["Indestab"]),
    "2. Puslinge":      new Patrulje(2,  "2. Puslinge",      "2. Pu", STAB["Indestab"]),
    "1. Tumlinge":      new Patrulje(3,  "1. Tumlinge",      "1. Tu", STAB["Indestab"]),
    "2. Tumlinge":      new Patrulje(4,  "2. Tumlinge",      "2. Tu", STAB["Indestab"]),
    "1. Pilte":         new Patrulje(5,  "1. Pilte",         "1. Pi", STAB["Piltestab"]),
    "2. Pilte":         new Patrulje(6,  "2. Pilte",         "2. Pi", STAB["Piltestab"]),
    "1. Væbnere":       new Patrulje(7,  "1. Væbnere",       "1. Væ", STAB["Væbnerstab"]),
    "2. Væbnere":       new Patrulje(8,  "2. Væbnere",       "2. Væ", STAB["Væbnerstab"]),
    "1. Seniorvæbnere": new Patrulje(9,  "1. Seniorvæbnere", "1. Sv", STAB["Væbnerstab"]),
    "2. Seniorvæbnere": new Patrulje(10, "2. Seniorvæbnere", "2. Sv", STAB["Væbnerstab"]),
    "?":                new Patrulje(11, "?",                "?",   STAB["Resten"]),
    "Ingen":            new Patrulje(12, "Ingen",            "-",   STAB["Resten"]),
}


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

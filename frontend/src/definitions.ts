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
Køn.define(new Køn(0, "Mand", "M"));
Køn.define(new Køn(1, "Kvinde", "K"));
Køn.define(new Køn(2, "Andet", "A"));

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
Stab.define(new Stab(0, "Indestab"));
Stab.define(new Stab(1, "Piltestab"));
Stab.define(new Stab(2, "Væbnerstab"));
Stab.define(new Stab(3, "Resten"));


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
Patrulje.define(new Patrulje(0,  "Numlinge",         "Num",   Stab.get("Resten")));
Patrulje.define(new Patrulje(1,  "1. Puslinge",      "1. Pu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(2,  "2. Puslinge",      "2. Pu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(3,  "1. Tumlinge",      "1. Tu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(4,  "2. Tumlinge",      "2. Tu", Stab.get("Indestab")));
Patrulje.define(new Patrulje(5,  "1. Pilte",         "1. Pi", Stab.get("Piltestab")));
Patrulje.define(new Patrulje(6,  "2. Pilte",         "2. Pi", Stab.get("Piltestab")));
Patrulje.define(new Patrulje(7,  "1. Væbnere",       "1. Væ", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(8,  "2. Væbnere",       "2. Væ", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(9,  "1. Seniorvæbnere", "1. Sv", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(10, "2. Seniorvæbnere", "2. Sv", Stab.get("Væbnerstab")));
Patrulje.define(new Patrulje(11, "?",                "?",     Stab.get("Resten")));
Patrulje.define(new Patrulje(12, "Ingen",            "-",     Stab.get("Resten")));


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

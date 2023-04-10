import m from "mithril";
import {error} from "./error";

function make_reverse(obj) {
    let reverse = {}
    for (let key in obj) {
        let value = obj[key];
        reverse[value] = key;
    }
    // obj._ = reverse;
    return reverse;
}

export enum Stab {
    // RESTEN = "Resten",
    // INDESTAB = "Indestab",
    // PILTESTAB = "Piltestab",
    // VÆBNERSTAB = "Væbnerstab",

    "Resten" = "Resten",
    "Indestab" = "Indestab",
    "Piltestab" = "Piltestab",
    "Væbnerstab" = "Væbnerstab",

}
// Stab._ = make_reverse(Stab);


export enum Patrulje {
    // NUMLINGE =        "Numlinge",
    // PUSLINGE_1 =      "1. Puslinge",
    // PUSLINGE_2 =      "2. Puslinge",
    // TUMLINGE_1 =      "1. Tumlinge",
    // TUMLINGE_2 =      "2. Tumlinge",
    // PILTE_1 =         "1. Pilte",
    // PILTE_2 =         "2. Pilte",
    // VÆBNERE_1 =       "1. Væbnere",
    // VÆBNERE_2 =       "2. Væbnere",
    // SENIORVÆBNERE_1 = "1. Seniorvæbnere",
    // SENIORVÆBNERE_2 = "2. Seniorvæbnere",
    // UKENDT =          "?",
    // INGEN =           "Ingen",

    "Numlinge" = "Numlinge",
    "1. Puslinge" = "1. Puslinge",
    "2. Puslinge" = "2. Puslinge",
    "1. Tumlinge" = "1. Tumlinge",
    "2. Tumlinge" = "2. Tumlinge",
    "1. Pilte" = "1. Pilte",
    "2. Pilte" = "2. Pilte",
    "1. Væbnere" = "1. Væbnere",
    "2. Væbnere" = "2. Væbnere",
    "1. Seniorvæbnere" = "1. Seniorvæbnere",
    "2. Seniorvæbnere" = "2. Seniorvæbnere",
    "?" = "?",
    "Ingen" = "Ingen",

}

export enum Tilstede {
    // JA = "Ja",
    // NEJ = "Nej",
    // MÅSKE = "Måske",
    // DELVIST = "Delvist",

    "Ja" = "Ja",
    "Nej" = "Nej",
    "Måske" = "Måske",
    "Delvist" = "Delvist",
}

export enum Transport {
    // FÆLLES = "Fælles",
    // EGEN = "Egen",
    // SAMKØRSEL = "Samkørsel",

    "Fælles" = "Fælles",
    "Egen" = "Egen",
    "Samkørsel" = "Samkørsel",
}

export class Deltager {
    fdfid: number;
    row: Map<string, string>;
    problemer: Array<string>;
    navn: string;
    er_voksen: boolean;
    stab: Stab;
    patrulje: Patrulje;
    uge1: boolean;
    uge2: boolean;
    dage: Array<Tilstede>;
    dage_x: Array<Tilstede>;

    ankomst_type: Transport;
    ankomst_dato: Date;
    ankomst_tidspunkt: number | null;
    afrejse_type: Transport;
    afrejse_dato: Date;
    afrejse_tidspunkt: number | null;

}

export class DeltagereState {
    deltagere: Array<Deltager>
    constructor() {
        this.deltagere = [];
        // @ts-ignore
        window.deltagere = this;
    }

    public download() {
        return m.request({
            method: "GET",
            url: "/api/deltagere/list",
            withCredentials: true,
        }).catch((e) => {
            error(e)
        }).then((result: Array<Deltager>) => {
            this.deltagere = result
            for (let deltager of this.deltagere) {
                deltager.ankomst_dato = new Date(deltager.ankomst_dato);
                deltager.afrejse_dato = new Date(deltager.afrejse_dato);
            }
        });
    }
}
export let DELTAGERE_STATE = new DeltagereState();
// export DELTAGERE_STATE;

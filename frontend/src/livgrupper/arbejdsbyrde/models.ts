import {Gruppe} from "src/grupper/model_gruppe";

export class ModelArbejdsbyrdeBesvarelse {
    id: number | null;
    grupper: Array<{"gruppe": string, "før": number | null, "under": number | null, "erfaring": boolean | null}>;
    vægtning: number | null;
}


export interface ModelArbejdsbyrde {
    // gruppe: string;
    gruppe: Gruppe;
    besvarelser: Array<{før: number | null, under: number | null, erfaring: boolean}>;
    // før: Array<number>;
    // under: Array<number>;
    // avgFør: number;
    // avgUnder: number;
    histogramFør: Array<{x: number, y: number}>;
    histogramUnder: Array<{x: number, y: number}>;
    score: number;
}

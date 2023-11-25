interface ModelArbejdsbyrdeBesvarelse {
    id: number | null;
    grupper: Array<{"gruppe": string, "før": number | null, "under": number | null, "erfaring": boolean | null}>;
    vægtning: number | null;
}


interface ModelArbejdsbyrde {
    // gruppe: string;
    gruppe: Gruppe;
    besvarelser: Array<{før: number | null, under: number | null, erfaring: boolean}>;
    før: Array<number>;
    under: Array<number>;
    avgFør: number;
    avgUnder: number;
    score: number;
}

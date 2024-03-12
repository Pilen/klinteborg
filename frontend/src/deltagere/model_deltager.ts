import {Køn, Stab, Patrulje, Tilstede, Transport} from "src/definitions";

export class Deltager {
    fdfid: number;
    row: Map<string, string>;
    tilmeldt_dato: Date;
    sidst_ændret_dato: Date;
    problemer: Array<string>;
    navn: string;
    gammelt_medlemsnummer: number;
    fødselsdato: Date | null;
    adresse: string;
    telefon: string;
    pårørende: Array<any>
    er_voksen: boolean;
    køn: Køn;
    stab: Stab;
    patrulje: Patrulje;
    bordhold_uge1: number | null;
    bordhold_uge2: number | null;
    uge1: boolean;
    uge2: boolean;
    dage: Array<Tilstede>;
    dage_x: Array<Tilstede>;
    upræcis_periode: boolean;

    ankomst_type: Transport;
    ankomst_dato: Date;
    ankomst_tidspunkt: number | null;
    afrejse_type: Transport;
    afrejse_dato: Date;
    afrejse_tidspunkt: number | null;
}

import m from "mithril";
import {error} from "./error";
import {Køn, Stab, Patrulje, Tilstede, Transport} from "./definitions";

export class Deltager {
    fdfid: number;
    row: Map<string, string>;
    problemer: Array<string>;
    navn: string;
    gammelt_medlemsnummer: number;
    fødselsdato: Date | null;
    adresse: str;
    telefon: str;
    pårørende: List<Any>
    er_voksen: boolean;
    køn: Køn;
    stab: Stab;
    patrulje: Patrulje;
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
                // @ts-ignore
                deltager.stab = Stab.get(deltager.stab);
                // @ts-ignore
                deltager.patrulje = Patrulje.get(deltager.patrulje);
                deltager.køn = Køn.get(deltager.row["Køn"]);
                deltager.fødselsdato = deltager.fødselsdato ? new Date(deltager.fødselsdato) : null;
                deltager.ankomst_dato = deltager.ankomst_dato ? new Date(deltager.ankomst_dato) : null;
                deltager.afrejse_dato = deltager.afrejse_dato ? new Date(deltager.afrejse_dato) : null;
            }
        });
    }
}
export let DELTAGERE_STATE = new DeltagereState();
// export DELTAGERE_STATE;

import m from "mithril";
import {error} from "./error";
import {Køn, KØN, Stab, STAB, Patrulje, PATRULJE, Tilstede, Transport} from "./definitions";

export class Deltager {
    fdfid: number;
    row: Map<string, string>;
    problemer: Array<string>;
    navn: string;
    er_voksen: boolean;
    køn: Køn;
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
                // @ts-ignore
                deltager.stab = STAB[deltager.stab];
                // @ts-ignore
                deltager.patrulje = PATRULJE[deltager.patrulje];
                deltager.køn = KØN[deltager.row["Køn"]];
                deltager.ankomst_dato = new Date(deltager.ankomst_dato);
                deltager.afrejse_dato = new Date(deltager.afrejse_dato);
            }
        });
    }
}
export let DELTAGERE_STATE = new DeltagereState();
// export DELTAGERE_STATE;

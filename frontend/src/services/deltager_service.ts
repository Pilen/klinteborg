import m from "mithril";
import {error} from "../error";
import {Køn, Stab, Patrulje, Tilstede, Transport} from "../definitions";

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

class DeltagerService {
    _deltagere: Array<Deltager> | undefined;
    _deltager_by_fdfid: Map<number, Deltager> | undefined;

    public isReady() {
        return this._deltagere !== undefined;
    }

    public downloadDeltagere() {
        return m.request({
            method: "GET",
            url: "/api/deltagere/all",
            withCredentials: true,
        }).catch((e) => {
            error(e)
        }).then((result: Array<Deltager>) => {
            this._deltagere = result
            this._deltager_by_fdfid = new Map();
            for (let deltager of this._deltagere) {
                // @ts-ignore
                deltager.stab = Stab.get(deltager.stab);
                // @ts-ignore
                deltager.patrulje = Patrulje.get(deltager.patrulje);
                deltager.køn = Køn.get(deltager.row["Køn"]);
                deltager.tilmeldt_dato = new Date(deltager.tilmeldt_dato);
                deltager.sidst_ændret_dato = new Date(deltager.sidst_ændret_dato);
                deltager.fødselsdato = deltager.fødselsdato ? new Date(deltager.fødselsdato) : null;
                deltager.ankomst_dato = deltager.ankomst_dato ? new Date(deltager.ankomst_dato) : null;
                deltager.afrejse_dato = deltager.afrejse_dato ? new Date(deltager.afrejse_dato) : null;

                this._deltager_by_fdfid.set(deltager.fdfid, deltager);
            }
        });
    }
    public deltagere() {
        if (this._deltagere === undefined) {
            this.downloadDeltagere();
            return [];
        }
        return this._deltagere;
    }

    public getDeltager(fdfid: number): Deltager {
        if (this._deltager_by_fdfid === undefined) {
            return undefined;
        }
        return this._deltager_by_fdfid.get(fdfid);
    }
}

export const DELTAGER_SERVICE = new DeltagerService();
window.DELTAGER_SERVICE = DELTAGER_SERVICE;

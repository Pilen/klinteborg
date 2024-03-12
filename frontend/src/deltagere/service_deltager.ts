import m from "mithril";
import {error} from "src/error";
import {Køn, Stab, Patrulje, Tilstede, Transport} from "src/definitions";


class ServiceDeltager {
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

export const SERVICE_DELTAGER = new ServiceDeltager();

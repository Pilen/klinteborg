import m from "mithril";
import {error} from "../error";

class Gruppe{
    gruppe: string;
    type: string;
    beskrivelse: string;
    minimum_antal: number | null;
    maximum_antal: number | null;
    medlemmer: Array<{"fdfid": number, "tovholder": boolean}>;
}

class GruppeService {
    _grupper: Array<Gruppe> | undefined;

    public downloadGrupper() {
        return m.request({
            method: "GET",
            url: "/api/grupper/all",
            withCredentials: true,
        }).catch((e) => {
            error(e)
        }).then((result: Array<Gruppe>) => {
            this._grupper = result;
        });
    }

    public grupper() {
        if (this._grupper === undefined) {
            this.downloadGrupper();
            return [];
        }
        return this._grupper;
    }

    public setTovholder(gruppe: string, fdfid: number, isTovholder: boolean) {
        return m.request({
            method: "POST",
            url: "/api/grupper/set-tovholder",
            withCredentials: true,
            body: {gruppe: gruppe.gruppe, fdfid: fdfid, is_tovholder: isTovholder},
        }).then((result) => {
            this.downloadGrupper();
        });
    }

}


export const GRUPPE_SERVICE = new GruppeService();

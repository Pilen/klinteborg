import m from "mithril";
import {error} from "src/error";

class ServiceGruppe {
    _grupper: Array<Gruppe> | undefined;

    public isReady() {
        return this._grupper !== undefined;
    }

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
            return undefined;
        }
        return this._grupper;
    }

    public addPerson(gruppe: string, fdfid: number) {
        return m.request({
            method: "POST",
            url: "/api/grupper/add-person",
            withCredentials: true,
            body: {gruppe: gruppe, fdfid: fdfid},
        }).catch((e) => {
            error(e)
        }).then((result) => {
            this.downloadGrupper();
        });
    }

    public removePerson(gruppe: string, fdfid: number) {
        return m.request({
            method: "POST",
            url: "/api/grupper/remove-person",
            withCredentials: true,
            body: {gruppe: gruppe, fdfid: fdfid},
        }).catch((e) => {
            error(e)
        }).then((result) => {
            this.downloadGrupper();
        });
    }

    public setTovholder(gruppe: string, fdfid: number, isTovholder: boolean) {
        return m.request({
            method: "POST",
            url: "/api/grupper/set-tovholder",
            withCredentials: true,
            body: {gruppe: gruppe, fdfid: fdfid, is_tovholder: isTovholder},
        }).catch((e) => {
            error(e)
        }).then((result) => {
            this.downloadGrupper();
        });
    }

}
export const SERVICE_GRUPPE = new ServiceGruppe();


class ServiceGruppe2 {
    apiStreamGrupper = new ApiStream<Aray<Gruppe>>()
        .get("/api/grupper/all");

    apiAddPerson = new Api()
        .post("/api/grupper/add-person")
        .then(this.apiStreamGrupper);

    apiRemovePerson = new Api()
        .post("/api/grupper/remove-person")
        .then(this.apiStreamGrupper);

    apiSetTovholder = new Api()
        .post("/api/grupper/set-tovholder")
        .then(this.apiStreamGrupper);

    public grupper() {
        return this.apiStreamGrupper.stream();
    }

    public addPerson(gruppe: string, fdfid: number) {
        return this.apiAddPerson.request({gruppe: gruppe, fdfid: fdfid})
    }

    public removePerson(gruppe: string, fdfid: number) {
        return this.apiRemovePerson.request({gruppe: gruppe, fdfid: fdfid})
    }

    public setTovholder(gruppe: string, fdfid: number, isTovholder: boolean) {
        this.setTovholder.request({gruppe: gruppe, fdfid: fdfid, is_tovholder: isTovholder});
    }

}

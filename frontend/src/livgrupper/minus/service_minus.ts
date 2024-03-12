import m from "mithril";
import {error} from "src/error";

class ServiceMinus {
    _grupperGivingMinus: Set<string> | undefined;

    public isReady() {
        return this._grupperGivingMinus !== undefined;
    }

    public downloadGrupperGivingMinus() {
        return m.request({
            method: "GET",
            url: "/api/minus/grupper-giving-minus",
            withCredentials: true,
        }).catch((e) => {
            error(e)
        }).then((result: Array<string>) => {
            this._grupperGivingMinus = new Set(result);
        });
    }

    public grupperGivingMinus() {
        if (this._grupperGivingMinus === undefined) {
            this.downloadGrupperGivingMinus();
            return undefined;
        }
        return this._grupperGivingMinus;
    }

    public setGruppeGivingMinus(gruppe: string, minus: boolean) {
        return m.request({
            method: "POST",
            url: "/api/minus/set-gruppe-giving-minus",
            withCredentials: true,
            body: {gruppe: gruppe, minus: minus},
        }).catch((e) => {
            error(e)
        }).then((result) => {
            this.downloadGrupperGivingMinus();
        });
    }

            // public saveBesvarelse(besvarelse: LivgrupperMinusBesvarelse) {

    // }
    // public makeBesvarelse(): LivgrupperMinusBesvarelse {
    //     if (!SERVICE_GRUPPE.isReady) {
    //         console.assert(false);
    //         return undefined;
    //     }

    // }

}

export const SERVICE_MINUS = new ServiceMinus();

import m from "mithril";
import {$it} from "src/lib/iter";

import {ModelArbejdsbyrdeBesvarelse} from "src/livgrupper/arbejdsbyrde/models";
import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {SERVICE_MINUS} from "src/minus/service_minus";
import {SERVICE_ARBEJDSBYRDE_BESVARELSE} from "src/livgrupper/arbejdsbyrde/services";


export class StateArbejdsbyrdeBesvarelse {
    besvarelse: ModelArbejdsbyrdeBesvarelse | undefined;
    loaders = [() => SERVICE_MINUS.grupperGivingMinus(),
               () => SERVICE_GRUPPE.grupper()];
    isLoaded = false;

    public load() {
        // this.besvarelse = [];
        let grupperGivingMinus = SERVICE_MINUS.grupperGivingMinus();
        let grupper = $it(SERVICE_GRUPPE.grupper())
            .filter((gruppe) => grupperGivingMinus.has(gruppe.gruppe))
            .sort("type")
            .map((gruppe) => {return {"gruppe": gruppe.gruppe, "før": null, "under": null, "erfaring": null};})
            .List();
        this.besvarelse = new ModelArbejdsbyrdeBesvarelse();
        this.besvarelse.grupper = grupper;
        this.besvarelse.vægtning = null;
        this.besvarelse.id = null;
    }

    private sanitize(value) {
        value = value.trim();
        value = parseInt(value);
        if (isNaN(value)) {
            value = "";
        }
        if (value < 0) {
            value = 0;
        }
        if (value > 10) {
            value = 10;
        }
        return value;
    }

    public update(row, field, value) {
        row[field] = this.sanitize(value);
    }

    public setVægtning(value: string) {
        this.besvarelse.vægtning = this.sanitize(value);
    }

    // public handleKey(row, field, e) {
    //     const [RETURN, UP, DOWN] = [13, 38, 40];
    //     if (e.keyCode === RETURN) {
    //         if (field === " før") {
    //             field = "under";
    //         } else if (field == "under") {
    //             field = "erfaring";
    //         }
    //     }
    // }
    public save() {
        let p = SERVICE_ARBEJDSBYRDE_BESVARELSE.save(this.besvarelse);
        p.then(() => {
            console.log("saved")
            this.load();
            m.redraw();
        });
    }
}

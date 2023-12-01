import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";
// import {State} from "src/base";

// import {ModelArbejdsbyrde} from "src/livgrupper/arbejdsbyrde/models";
import {GRUPPE_SERVICE, Gruppe} from "src/services/gruppe_service";
import {MINUS_SERVICE} from "src/services/minus_service";
import {SERVICE_ARBEJDSBYRDE_BESVARELSE, SERVICE_CUSTOM_SCORES} from "src/livgrupper/arbejdsbyrde/services";



export class StateCustomScores {
    loaders: Array<() => any> = [
        () => MINUS_SERVICE.grupperGivingMinus(),
        () => GRUPPE_SERVICE.grupper(),
        () => SERVICE_CUSTOM_SCORES.customScores(),
    ];
    isLoaded = false;

    constructor(besvarelser) {
        this.loaders.push(() => besvarelser.isLoaded ? true : undefined);
    }
    public load() {
        // this.
    }
}


export class UiCustomScores {
    public view(vnode: m.Vnode) {

    }
}

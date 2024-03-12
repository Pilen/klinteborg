import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";


export class PageDeltagereSøg {
    public view(vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
    }
}

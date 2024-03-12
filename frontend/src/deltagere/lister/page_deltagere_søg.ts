import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {DELTAGER_SERVICE, Deltager} from "src/services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";


export class PageDeltagereSøg {
    public view(vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
    }
}

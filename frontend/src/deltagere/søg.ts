import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGER_SERVICE, Deltager} from "../services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";


export class PageDeltagereSøg {
    public view(vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
    }
}

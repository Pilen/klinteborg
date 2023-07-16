import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGERE_STATE, Deltager} from "../deltagere_state";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";


export class PageDeltagereTelefoner {
    public view(vnode: m.Vnode) {
        let content = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => !deltager.er_voksen && deltager.stab === Stab.get("Væbnerstab"))
            .sort((deltager) => [deltager.patrulje.order, deltager.navn])
            .map((deltager) =>
                [m("tbody", {style: "margin-top: 2em !important;"},
                   m("tr", {style: "margin-top: 2em !important;"},
                     m("td", {style: "font-size: 3em; padding-top: 30px !important;"}, m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                     m("td", {style: "padding-top: 30px;"}, deltager.patrulje.name)))
                ])
            .List();
        return m("table", content);
    }
}

import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {DELTAGER_SERVICE, Deltager} from "src/services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {Days} from "src/deltagere/lister/core";


export class PageDeltagereTelefoner {
    public view(vnode: m.Vnode) {
        let content = $it(DELTAGER_SERVICE.deltagere())
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

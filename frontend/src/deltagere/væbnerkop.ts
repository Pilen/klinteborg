import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGERE_STATE, Deltager} from "../deltagere_state";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";


export class PageDeltagereVæbnerkop {
    public view(vnode: m.Vnode) {
        let content = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => deltager.stab.name === "Væbnerstab" && !deltager.er_voksen)
            .sort((deltager) => [deltager.patrulje.order, deltager.navn])
            .map((deltager) =>
                m("tr",
                  m("td", m("div", {style: "border: 2px solid black; height: 1em; width: 1em;"}, "")),
                  m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                  m("td", deltager.patrulje.name)))
            .List();
        return m("div", {style: "font-size: 2em"}, "hej", m("table", m("tbody", content)));
    }
}

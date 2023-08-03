import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGERE_STATE, Deltager} from "../deltagere_state";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";


export class PageDeltagereAfkrydsning {
    public view(vnode: m.Vnode) {
        let content = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => deltager.ankomst_type === "Fælles")
            .sort((deltager) => [deltager.patrulje.order, deltager.er_voksen, deltager.navn])
            .groupRuns((deltager) => deltager.patrulje.name)
            .map((run) =>
                [m(H1, {break: true}, run[0].patrulje.name),
                 m("table",
                   $it(run).groupRuns((deltager) => deltager.er_voksen).map((subrun) =>
                       m("tbody",
                         m("tr", m("th", {colspan: 1}, subrun[0].er_voksen ? "Voksne" : "Børn"), m("th", subrun.length)),
                         $it(subrun).map((deltager) =>
                             m("tr",
                               m("td", m("div", {style: "border: 2px solid black; height: 1em; width: 1em;"}, "")),
                               m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                              )).List())).List())]).List();
        return m("div", {style: "font-size: 2em;"}, content);
    }
}
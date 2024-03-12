import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";


export class PageDeltagereAfkrydsning {
    public view(vnode: m.Vnode) {
        let content = $it(SERVICE_DELTAGER.deltagere())
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

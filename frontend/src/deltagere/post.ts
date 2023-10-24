import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGER_SERVICE, Deltager} from "../services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";

export class PageDeltagerePost {
    public view(vnode: m.Vnode<{er_voksen: boolean}>) {
        let deltagere = $it(DELTAGER_SERVICE.deltagere())
            .filter((deltager) => deltager.bordhold_uge2)
            .sort((deltager) => [deltager.navn])
            .groupRuns((deltager) => deltager.navn.substring(0, 1))
            .map((run) =>
                m("tbody",
                  $it(run)
                      .map((deltager) =>
                          m("tr",
                            m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                            m("td", deltager.patrulje.abbreviation),
                            m("td", deltager.bordhold_uge1),
                            m("td", deltager.bordhold_uge2),
                            m("td", m(Days, {days: deltager.dage})),
                            m("td", deltager.ankomst_tidspunkt),
                            m("td", deltager.afrejse_tidspunkt),
                           ))
                      .List()
                 ))
            .List()
        return m("table",
                 m("thead",
                   m("tr",
                     m("th", m("div", {style: "writing-mode: vertical-lr;"}, "Navn")),
                     m("th", m("div", {style: "writing-mode: vertical-lr;"}, "Patrulje")),
                     m("th", m("div", {style: "writing-mode: vertical-lr;"}, "Bordhold uge 1")),
                     m("th", m("div", {style: "writing-mode: vertical-rl;"}, "Bordhold uge 2")),
                     // m("th", "Bord-", m("br"), "hold 1"),
                     // m("th", "Bord-", m("br"), "hold 2"),
                     m("th", m("div", {style: "writing-mode: vertical-lr;"}, "Dage")),
                     m("th", m("div", {style: "writing-mode: vertical-rl;"}, "Ankomst")),
                     m("th", m("div", {style: "writing-mode: vertical-rl;"}, "Afrejse")),
                     // m("th", "Ankomst"),
                     // m("th", "Afrejse"),
                    )),
                 deltagere);

    }
}

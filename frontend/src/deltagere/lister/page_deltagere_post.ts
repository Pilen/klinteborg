import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";

export class PageDeltagerePost {
    public view(vnode: m.Vnode<{er_voksen: boolean}>) {
        let deltagere = $it(SERVICE_DELTAGER.deltagere())
            .filterValue((deltager) => deltager.bordhold_uge2)
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
                            m("td", m(UiDays, {days: deltager.dage})),
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

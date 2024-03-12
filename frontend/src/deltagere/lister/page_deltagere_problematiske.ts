import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, formatDateTime, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";


export class PageDeltagereProblematiske {
    public view(vnode: m.Vnode) {
        let problematic = $it(SERVICE_DELTAGER.deltagere())
            .filter((deltager) => deltager.problemer.length > 0)
            .sort((deltager: Deltager) => [
                deltager.er_voksen,
                deltager.patrulje.order,
                deltager.navn
            ])
            .map((deltager) =>
                [m("tr",
                   m("td", m("b", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn))),
                   m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                   m("td", deltager.patrulje.name),
                   // // m("td", deltager.køn.abbreviation),
                   // m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                   // m("td", deltager.patrulje.name),
                   // // m("td", m(UiDays, {days: deltager.dage})),
                   // m("td", deltager.uge1 ? "Ja" : "Nej"),
                   // m("td", deltager.uge2 ? "Ja" : "Nej"),
                   // m("td", deltager.ankomst_type),
                   // m("td", deltager.ankomst_dato),
                   // m("td", deltager.ankomst_tidspunkt),
                   // m("td", deltager.afrejse_type),
                   // m("td", deltager.afrejse_dato),
                   // m("td", deltager.afrejse_tidspunkt)),
                  ),
                 $it(deltager.problemer).map((problem) => m("tr",  m("td", {colspan: 3}, problem))).List(),
                ]
                )
            .List();
        return [m("p",
                  "Disse deltagere har problemer i deres tilmelding. Det kunne være modstridende informationer vedrørende deltagelse/transport i deres tilmelding.", m("br"),
                  "Dette kunne være fordi man har ændret i nogle felter efterfølgende, men ikke i alle de relaterede.", m("br"),
                  "Klik på navnet for at se de specifikke problemer."
                 ),
                m("table",
                  m("thead",
                    m("tr",
                      // m("th", "Navn"),
                      // m("th", "Køn"),
                      // m("th", "Voksen"),
                      // m("th", "Patrulje"),
                      // m("th", "Uge 1"),
                      // m("th", "Uge 2"),
                      // m("th", "Ankomst", m("br"), "type"),
                      // m("th", "Ankomst", m("br"), "dato"),
                      // m("th", "Ankomst", m("br"), "tidspunkt"),
                      // m("th", "Afrejse", m("br"), "type"),
                      // m("th", "Afrejse", m("br"), "dato"),
                      // m("th", "Afrejse", m("br"), "tidspunkt")
                     )),
                  m("tbody", problematic)),
                m(H1, "Tilmeldte / Ændringer"),
                m(Ændringer)];
    }
}


export class Ændringer {
    public view(vnode: m.Vnode) {
        let deltagere = $it(SERVICE_DELTAGER.deltagere())
            .map((deltager) => {
                if (formatDateTime(deltager.tilmeldt_dato) === formatDateTime(deltager.sidst_ændret_dato)) {
                    return [["Tilmeldt", deltager.tilmeldt_dato, deltager]];
                } else {
                    return [["Tilmeldt", deltager.tilmeldt_dato, deltager],
                            ["Ændret", deltager.sidst_ændret_dato, deltager]];
                }
            })
            .flatten()
            .sort(([event, date, deltager]) => [-date, event, deltager.navn])
        // .groupRuns(([event, date, deltager]) => formatDate(date))
            .map((x) => [x])
            .map((run) =>
                $it(run).map(([event, date, deltager]) =>
                    m("tr",
                      m("td", event),
                      m("td", formatDateTime(date)),
                      m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                     )).List())
            .List();
        return m("table",
                 m("tbody",
                   deltagere));

    }
}

import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGERE_STATE, Deltager} from "../deltagere_state";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";


export class PageDeltagereProblematiske {
    public view(vnode: m.Vnode) {
        let problematic = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => deltager.problemer.length > 0)
            .sort((deltager: Deltager) => [
                deltager.er_voksen,
                deltager.patrulje.order,
                deltager.navn
            ])
            .map((deltager) =>
                [m("tr",
                   m("th", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                   m("th", deltager.er_voksen ? "Voksen" : "Barn"),
                   m("th", deltager.patrulje.name),
                   // // m("td", deltager.køn.abbreviation),
                   // m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                   // m("td", deltager.patrulje.name),
                   // // m("td", m(Days, {days: deltager.dage})),
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
                  m("tbody", problematic))];
    }
}

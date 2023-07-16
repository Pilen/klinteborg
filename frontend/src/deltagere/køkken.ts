import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGERE_STATE, Deltager} from "../deltagere_state";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";
import {PageDeltagereFødselsdage} from "./fødselsdage";

export class PageDeltagereKøkken {
    public view (vnode: m.Vnode) {
        return [
            m(H1, "Fødselsdage"),
            m(PageDeltagereFødselsdage),
            m(H1, {break: true}, "Pr. dag"),
            m(KøkkenSummary),
            m(H1, {break: true}, "Deltagere"),
            m(H2, "Børn"),
            m(KøkkenDeltagere, {er_voksen: false}),
            m(H2, {break: true}, "Voksne"),
            m(KøkkenDeltagere, {er_voksen: true}),
        ];
    }
}
class KøkkenSummary {
    public view(vnode: m.Vnode) {
        let lookup = [
            [1, "1. Lørdag", "bordhold_uge1"],
            [1, "1. Søndag", "bordhold_uge1"],
            [1, "1. Mandag", "bordhold_uge1"],
            [1, "1. Tirsdag", "bordhold_uge1"],
            [1, "1. Onsdag", "bordhold_uge1"],
            [1, "1. Torsdag", "bordhold_uge1"],
            [1, "1. Fredag", "bordhold_uge1"],
            [2, "2. Lørdag", "bordhold_uge2"],
            [2, "2. Søndag", "bordhold_uge2"],
            [2, "2. Mandag", "bordhold_uge2"],
            [2, "2. Tirsdag", "bordhold_uge2"],
            [2, "2. Onsdag", "bordhold_uge2"],
            [2, "2. Torsdag", "bordhold_uge2"],
            [2, "2. Fredag", "bordhold_uge2"],
            [2, "3. Lørdag", "bordhold_uge2"],
        ];
        $it(lookup).map((l) =>
            l.push({
                "Spisesal total": 0,
                "Spisesal børn": 0,
                "Spisesal voksne": 0,
                "Tanteborde total": 0,
                "Tanteborde børn": 0,
                "Tanteborde voksne": 0,
                "Totalt totalt": 0,
                "Totalt børn": 0,
                "Totalt voksne": 0,
                "Unknown": 0,
            })).Go();

        let deltagere = $it(DELTAGERE_STATE.deltagere)
            .map((deltager) =>
                $it(deltager.dage)
                    .zip(lookup)
                    .map(([tilstede, [uge, dag, bordhold_attr, count]]) => {
                        if (tilstede === "Ja") {
                            count["Totalt totalt"]++;
                            if (deltager.er_voksen) {
                                count["Totalt voksne"]++;
                                if (deltager[bordhold_attr]) {
                                    count["Spisesal total"]++;
                                    count["Spisesal voksne"]++;

                                } else {
                                    count["Tanteborde total"]++;
                                    count["Tanteborde voksne"]++;
                                }
                            } else {
                                count["Totalt børn"]++;
                                if (deltager[bordhold_attr]) {
                                    count["Spisesal total"]++;
                                    count["Spisesal børn"]++;
                                } else {
                                    count["Tanteborde total"]++;
                                    count["Tanteborde børn"]++;
                                }
                            }
                        } else if (tilstede == "Nej") {
                            // Do nothing
                        } else {
                            count["Unknown"]++;
                        }
                    }).Go()
                )
            .List();
        return m("div.columns",
                 $it(lookup)
                     .groupRuns(([uge, dag, bordhold_attr, count]) => uge)
                     .map((run) =>
                         m("table",
                           m("thead",
                             m("tr",
                               m("th", ""),
                               m("th", "Totalt"),
                               m("th", "Børn"),
                               m("th", "Voksne"),
                              )),
                           $it(run)
                               .map(([uge, dag, bordhold_attr, count]) =>
                                   m("tbody",
                                     m(Tr, m("th", {colspan: 4}, dag), m("th"), m("th"), m("th")),
                                     m("tr",
                                       m("td", "Spisesal"),
                                       m("td", count["Spisesal total"]),
                                       m("td", count["Spisesal børn"]),
                                       m("td", count["Spisesal voksne"]),
                                      ),
                                     m("tr",
                                       m("td", "Tanteborde"),
                                       m("td", count["Tanteborde total"]),
                                       m("td", count["Tanteborde børn"]),
                                       m("td", count["Tanteborde voksne"])),
                                     m("tr",
                                       m("td", "Totalt"),
                                       m("td", count["Totalt totalt"]),
                                       m("td", count["Totalt børn"]),
                                       m("td", count["Totalt voksne"])),
                                     m("tr",
                                       m("td", "Unknown"),
                                       m("td", {colspan: 3}, count["Unknown"]),
                                       m("td"),
                                       m("td")),
                                    )).List()
                          ))
                     .List()
                );
    }
}


class KøkkenDeltagere {
    public view(vnode: m.Vnode<{er_voksen: boolean}>) {
        let deltagere = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => deltager.er_voksen === vnode.attrs.er_voksen)
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
                            m("td", deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"]),
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
                     m("th", m("div", {style: "writing-mode: vertical-lr;"}, "Madhensyn")),
                    )),
                 deltagere);

    }
}

import m from "mithril";
import {error} from "./error";
import {$it, Iter, foo} from "./lib/iter";
// import {Deltager} from "./deltagere_state";
// import DELTAGERE_STATE from "./deltagere_state";
import {DELTAGERE_STATE, Deltager} from "./deltagere_state";
import {Stab, Patrulje, Tilstede} from "./definitions";
import {H1, Tr} from "./utils";

class Days {
    public view(vnode: m.Vnode<{days: Array<Tilstede>}>) {
        const weekdays = [
            "1. Lørdag",
            "1. Søndag",
            "1. Mandag",
            "1. Tirsdag",
            "1. Onsdag",
            "1. Torsdag",
            "1. Fredag",
            "2. Lørdag",
            "2. Søndag",
            "2. Mandag",
            "2. Tirsdag",
            "2. Onsdag",
            "2. Torsdag",
            "2. Fredag",
            "3. Lørdag",
        ];

        let days = $it(vnode.attrs.days).zip(weekdays).map(([day, weekday]) => {
            if (day === "Ja") {
                return m("span.day-ja", {title: weekday}, "+");
            }
            if (day === "Nej") {
                return m("span.day-nej", "_");
            }
            if (day === "Måske") {
                return m("span.day-måske", "?");
            }
            if (day === "Delvist") {
                return m("span.day-delvist", "%");
            }
        }).List();
        return m("div.days",
                 days[0],
                 days[1],
                 m("span.dag-sep", ":"),
                 days[2],
                 days[3],
                 days[4],
                 days[5],
                 days[6],
                 m("span.dag-sep", ":"),
                 days[7],
                 days[8],
                 m("span.dag-sep", ":"),
                 days[9],
                 days[10],
                 days[11],
                 days[12],
                 days[13],
                 m("span.dag-sep", ":"),
                 days[14],
                );



    }
}
class ViewDeltagereTable {
    public view (vnode: m.Vnode<{stab: Stab, er_voksen: boolean, group: boolean}>) {
        let deltagere = (
            $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => (vnode.attrs.stab == null || deltager.stab === vnode.attrs.stab) && deltager.er_voksen === vnode.attrs.er_voksen)
            .sort((deltager) => [
                deltager.stab.order,
                deltager.er_voksen,
                deltager.patrulje.order,
                !(deltager.uge1 && !deltager.uge2),
                !(deltager.uge1 && deltager.uge2),
                !(!deltager.uge1 && deltager.uge2),
                deltager.køn.order,
                deltager.navn
            ])
            .groupRuns((deltager) => vnode.attrs.group && deltager.patrulje.name)
            .map((patrulje) =>
                m("tbody",
                  m(Tr,
                    vnode.attrs.group ? m("th", {colspan: 6}, patrulje[0].patrulje.name) : null,
                    // m("th"),
                    // m("th"),
                    // m("th"),
                    // m("th"),
                    // m("th"),
                   ) ,
                  $it(patrulje)
                      .map((deltager) =>
                          m("tr",
                            m("td", deltager.navn),
                            // m("td", KØN[deltager.row["Køn"]] || error(`Ukendt køn ${deltager.row["Køn"]}`)),
                            m("td", deltager.køn.abbreviation),
                            m("td", deltager.patrulje.abbreviation),
                            m("td", m(Days, {days: deltager.dage})),
                            m("td", deltager.ankomst_tidspunkt),
                            m("td", deltager.afrejse_tidspunkt),
                           )).List()))
            .List()
        )
        // let deltagere = [];
        return m("table",
                 m("thead",
                   m("tr",
                     m("th", "Navn"),
                     m("th", "Køn"),
                     m("th", "Patrulje"),
                     m("th", "Dage"),
                     m("th", "Ankomst"),
                     m("th", "Afrejse"))),
                 deltagere);
    }
}

class Summary {
    private summary(deltagere: Array<Deltager>, title: string) {
        let count = {
            "Børn": {uge1: 0, uge2: 0, total: 0},
            "Mand": {uge1: 0, uge2: 0, total: 0},
            "Kvinde": {uge1: 0, uge2: 0, total: 0},
            "Andet": {uge1: 0, uge2: 0, total: 0},
            "Ledere": {uge1: 0, uge2: 0, total: 0},
        };
        $it(deltagere)
            .map(deltager => {
                if (deltager.er_voksen) {
                    count["Ledere"].total++;
                    if (deltager.uge1) {count["Ledere"].uge1++;}
                    if (deltager.uge2) {count["Ledere"].uge2++;}
                } else {
                    count["Børn"].total++;
                    if (deltager.uge1) {count["Børn"].uge1++;}
                    if (deltager.uge2) {count["Børn"].uge2++;}
                    count[deltager.køn.name].total++;
                    if (deltager.uge1) {count[deltager.køn.name].uge1++;}
                    if (deltager.uge2) {count[deltager.køn.name].uge2++;}
                }
            })
            .Go();
        let any_andet = count["Andet"].uge1 || count["Andet"].uge2 || count["Andet"].total;
        return m("tbody",
                 m("tr", m("th", {colspan: 4}, title, ":",), m("th"), m("th"), m("th")),
                 m("tr",
                   m("td", "Børn"),
                   m("td", count["Børn"].uge1),
                   m("td", count["Børn"].uge2),
                   m("td", count["Børn"].total)),
                 m("tr",
                   m("td", "Drenge"),
                   m("td", count["Mand"].uge1),
                   m("td", count["Mand"].uge2),
                   m("td", count["Mand"].total)),
                 m("tr",
                   m("td", "Piger"),
                   m("td", count["Kvinde"].uge1),
                   m("td", count["Kvinde"].uge2),
                   m("td", count["Kvinde"].total)),
                 (any_andet ?
                     m("tr",
                       m("td", "Andet"),
                       m("td", count["Andet"].uge1),
                       m("td", count["Andet"].uge2),
                       m("td", count["Andet"].total))
                     : null),
                 m("tr",
                   m("td", "Ledere"),
                   m("td", count["Ledere"].uge1),
                   m("td", count["Ledere"].uge2),
                   m("td", count["Ledere"].total)),
                );

    }
    public view(vnode: m.Vnode<{stab: Stab}>) {

        let deltagere = $it(DELTAGERE_STATE.deltagere).filter((deltager) => vnode.attrs.stab == null || deltager.stab === vnode.attrs.stab).List();
        let by_patrulje = $it(deltagere).groupBy((deltager) => deltager.patrulje.name).sort(([patrulje, d]) => Patrulje.get(patrulje).order).map(([patrulje, d]) => this.summary(d, patrulje)).List();
        return m("table",
                 m("thead",
                   m("tr",
                     m("th", ""),
                     m("th", "Uge 1"),
                     m("th", "Uge 2"),
                     m("th", "I alt"))),
                 this.summary(deltagere, "Totalt"),
                 by_patrulje,
                );




    }
}
export class PageDeltagereIndestab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: Stab.get("Indestab"), er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab.get("Indestab"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Indestab")}),
                );
    }
}

export class PageDeltagerePiltestab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: Stab.get("Piltestab"), er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab.get("Piltestab"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Piltestab")}),
                );
    }
}

export class PageDeltagereVæbnerstab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: Stab.get("Væbnerstab"), er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab.get("Væbnerstab"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Væbnerstab")}),
                );
    }
}

export class PageDeltagereResten {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: Stab.get("Resten"), er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab.get("Resten"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Resten")}),
                );
    }
}

export class PageDeltagereAlle {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: null, er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: null, er_voksen: true, group: true}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: null}),
                );
    }
}
export class PageDeltagereMærkelige {
    public view (vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
    }
}

export class PageDeltagereSøg {
    public view (vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
    }
}

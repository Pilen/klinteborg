import m from "mithril";
import {error} from "./error";
import {$it, Iter, foo} from "./lib/iter";
// import {Deltager} from "./deltagere_state";
// import DELTAGERE_STATE from "./deltagere_state";
import {DELTAGERE_STATE, Deltager, Stab, Tilstede} from "./deltagere_state";
import {H1, Tr} from "./utils";

const KØN = {
    "Mand": "M",
    "Kvinde": "K",
    "Andet": "A",
};

const STAB_ORDER = {
    "Resten": 0,
    "Indestab": 1,
    "Piltestab": 2,
    "Væbnerstab":3,
}

const PATRULJE_ORDER = {
    "Numlinge": 0,
    "1. Puslinge": 1,
    "2. Puslinge": 2,
    "1. Tumlinge": 3,
    "2. Tumlinge": 4,
    "1. Pilte": 5,
    "2. Pilte": 6,
    "1. Væbnere": 7,
    "2. Væbnere": 8,
    "1. Seniorvæbnere": 9,
    "2. Seniorvæbnere": 10,
    "?": 11,
    "Ingen": 12,
}

const PATRULJE_ABBR = {
    "Numlinge": "Num",
    "1. Puslinge": "1. Pu",
    "2. Puslinge": "2. Pu",
    "1. Tumlinge": "1. Tu",
    "2. Tumlinge": "2. Tu",
    "1. Pilte": "1. Pi",
    "2. Pilte": "2. Pi",
    "1. Væbnere": "1. Væ",
    "2. Væbnere": "2. Væ",
    "1. Seniorvæbnere": "1. Sv",
    "2. Seniorvæbnere": "2. Sv",
    "?": "?",
    "Ingen": "",
}


const KØN_ORDER = {
    "Kvinde": 0,
    "Andet": 1,
    "Mand": 2,
}

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
                STAB_ORDER[deltager.stab],
                deltager.er_voksen,
                PATRULJE_ORDER[deltager.patrulje],
                !(deltager.uge1 && !deltager.uge2),
                !(deltager.uge1 && deltager.uge2),
                !(!deltager.uge1 && deltager.uge2),
                KØN_ORDER[deltager.row["Køn"]],
                deltager.navn
            ])
            .groupRuns((deltager) => vnode.attrs.group && deltager.patrulje)
            .map((patrulje) =>
                m("tbody",
                  m(Tr,
                    vnode.attrs.group ? m("th", {colspan: 6}, patrulje[0].patrulje) : null,
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
                            m("td", KØN[deltager.row["Køn"]] || error(`Ukendt køn ${deltager.row["Køn"]}`)),
                            m("td", PATRULJE_ABBR[deltager.patrulje]),
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
                 // m("tbody",
                 //   deltagere,
                 //  ));


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
                    count[deltager.row["Køn"]].total++;
                    if (deltager.uge1) {count[deltager.row["Køn"]].uge1++;}
                    if (deltager.uge2) {count[deltager.row["Køn"]].uge2++;}
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

        let deltagere = $it(DELTAGERE_STATE.deltagere).filter((deltager) => vnode.attrs.stab == null || deltager.stab === vnode.attrs.stab).List()
        let by_patrulje = $it(deltagere).groupBy("patrulje").sort(([patrulje, d]) => PATRULJE_ORDER[patrulje]).map(([patrulje, d]) => this.summary(d, patrulje)).List();
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
                 m(ViewDeltagereTable, {stab: Stab["Indestab"], er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab["Indestab"], er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab["Indestab"]}),
                );
    }
}

export class PageDeltagerePiltestab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: Stab["Piltestab"], er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab["Piltestab"], er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab["Piltestab"]}),
                );
    }
}

export class PageDeltagereVæbnerstab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: Stab["Væbnerstab"], er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab["Væbnerstab"], er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab["Væbnerstab"]}),
                );
    }
}

export class PageDeltagereResten {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(ViewDeltagereTable, {stab: Stab["Resten"], er_voksen: false, group: true}),
                 m(H1, "Ledere"),
                 m(ViewDeltagereTable, {stab: Stab["Resten"], er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab["Resten"]}),
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

import m from "mithril";
import {error} from "./error";
import {$it, Iter, foo} from "./lib/iter";
// import {Deltager} from "./deltagere_state";
// import DELTAGERE_STATE from "./deltagere_state";
import {DELTAGERE_STATE, Deltager, Stab, Tilstede} from "./deltagere_state";

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
    "Ingen": "Ingen",
}


const KØN_ORDER = {
    "Kvinde": 0,
    "Andet": 1,
    "Mand": 2,
}


class Days {
    public view(vnode: m.Vnode<{days: Array<Tilstede>}>) {
        let days = $it(vnode.attrs.days).map((day) => {
            if (day === "Ja") {
                return m("span.day-ja", "+");
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
    public view (vnode: m.Vnode<{stab: Stab, er_voksen: boolean}>) {
        let deltagere = (
            $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => deltager.stab === vnode.attrs.stab && deltager.er_voksen === vnode.attrs.er_voksen)
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
            .map((deltager) =>
                m("tr",
                  m("td", deltager.navn),
                  m("td", KØN[deltager.row["Køn"]] || error(`Ukendt køn ${deltager.row["Køn"]}`)),
                  m("td", PATRULJE_ABBR[deltager.patrulje]),
                  m("td", m(Days, {days: deltager.dage})),
                 )).List());
        // let deltagere = [];
        return m("table",
                 m("thead",
                   m("tr",
                     m("th", "Navn"),
                     m("th", "Køn"),
                     m("th", "Patrulje"),
                     m("th", "Dage"))),
                 m("tbody",
                   deltagere,
                  ));


    }
}
export class PageDeltagereIndestab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(ViewDeltagereTable, {stab: Stab["Indestab"], er_voksen: false}),
                 m(ViewDeltagereTable, {stab: Stab["Indestab"], er_voksen: true}),
                );
    }
}

export class PageDeltagerePiltestab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(ViewDeltagereTable, {stab: Stab["Piltestab"], er_voksen: false}),
                 m(ViewDeltagereTable, {stab: Stab["Piltestab"], er_voksen: true}),
                );
    }
}

export class PageDeltagereVæbnerstab {
    public view (vnode: m.Vnode) {
        return m("div",
                 m(ViewDeltagereTable, {stab: Stab["Væbnerstab"], er_voksen: false}),
                 m(ViewDeltagereTable, {stab: Stab["Væbnerstab"], er_voksen: true}),
                );
    }
}

export class PageDeltagereResten {
    public view (vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
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

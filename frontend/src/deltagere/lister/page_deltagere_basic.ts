import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";

class UiDeltagereTable {
    public view(vnode: m.Vnode<{stab: Stab, er_voksen: boolean, group: boolean}>) {
        let deltagere = (
            $it(SERVICE_DELTAGER.deltagere())
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
                                // m("td", deltager.navn),
                                m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                                // m("td", KØN[deltager.row["Køn"]] || error(`Ukendt køn ${deltager.row["Køn"]}`)),
                                m("td", deltager.køn.abbreviation),
                                m("td", deltager.patrulje.abbreviation),
                                m("td", m(UiDays, {days: deltager.dage})),
                                m("td", deltager.ankomst_tidspunkt),
                                m("td", deltager.afrejse_tidspunkt),
                                // m("td", deltager.problemer.length > 0 ? "Problematisk" : ""),
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
        let deltagere = $it(SERVICE_DELTAGER.deltagere()).filter((deltager) => vnode.attrs.stab == null || deltager.stab === vnode.attrs.stab).List();
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
    public view(vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(UiDeltagereTable, {stab: Stab.get("Indestab"), er_voksen: false, group: true}),
                 m(H1, {break: true}, "Ledere"),
                 m(UiDeltagereTable, {stab: Stab.get("Indestab"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Indestab")}),
                );
    }
}


export class PageDeltagerePiltestab {
    public view(vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(UiDeltagereTable, {stab: Stab.get("Piltestab"), er_voksen: false, group: true}),
                 m(H1, {break: true}, "Ledere"),
                 m(UiDeltagereTable, {stab: Stab.get("Piltestab"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Piltestab")}),
                );
    }
}


export class PageDeltagereVæbnerstab {
    public view(vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(UiDeltagereTable, {stab: Stab.get("Væbnerstab"), er_voksen: false, group: true}),
                 m(H1, {break: true}, "Ledere"),
                 m(UiDeltagereTable, {stab: Stab.get("Væbnerstab"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Væbnerstab")}),
                );
    }
}


export class PageDeltagereResten {
    public view(vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(UiDeltagereTable, {stab: Stab.get("Resten"), er_voksen: false, group: true}),
                 m(H1, {break: true}, "Ledere"),
                 m(UiDeltagereTable, {stab: Stab.get("Resten"), er_voksen: true, group: false}),
                 m(H1, "Opsummering"),
                 m(Summary, {stab: Stab.get("Resten")}),
                );
    }
}


export class PageDeltagereAlle {
    public view(vnode: m.Vnode) {
        return m("div",
                 m(H1, "Børn"),
                 m(UiDeltagereTable, {stab: null, er_voksen: false, group: true}),
                 m(H1, {break: true}, "Ledere"),
                 m(UiDeltagereTable, {stab: null, er_voksen: true, group: true}),
                 m(H1, {break: true}, "Opsummering"),
                 m(Summary, {stab: null}),
                );
    }
}

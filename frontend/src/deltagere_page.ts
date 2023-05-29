import m from "mithril";
import {error} from "./error";
import {$it, Iter, foo} from "./lib/iter";
import {DELTAGERE_STATE, Deltager} from "./deltagere_state";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "./definitions";
import {H1, H2, H5, Tr, formatDate} from "./utils";


class Days {
    public view(vnode: m.Vnode<{days: Array<Tilstede>}>) {
        let days = $it(vnode.attrs.days).zip(DAYS).map(([day, weekday]) => {
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
    public view(vnode: m.Vnode<{stab: Stab, er_voksen: boolean, group: boolean}>) {
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
                                // m("td", deltager.navn),
                                m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                                // m("td", KØN[deltager.row["Køn"]] || error(`Ukendt køn ${deltager.row["Køn"]}`)),
                                m("td", deltager.køn.abbreviation),
                                m("td", deltager.patrulje.abbreviation),
                                m("td", m(Days, {days: deltager.dage})),
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
    public view(vnode: m.Vnode) {
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
    public view(vnode: m.Vnode) {
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
    public view(vnode: m.Vnode) {
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
    public view(vnode: m.Vnode) {
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
    public view(vnode: m.Vnode) {
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
    public view(vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
    }
}

export class PageDeltagereTransport {
    total: number = 0;
    table(predicate) {
        let n = 0;
        let deltagere = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => !deltager.upræcis_periode)
            .filter(predicate)
            .sideEffect((deltager) => n++)
            .sort((deltager) => [
                deltager.patrulje.order,
                deltager.er_voksen,
                deltager.navn
            ])
            .groupBy((deltager) => deltager.er_voksen ? "Voksen" : deltager.patrulje.name)
            .sort(([key, ds]) => Patrulje.get(key)?.order || 1000)
            .map(([key, ds]) =>
                m("tbody",
                  // m(Tr, m("th", {colspan: 6}, ds[0].patrulje.name)),
                  m(Tr, m("th", {colspan: 6}, key)),
                  $it(ds)
                      .map((deltager: Deltager) =>
                          m("tr",
                            m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                            // m("td", deltager.køn.abbreviation),
                            m("td", deltager.patrulje.abbreviation),
                            m("td", m(Days, {days: deltager.dage})),
                            m("td", deltager.ankomst_tidspunkt),
                            m("td", deltager.afrejse_tidspunkt),
                           ))
                      .List()))
            .List();
        this.total += n;
        return m("div",
                 "Antal: ", n,
                 m("table",
                   m("thead",
                     m("tr",
                       m("th", "Navn"),
                       m("th", "Patrulje"),
                       m("th", "Dage"),
                       m("th", "Ankomst"),
                       m("th", "Afrejse"))),
                   deltagere,
                  )
                );
    }
    egen() {
        let arrivals = $it(DELTAGERE_STATE.deltagere).filter((deltager) => !deltager.upræcis_periode && deltager.ankomst_type == "Egen").GroupBy((deltager) => deltager.ankomst_dato ? formatDate(deltager.ankomst_dato) : null);
        let departures = $it(DELTAGERE_STATE.deltagere).filter((deltager) => !deltager.upræcis_periode && deltager.afrejse_type == "Egen").GroupBy((deltager) => deltager.ankomst_dato ? formatDate(deltager.afrejse_dato) : null);
        let result = $it(DAYS)
            .zip(DATES)
            .map(([day, date]) => {
                let ar = arrivals.get(formatDate(date)) || [];
                let de = departures.get(formatDate(date)) || [];
                this.total += ar.length;
                this.total += de.length;
                let ar_table = $it(ar)
                    .sort((deltager: Deltager) => [
                        deltager.er_voksen,
                        deltager.patrulje.order,
                        deltager.navn
                    ])
                    .map((deltager: Deltager) =>
                        m("tr",
                          m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                          // m("td", deltager.køn.abbreviation),
                          m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                          m("td", deltager.patrulje.name),
                          m("td", m(Days, {days: deltager.dage})),
                          m("td", deltager.ankomst_tidspunkt),
                          m("td", deltager.afrejse_tidspunkt),
                         ))
                    .List();


                let de_table = $it(de)
                    .sort((deltager: Deltager) => [
                        deltager.er_voksen,
                        deltager.patrulje.order,
                        deltager.navn
                    ])
                    .map((deltager: Deltager) =>
                        m("tr",
                          m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                          // m("td", deltager.køn.abbreviation),
                          m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                          m("td", deltager.patrulje.name),
                          m("td", m(Days, {days: deltager.dage})),
                          m("td", deltager.ankomst_tidspunkt),
                          m("td", deltager.afrejse_tidspunkt),
                         ))
                    .List();
                return [
                    m(H2, day),
                    m(H5, "Ankomst: " + ar.length),
                    m("table", m("tbody", ar_table)),
                    m(H5, "Afrejse: " + de.length),
                    m("table", m("tbody", de_table)),
                ];
            })
            .List();
        return result;
    }

    private problematic() {
        let problematic = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager: Deltager) => deltager.upræcis_periode)
            .sort((deltager: Deltager) => [
                deltager.er_voksen,
                deltager.patrulje.order,
                deltager.navn
            ])
            .sideEffect(() => this.total += 2)
            .map((deltager: Deltager) =>
                m("tr",
                  m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                  // m("td", deltager.køn.abbreviation),
                  m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                  m("td", deltager.patrulje.name),
                  // m("td", m(Days, {days: deltager.dage})),
                  m("td", deltager.uge1 ? "Ja" : "Nej"),
                  m("td", deltager.uge2 ? "Ja" : "Nej"),
                  m("td", deltager.ankomst_type),
                  m("td", deltager.ankomst_dato),
                  m("td", deltager.ankomst_tidspunkt),
                  m("td", deltager.afrejse_type),
                  m("td", deltager.afrejse_dato),
                  m("td", deltager.afrejse_tidspunkt)
                 ))
            .List();
        if (problematic.length > 0) {
            return [m(H1, "Problematiske"),
                    m("p",
                      "Disse deltagere har modstridende informationer vedrørende deltagelse/transport i deres tilmelding.", m("br"),
                      "Dette kunne være fordi man har ændret i nogle felter efterfølgende, men ikke i alle de relaterede.", m("br"),
                      "Klik på navnet for at se de specifikke problemer."
                     ),
                    m("table",
                      m("thead",
                        m("tr",
                          m("th", "Navn"),
                          // m("th", "Køn"),
                          m("th", "Voksen"),
                          m("th", "Patrulje"),
                          m("th", "Uge 1"),
                          m("th", "Uge 2"),
                          m("th", "Ankomst", m("br"), "type"),
                          m("th", "Ankomst", m("br"), "dato"),
                          m("th", "Ankomst", m("br"), "tidspunkt"),
                          m("th", "Afrejse", m("br"), "type"),
                          m("th", "Afrejse", m("br"), "dato"),
                          m("th", "Afrejse", m("br"), "tidspunkt"))),
                      m("tbody", problematic))];
        } else {
            return [];
        }
    }

    public view(vnode: m.Vnode) {
        this.total = 0;
        let result = [
            this.problematic(),
            m(H1, "Fælles 1. Lørdag"),
            this.table((deltager) => deltager.uge1 && deltager.ankomst_type === "Fælles"),
            m(H1, "Fælles 3. Lørdag"),
            this.table((deltager) => deltager.uge2 && deltager.afrejse_type === "Fælles"),
            m(H1, "Samkørsel 2. Lørdag"),
            m(H2, "Ankomst"),
            this.table((deltager) => !deltager.uge1 && deltager.uge2 && deltager.ankomst_type === "Samkørsel"),
            m(H2, "Afrejse"),
            this.table((deltager) => deltager.uge1 && !deltager.uge2 && deltager.afrejse_type === "Samkørsel"),
            // this.table((deltager) => deltager.afrejse_type === "Samkørsel"),
            m(H1, "Egen"),
            this.egen(),
        ];
        if (this.total != DELTAGERE_STATE.deltagere.length * 2) {
            error("Intern", "Listen er ikke komplet! Ankomster + Afrejser != deltagere * 2");
        }
        return m("div", result);
    }
}


export class PageDeltagereSøg {
    public view(vnode: m.Vnode) {
        return m("div", "Der er nogen der er tilmeldt");
    }
}


export class PageDeltager {
    public view(vnode: m.Vnode<{fdfid: string}>) {
        let fdfid = Number(vnode.attrs.fdfid);
        let deltager: Deltager = DELTAGERE_STATE.deltagere.find((deltager) => deltager.fdfid === fdfid);
        if (deltager === undefined) {
            return m("div", "Ukendt person / fdfid");
        }
        document.title = `Deltager: ${deltager.navn}`;
        let problemer = $it(deltager.problemer).map((problem) => m("tr", m("td", problem))).List();
        return m("div",
                 m(H1, deltager.navn, " (", deltager.fdfid, ")"),
                 m("table",
                   m("tbody",
                     m("tr", m("th", "Detaljer")),
                     m("tr", m("td", "FDF id"), m("td", deltager.fdfid)),
                     // m("tr", m("td", ""), m("td", deltager.row)),
                     // m("tr", m("td", ""), m("td", deltager.problemer)),
                     m("tr", m("td", "Navn"), m("td", deltager.navn)),
                     m("tr", m("td", "Er voksen"), m("td", deltager.er_voksen ? "Voksen" : "Barn")),
                     m("tr", m("td", "Køn"), m("td", deltager.køn.name)),
                     m("tr", m("td", "Stab"), m("td", deltager.stab.name)),
                     m("tr", m("td", "Patrulje"), m("td", deltager.patrulje.name)),
                     m("tr", m("td", "Uge 1"), m("td", deltager.uge1 ? "Ja" : "Nej")),
                     m("tr", m("td", "Uge 2"), m("td", deltager.uge2 ? "Ja" : "Nej")),
                     // m("tr", m("td", ""), m("td", deltager.dage)),
                     // m("tr", m("td", ""), m("td", deltager.dage_x)),
                     m("tr", m("td", "Ankomst type"), m("td", deltager.ankomst_type)),
                     m("tr", m("td", "Ankomst dato"), m("td", deltager.ankomst_dato ? formatDate(deltager.ankomst_dato) : "")),
                     m("tr", m("td", "Ankomst tid"), m("td", deltager.ankomst_tidspunkt)),
                     m("tr", m("td", "Afrejse type"), m("td", deltager.afrejse_type)),
                     m("tr", m("td", "Afrejse dato"), m("td", deltager.afrejse_dato ? formatDate(deltager.afrejse_dato) : "")),
                     m("tr", m("td", "Afrejse tid"), m("td", deltager.afrejse_tidspunkt)),

                     m("tr", m("td", "Dage"), m("td", m(Days, {days: deltager.dage}))),
                    )),

                 problemer.length > 0 ? m("table", m("tbody", m("tr", m("th", "Problemer")), problemer)) : null,

                 m("table",
                   m("tbody",
                     m("tr", m("th", "Rå Tilmelding")),
                     $it(TILMELING_HEADERS).map((header) => m("tr", m("td", header), m("td", deltager.row[header]))).List()
                    ))
                );
    }
}


const TILMELING_HEADERS = [
    "Deltagernavn",
    "E-mail",
    "Partner",
    "Status",
    "Vælg Barn eller Voksen",
    "Hvornår deltager du (B)?",
    "Hvornår deltager du (V)?",
    "Opgave på lejren",
    "Patrulje",
    "Patrulje Uge 1",
    "Forældre eller andre pårørende vil også gerne med",
    "Deltager du hele den valgte periode (U1)",
    "Deltager du hele den valgte periode (U2)",
    "Deltager du hele den valgte periode (B)",
    "Deltagelse Uge 1: / Lørdag 1",
    "Deltagelse Uge 1: / Søndag 1",
    "Deltagelse Uge 1: / Mandag 1",
    "Deltagelse Uge 1: / Tirsdag 1",
    "Deltagelse Uge 1: / Onsdag 1",
    "Deltagelse Uge 1: / Torsdag 1",
    "Deltagelse Uge 1: / Fredag 1",
    "Deltagelse Uge 1: / Lørdag 2",
    "Deltagelse Uge 2: / Lørdag 2",
    "Deltagelse Uge 2: / Søndag 2",
    "Deltagelse Uge 2: / Mandag 2",
    "Deltagelse Uge 2: / Tirsdag 2",
    "Deltagelse Uge 2: / Onsdag 2",
    "Deltagelse Uge 2: / Torsdag 2",
    "Deltagelse Uge 2: / Fredag 2",
    "Deltagelse Uge 2: / Lørdag 3",
    "Ankomst til lejren (U2)",
    "Ankomst til lejren (U1/B)",
    "Ankomstdato egen transport (ankomst på lejren)",
    "Ca. tidspunkt egen transport (ankomst på lejren)",
    "Hjemrejse fra lejren (U2/B)",
    "Hjemrejse fra lejren (U1)",
    "Afrejsedato egen transport (afrejser lejren)",
    "Ca. afrejse tidspunkt egen transport (afrejser lejren)",
    "Køresyge? / Ofte køresyge (opkast)",
    "Har du nogen fødevareallergier eller er vegetar så skriv det her",
    "Sygdom og medicin",
    "Tåler ikke penicillin? / Tåler ikke penicillin",
    "Tåler ikke bedøvelse? / Tåler ikke bedøvelse",
    "Stivkrampevaccination:",
    "Andre helbredsoplysninger:",
    "TUT-penge (U1)",
    "TUT-penge (U2)",
    "TUT-penge (B)",
    "TUT-penge vælg:",
    "Sangbog",
    "Voksen-oplysninger / Ønskes 2-/4-mands værelse (i stedet for sovesal)",
    "Leder-oplysninger / Tutvagt",
    "Leder-oplysninger / Bundgarnspæl",
    "Andre oplysninger",
    "Køn",
]

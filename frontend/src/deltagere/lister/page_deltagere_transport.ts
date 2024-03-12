import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";


export class PageDeltagereTransport {
    total: number = 0;
    table(predicate) {
        let n = 0;
        let deltagere = $it(SERVICE_DELTAGER.deltagere())
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
                            m("td", m(UiDays, {days: deltager.dage})),
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
        let arrivals = $it(SERVICE_DELTAGER.deltagere()).filter((deltager) => !deltager.upræcis_periode && deltager.ankomst_type == "Egen").GroupBy((deltager) => deltager.ankomst_dato ? formatDate(deltager.ankomst_dato) : null);
        let departures = $it(SERVICE_DELTAGER.deltagere()).filter((deltager) => !deltager.upræcis_periode && deltager.afrejse_type == "Egen").GroupBy((deltager) => deltager.ankomst_dato ? formatDate(deltager.afrejse_dato) : null);
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
                          m("td", m(UiDays, {days: deltager.dage})),
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
                          m("td", m(UiDays, {days: deltager.dage})),
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
        let problematic = $it(SERVICE_DELTAGER.deltagere())
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
                  // m("td", m(UiDays, {days: deltager.dage})),
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
            return [m(H1, "Problematiske (transport)"),
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
        if (this.total != SERVICE_DELTAGER.deltagere().length * 2) {
            error("Intern", "Listen er ikke komplet! Ankomster + Afrejser != deltagere * 2");
        }
        return m("div", result);
    }
}

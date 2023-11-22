import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {DELTAGER_SERVICE, Deltager} from "src/services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {Days} from "src/deltagere/core";

export class PageDeltagereLejrlæge {
    table(er_voksen: boolean) {
        let deltagere = $it(DELTAGER_SERVICE.deltagere())
            .filter((deltager) => deltager.er_voksen === er_voksen)
            .sort((deltager) => [deltager.navn])
            .groupRuns((deltager) => deltager.navn.substring(0, 1))
            .map((run, ri) =>
                $it(run)
                    .map((deltager, i) => [
                        m("div", {"class": (!(ri === 0 && i === 0) && (i % 4 === 0) ? "break" : ""), "style": "margin-top:60px;"},
                          m("h6", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                          // m("p", deltager.row["Andre oplysninger"]),
                          // m("table",
                          //   m("thead", m("tr", m("th", "Patrulje"))),
                          //   m("tbody", m("tr", m("td", deltager.patrulje.name))),
                          //   m("thead", m("tr", m("th", "Voksen"))),
                          //   m("tbody", m("tr", m("td", deltager.er_voksen ? "Voksen" : "Barn"))),
                          //   m("thead", m("tr", m("th", "Køn"))),
                          //   m("tbody", m("tr", m("td", deltager.køn.name))),
                          //   m("thead", m("tr", m("th", "Fødselsdato"))),
                          //   m("tbody", m("tr", m("td", deltager.fødselsdato ? formatDate(deltager.fødselsdato) : "?"))),
                          //   m("thead", m("tr", m("th", "Alder"))),
                          //   m("tbody", m("tr", m("td", deltager.fødselsdato ? calculateAge(deltager.fødselsdato) : "?"))),
                          //   m("thead", m("tr", m("th", "Dage"))),
                          //   m("tbody", m("tr", m("td", m(Days, {days: deltager.dage})))),
                          //   m("thead", m("tr", m("th", "Ankomst"))),
                          //   m("tbody", m("tr", m("td", deltager.ankomst_tidspunkt))),
                          //   m("thead", m("tr", m("th", "Afrejse"))),
                          //   m("tbody", m("tr", m("td", deltager.afrejse_tidspunkt))),
                          //   m("thead", m("tr", m("th", "adresse"))),
                          //   m("tbody", m("tr", m("td", deltager.adresse))),
                          //   m("thead", m("tr", m("th", "Køresyge"))),
                          //   m("tbody", m("tr", m("td", deltager.row["Køresyge? / Ofte køresyge (opkast)"]))),
                          //   m("thead", m("tr", m("th", "Fødevareallergier / vegetar"))),
                          //   m("tbody", m("tr", m("td", deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"]))),
                          //   m("thead", m("tr", m("th", "Sygdom og medicin"))),
                          //   m("tbody", m("tr", m("td", deltager.row["Sygdom og medicin"]))),
                          //   m("thead", m("tr", m("th", "Penicillin"))),
                          //   m("tbody", m("tr", m("td", deltager.row["Tåler ikke penicillin? / Tåler ikke penicillin"]))),
                          //   m("thead", m("tr", m("th", "Bedøvelse"))),
                          //   m("tbody", m("tr", m("td", deltager.row["Tåler ikke bedøvelse? / Tåler ikke bedøvelse"]))),
                          //   m("thead", m("tr", m("th", "Stivkrampevaccination"))),
                          //   m("tbody", m("tr", m("td", deltager.row["Stivkrampevaccination:"]))),
                          //   m("thead", m("tr", m("th", "Andre helbredsoplysninger"))),
                          //   m("tbody", m("tr", m("td", deltager.row["Andre helbredsoplysninger:"]))),
                          //  ),

                          // m("table",
                          //   m("tbody",
                          //     m("tr",
                          //       m("td", m("b", "Patrulje")),
                          //       m("td", deltager.patrulje.name)),
                          //     m("tr",
                          //       m("td", m("b", "Voksen")),
                          //       m("td", deltager.er_voksen ? "Voksen" : "Barn")),
                          //     m("tr",
                          //       m("td", m("b", "Køn")),
                          //       m("td", deltager.køn.name)),
                          //     m("tr",
                          //       m("td", m("b", "Fødselsdato")),
                          //       m("td", deltager.fødselsdato ? formatDate(deltager.fødselsdato) : "?")),
                          //     m("tr",
                          //       m("td", m("b", "Alder")),
                          //       m("td", deltager.fødselsdato ? calculateAge(deltager.fødselsdato): "?")),
                          //     m("tr",
                          //       m("td", m("b", "Dage")),
                          //       m("td", m(Days, {days: deltager.dage}))),
                          //     m("tr",
                          //       m("td", m("b", "Ankomst")),
                          //       m("td", deltager.ankomst_dato ? formatDate(deltager.ankomst_dato) : "", deltager.ankomst_tidspunkt)),
                          //     m("tr",
                          //       m("td", m("b", "Afrejse")),
                          //       m("td", deltager.afrejse_dato ? formatDate(deltager.afrejse_dato) : "", deltager.afrejse_tidspunkt)),
                          //     m("tr",
                          //       m("td", m("b", "adresse")),
                          //       m("tr", m("td", deltager.adresse))),
                          //     m("tr",
                          //       m("td", m("b", "Køresyge")),
                          //       m("td", deltager.row["Køresyge? / Ofte køresyge (opkast)"])),
                          //     m("tr",
                          //       m("td", m("b", "Fødevareallergier / vegetar")),
                          //       m("td", deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"])),
                          //     m("tr",
                          //       m("td", m("b", "Sygdom og medicin")),
                          //       m("td", deltager.row["Sygdom og medicin"])),
                          //     m("tr",
                          //       m("td", m("b", "Penicillin")),
                          //       m("td", deltager.row["Tåler ikke penicillin? / Tåler ikke penicillin"])),
                          //     m("tr",
                          //       m("td", m("b", "Bedøvelse")),
                          //       m("td", deltager.row["Tåler ikke bedøvelse? / Tåler ikke bedøvelse"])),
                          //     m("tr",
                          //       m("td", m("b", "Stivkrampevaccination")),
                          //       m("td", deltager.row["Stivkrampevaccination:"])),
                          //     m("tr",
                          //       m("td", m("b", "Andre helbredsoplysninger")),
                          //       m("td", deltager.row["Andre helbredsoplysninger:"])),
                          //    )
                          //  ),



                          // m("table",
                          //   m("tbody",
                          //     m("tr",
                          //       m("td", m("b", "Patrulje")),
                          //       m("td", deltager.patrulje.name),
                          //       m("td", m("b", "Voksen")),
                          //       m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                          //       m("td", m("b", "Køn")),
                          //       m("td", deltager.køn.name)),
                          //     m("tr",
                          //       m("td", m("b", "Fødselsdato")),
                          //       m("td", deltager.fødselsdato ? formatDate(deltager.fødselsdato) : "?"),
                          //       m("td", m("b", "Alder")),
                          //       m("td", deltager.fødselsdato ? calculateAge(deltager.fødselsdato): "?"),
                          //       m("td", ""),
                          //       m("td", "")),
                          //     m("tr",
                          //       m("td", m("b", "Dage")),
                          //       m("td", m(Days, {days: deltager.dage})),
                          //       m("td", m("b", "Ankomst")),
                          //       m("td", deltager.ankomst_dato ? formatDate(deltager.ankomst_dato) : "", deltager.ankomst_tidspunkt),
                          //       m("td", m("b", "Afrejse")),
                          //       m("td", deltager.afrejse_dato ? formatDate(deltager.afrejse_dato) : "", deltager.afrejse_tidspunkt)),
                          //     m("tr",
                          //       m("td", m("b", "Adresse")),
                          //       m("td", {colspan: 5}, deltager.adresse)),
                          //     m("tr",
                          //       m("td", m("b", "Stivkrampevaccination")),
                          //       m("td", {colspan: 5}, deltager.row["Stivkrampevaccination:"])),
                          //     deltager.row["Køresyge? / Ofte køresyge (opkast)"] ?
                          //       m("tr",
                          //         m("td", m("b", "Køresyge?")),
                          //         m("td", {colspan: 5}, "Ofte køresyge (opkast)"))
                          //       : null,
                          //     deltager.row["Tåler ikke penicillin? / Tåler ikke penicillin"] ?
                          //       m("tr",
                          //         m("td", m("b", "Penicillin?")),
                          //         m("td", {colspan: 5}, "Tåler ikke penicillin"))
                          //       : null,
                          //     deltager.row["Tåler ikke bedøvelse? / Tåler ikke bedøvelse"] ?
                          //       m("tr",
                          //         m("td", m("b", "Tåler Bedøvelse?")),
                          //         m("td", {colspan: 5}, "Tåler ikke bedøvelse"))
                          //       : null,
                          //     deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"] ?
                          //       m("tr",
                          //         m("td", m("b", "Fødevareallergier / vegetar")),
                          //         m("td", {colspan: 5}, deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"]))
                          //       : null,
                          //     deltager.row["Sygdom og medicin"] ?
                          //       m("tr",
                          //         m("td", m("b", "Sygdom og medicin")),
                          //         m("td", {colspan: 5}, deltager.row["Sygdom og medicin"]))
                          //       : null,
                          //     deltager.row["Andre helbredsoplysninger:"] ?
                          //       m("tr",
                          //         m("td", m("b", "Andre helbredsoplysninger")),
                          //         m("td", {colspan: 5}, deltager.row["Andre helbredsoplysninger:"]))
                          //       : null,
                          //    )
                          //  ),








                          m("table",
                            m("tbody",
                              m("tr",
                                m("td", m("b", "Patrulje")),
                                m("td", deltager.patrulje.name),
                                m("td", m("b", "Voksen")),
                                m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                                m("td", m("b", "Køn")),
                                m("td", deltager.køn.name)),
                              m("tr",
                                m("td", deltager.bordhold_uge1 ? m("b", "Bordhold uge 1") : null),
                                m("td", deltager.bordhold_uge1 || ""),
                                m("td", deltager.bordhold_uge2 ? m("b", "Bordhold uge 2") : null),
                                m("td", deltager.bordhold_uge2 || "")),
                              m("tr",
                                m("td", m("b", "Fødselsdato")),
                                m("td", deltager.fødselsdato ? formatDate(deltager.fødselsdato) : "?"),
                                m("td", m("b", "Alder")),
                                m("td", deltager.fødselsdato ? calculateAge(deltager.fødselsdato): "?"),
                                m("td", ""),
                                m("td", "")),
                              m("tr",
                                m("td", m("b", "Dage")),
                                m("td", m(Days, {days: deltager.dage})),
                                m("td", m("b", "Ankomst")),
                                m("td", deltager.ankomst_dato ? formatDate(deltager.ankomst_dato) : "", (deltager.ankomst_tidspunkt ? ` (kl. ${deltager.ankomst_tidspunkt})` : null)),
                                m("td", m("b", "Afrejse")),
                                m("td", deltager.afrejse_dato ? formatDate(deltager.afrejse_dato) : "", (deltager.afrejse_tidspunkt ? ` (kl. ${deltager.afrejse_tidspunkt})` : null))),
                              m("tr",
                                m("td", m("b", "Adresse")),
                                m("td", {colspan: 5}, deltager.adresse)),
                             )),
                          m("table",
                            m("tbody",
                              m("tr",
                                m("td", m("b", "Stivkrampevaccination")),
                                m("td", {colspan: 5}, deltager.row["Stivkrampevaccination:"])),
                              deltager.row["Køresyge? / Ofte køresyge (opkast)"] ?
                                m("tr",
                                  m("td", m("b", "Køresyge?")),
                                  m("td", {colspan: 5}, "Ofte køresyge (opkast)"))
                                : null,
                              deltager.row["Tåler ikke penicillin? / Tåler ikke penicillin"] ?
                                m("tr",
                                  m("td", m("b", "Penicillin?")),
                                  m("td", {colspan: 5}, "Tåler ikke penicillin"))
                                : null,
                              deltager.row["Tåler ikke bedøvelse? / Tåler ikke bedøvelse"] ?
                                m("tr",
                                  m("td", m("b", "Tåler Bedøvelse?")),
                                  m("td", {colspan: 5}, "Tåler ikke bedøvelse"))
                                : null,
                              deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"] ?
                                m("tr",
                                  m("td", m("b", "Fødevareallergier / vegetar")),
                                  m("td", {colspan: 5}, deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"]))
                                : null,
                              deltager.row["Sygdom og medicin"] ?
                                m("tr",
                                  m("td", m("b", "Sygdom og medicin")),
                                  m("td", {colspan: 5}, deltager.row["Sygdom og medicin"]))
                                : null,
                              deltager.row["Andre helbredsoplysninger:"] ?
                                m("tr",
                                  m("td", m("b", "Andre helbredsoplysninger")),
                                  m("td", {colspan: 5}, deltager.row["Andre helbredsoplysninger:"]))
                                : null,
                             )),
                          deltager.pårørende.length > 0 ?
                            m("table", m("thead", m("tr", m("th", "Kontaktperson"), m("th", "email"), m("th", "telefon"))),
                              m("tbody",
                                $it(deltager.pårørende).map((p) => m("tr", m("td", p.navn), m("td", p.email), m("td", $it(p.telefon).Join(" / ")))).List()
                               ))
                            : null,
                          m("hr"),







                          // m("table",
                          //   m("thead",
                          //     m("tr",
                          //       // m("th", "Navn"),
                          //       m("th", "Patrulje"),
                          //       m("th", "Voksen"),
                          //       m("th", "Køn"),
                          //       m("th", "Fødselsdato"),
                          //       m("th", "Alder"),
                          //      )),
                          //   m("tbody",
                          //     m("tr",
                          //       // m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                          //       m("td", deltager.patrulje.name),
                          //       m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                          //       m("td", deltager.køn.name),
                          //       m("td", deltager.fødselsdato ? formatDate(deltager.fødselsdato) : "?"),
                          //       m("td", deltager.fødselsdato ? calculateAge(deltager.fødselsdato) : "?"),
                          //      )),
                          //  ),
                          // m("table",
                          //   m("thead",
                          //     m("tr",
                          //       m("th", "Dage"),
                          //       m("th", "Ankomst"),
                          //       m("th", "Afrejse"),
                          //      )),
                          //   m("tbody",
                          //     m("tr",
                          //       m("td", m(Days, {days: deltager.dage})),
                          //       m("td", deltager.ankomst_tidspunkt),
                          //       m("td", deltager.afrejse_tidspunkt),
                          //      ))),
                          // m("table",
                          //   m("thead",
                          //     m("tr",
                          //       m("th", "adresse"),
                          //      )),
                          //   m("tbody",
                          //     m("tr",
                          //       m("td", deltager.adresse),
                          //      ))),
                          // m("table",
                          //   m("thead",
                          //     m("tr",
                          //       m("th", "Køresyge"),
                          //       m("th", "Fødevareallergier / vegetar"),
                          //       m("th", "Sygdom og medicin"),
                          //       m("th", "Penicillin"),
                          //       m("th", "Bedøvelse"),
                          //       m("th", "Stivkrampevaccination"),
                          //       m("th", "Andre helbredsoplysninger"),
                          //      )),
                          //   m("tbody",
                          //     m("tr",
                          //       m("td", deltager.row["Køresyge? / Ofte køresyge (opkast)"]),
                          //       m("td", deltager.row["Har du nogen fødevareallergier eller er vegetar så skriv det her"]),
                          //       m("td", deltager.row["Sygdom og medicin"]),
                          //       m("td", deltager.row["Tåler ikke penicillin? / Tåler ikke penicillin"]),
                          //       m("td", deltager.row["Tåler ikke bedøvelse? / Tåler ikke bedøvelse"]),
                          //       m("td", deltager.row["Stivkrampevaccination:"]),
                          //       m("td", deltager.row["Andre helbredsoplysninger:"]),
                          //      ))),
                          // m("table", m("thead", m("tr", m("th", "Kontaktperson"), m("th", "email"), m("th", "telefon"))),
                          //   m("tbody",
                          //     $it(deltager.pårørende).map((p) => m("tr", m("td", p.navn), m("td", p.email), m("td", $it(p.telefon).Join(" / ")))).List()
                          //    )),
                         )
                    ])
                    .List()
                )
            .List();

        return deltagere;
    }
    public view(vnode: m.Vnode) {
        return [
            // // m(H1, "Børn"),
            // this.table(false),
            // // m(H1, {break: true}, "Voksne"),
            // m(H1, {break: true}, ""),
            // this.table(true),
            m(H1, {break: true}, ""),
            m("div", {style: "font-size: 5em;"},
              m("h1", {style: "text-align: center; padding-top: 200px;"}, "Lejrlægelisten"),
              m("h2", {style: "text-align: center; margin-top: 100px;"}, "Klinteborg 2023"),
             )
        ]
    }
}

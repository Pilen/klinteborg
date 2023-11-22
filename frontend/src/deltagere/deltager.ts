import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {DELTAGER_SERVICE, Deltager} from "src/services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES, TILMELDING_HEADERS} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, formatDateTime, calculateAge} from "src/utils";
import {Days} from "src/deltagere/core";


export class PageDeltager {
    public view(vnode: m.Vnode<{fdfid: string}>) {
        let fdfid = Number(vnode.attrs.fdfid);
        let deltager: Deltager = DELTAGER_SERVICE.deltagere().find((deltager) => deltager.fdfid === fdfid);
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
                     m("tr", m("td", "Tilmeldt"), m("td", formatDateTime(deltager.tilmeldt_dato))),
                     m("tr", m("td", "Sidst ændret"), m("td", formatDateTime(deltager.sidst_ændret_dato))),
                     m("tr", m("td", "FDF id"), m("td", deltager.fdfid)),
                     // m("tr", m("td", ""), m("td", deltager.row)),
                     // m("tr", m("td", ""), m("td", deltager.problemer)),
                     m("tr", m("td", "Navn"), m("td", deltager.navn)),
                     m("tr", m("td", "Medlemsnummer"), m("td", deltager.gammelt_medlemsnummer)),
                     m("tr", m("td", "Fødselsdato"), m("td", deltager.fødselsdato ? formatDate(deltager.fødselsdato) : "-")),
                     m("tr", m("td", "Alder"), m("td", deltager.fødselsdato ? [calculateAge(deltager.fødselsdato), " år"] : "-")),
                     m("tr", m("td", "Adresse"), m("td", deltager.adresse)),
                     m("tr", m("td", "Telefon"), m("td", deltager.telefon)),
                     m("tr", m("td", "Er voksen"), m("td", deltager.er_voksen ? "Voksen" : "Barn")),
                     m("tr", m("td", "Køn"), m("td", deltager.køn.name)),
                     m("tr", m("td", "Stab"), m("td", deltager.stab.name)),
                     m("tr", m("td", "Patrulje"), m("td", deltager.patrulje.name)),
                     m("tr", m("td", "Bordhold uge 1"), m("td", deltager.bordhold_uge1)),
                     m("tr", m("td", "Bordhold uge 2"), m("td", deltager.bordhold_uge2)),
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

                 m("table", m("thead", m("tr", m("th", "Kontaktperson"), m("th", "email"), m("th", "telefon"))),
                   m("tbody",
                     $it(deltager.pårørende).map((p) => m("tr", m("td", p.navn), m("td", p.email), m("td", $it(p.telefon).Join(" / ")))).List()
                    )),
                 problemer.length > 0 ? m("table", m("tbody", m("tr", m("th", "Problemer")), problemer)) : null,

                 m("table",
                   m("tbody",
                     m("tr", m("th", "Rå Tilmelding")),
                     $it(TILMELDING_HEADERS).map((header) => m("tr", m("td", header), m("td", deltager.row[header]))).List()
                    ))
                );
    }
}

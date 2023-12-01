import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {DELTAGER_SERVICE, Deltager} from "src/services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES, START_DATE, END_DATE} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge, calculateModa} from "src/utils";
import {Days} from "src/deltagere/core";


export class PageDeltagereFødselsdage {
    public view(vnode: m.Vnode) {
        let deltagere = $it(DELTAGER_SERVICE.deltagere())
            .filterValue((deltager) => deltager.fødselsdato)
            .filterValue((deltager) => DATES.find((date) => deltager.fødselsdato.getMonth() === date.getMonth() && deltager.fødselsdato.getDate() === date.getDate()))
            .sort((deltager) => [deltager.fødselsdato.getMonth(), deltager.fødselsdato.getDate(), -deltager.fødselsdato.getFullYear()])
            .map((deltager) =>
                m("tr",
                  m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                  m("td", deltager.køn.abbreviation),
                  m("td", deltager.patrulje.abbreviation),
                  m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                  m("td", formatDate(deltager.fødselsdato)),
                  // m("td", calculateAge(deltager.fødselsdato)),
                  m("td", START_DATE.getFullYear() - deltager.fødselsdato.getFullYear()),
                  m("td", DAYS[DATES.indexOf(DATES.find((date) => deltager.fødselsdato.getMonth() === date.getMonth() && deltager.fødselsdato.getDate() === date.getDate()))]),
                  m("td",
                    (calculateModa(deltager.fødselsdato) < calculateModa(deltager.ankomst_dato) ? "Ikke ankommet endnu" :
                        (calculateModa(deltager.fødselsdato) === calculateModa(deltager.ankomst_dato) ? `Samme dag som ankomst (kl. ${deltager.ankomst_tidspunkt})` :
                            (calculateModa(deltager.fødselsdato) > calculateModa(deltager.afrejse_dato) ? "Er taget hjem" :
                                (calculateModa(deltager.fødselsdato) === calculateModa(deltager.afrejse_dato) ? `Samme dag som afrejse (kl. ${deltager.afrejse_tidspunkt})` :
                                    "På lejren"))))),
                 ))
            .List();
        return m("table",
                 m("thead",
                   m("tr",
                     m("th", "Navn"),
                     m("th", "Køn"),
                     m("th", "Patrulje"),
                     m("th", "Voksen"),
                     m("th", "Fødselsdato"),
                     m("th", "Bliver"),
                     m("th", "Dag"),
                     m("th", "Status"),
                    )),
                 m("tbody",
                   deltagere,
                  ));
    }
}

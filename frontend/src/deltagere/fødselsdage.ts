import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {DELTAGERE_STATE, Deltager} from "../deltagere_state";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "../definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {Days} from "./core";


export class PageDeltagereFødselsdage {
    public view(vnode: m.Vnode) {
        let deltagere = $it(DELTAGERE_STATE.deltagere)
            .filter((deltager) => deltager.fødselsdato)
            .filter((deltager) => DATES.find((date) => deltager.fødselsdato.getMonth() === date.getMonth() && deltager.fødselsdato.getDate() === date.getDate()))
            .sort((deltager) => [deltager.fødselsdato.getMonth(), deltager.fødselsdato.getDate(), -deltager.fødselsdato.getYear()])
            .map((deltager) =>
                m("tr",
                  m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                  m("td", deltager.køn.abbreviation),
                  m("td", deltager.patrulje.abbreviation),
                  m("td", deltager.er_voksen ? "Voksen" : "Barn"),
                  m("td", formatDate(deltager.fødselsdato)),
                  m("td", DAYS[DATES.indexOf(DATES.find((date) => deltager.fødselsdato.getMonth() === date.getMonth() && deltager.fødselsdato.getDate() === date.getDate()))]),
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
                     m("th", "Dag"))),
                 m("tbody",
                   deltagere,
                  ));
    }
}

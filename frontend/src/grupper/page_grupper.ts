import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {Gruppe} from "src/grupper/model_gruppe";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {openModal, closeModal, ModalBase} from "src/modal";
import {Search, SearchEngine} from "src/search";

export class PageGrupper {
    public view(vnode: m.Vnode) {
        // let table_rows = $it(SERVICE_GRUPPE.grupper())
        //     .map((gruppe) => {
        //         let antal = "";
        //         if (gruppe.minimum_antal === null && gruppe.maximum_antal === null) {
        //             antal = "";
        //         } else if (gruppe.minimum_antal === null) {
        //             antal = `til ${gruppe.maximum_antal}`;
        //         } else if (gruppe.maximum_antal === null) {
        //             antal = `fra ${gruppe.minimum_antal}`;
        //         } else {
        //             antal = `${gruppe.minimum_antal}-${gruppe.maximum_antal}`;
        //         }
        //         let medlemmer = $it(gruppe.medlemmer)
        //             .map((medlem) => {
        //                 return m("li",
        //                          medlem.tovholder ? m("b", medlem.fdfid) : medlem.fdfid,
        //                         )})
        //             .List();
        //         return m("tr",
        //                  m("td", gruppe.type),
        //                  m("td", gruppe.gruppe),
        //                  m("td", gruppe.beskrivelse),
        //                  m("td", antal),
        //                  m("td", m("ul", medlemmer)),
        //                 )})
        //     .List();
        // // let table_rows = "ho"
        // return m("div",
        //          m("table",
        //            // m("thead")
        //            m("tbody",
        //              table_rows)));

        let content = $it(SERVICE_GRUPPE.grupper() ?? [])
            .mapRuns("type",
                     (gruppe) => {
                         let antal = "";
                         if (gruppe.minimum_antal === null && gruppe.maximum_antal === null) {
                             antal = "";
                         } else if (gruppe.minimum_antal === null) {
                             antal = `til ${gruppe.maximum_antal}`;
                         } else if (gruppe.maximum_antal === null) {
                             antal = `fra ${gruppe.minimum_antal}`;
                         } else {
                             antal = `${gruppe.minimum_antal}-${gruppe.maximum_antal}`;
                         }
                         let medlemmer = $it(gruppe.medlemmer)
                             .sort((medlem) => [!medlem.tovholder, SERVICE_DELTAGER.getDeltager(medlem.fdfid).navn])
                             .map((medlem) => {
                                 let deltager = SERVICE_DELTAGER.getDeltager(medlem.fdfid);
                                 let navn = deltager?.navn;
                                 return m("li",
                                          medlem.tovholder ? m("b", navn) : navn,
                                          m("a.button",
                                            {onclick: (e) => SERVICE_GRUPPE.setTovholder(gruppe.gruppe, medlem.fdfid, !medlem.tovholder)},
                                            m("span.fdficon.yellow", "\uf3d3"),
                                           ),
                                          m("a.button",
                                            {onclick: (e) => SERVICE_GRUPPE.removePerson(gruppe.gruppe, medlem.fdfid)},
                                            m("span.fdficon.red", "\uf368"),
                                           ))})
                             .List();
                         return m("tr",
                                  m("td", gruppe.gruppe),
                                  m("td", gruppe.beskrivelse),
                                  m("td", `${antal} (${medlemmer.length})`),
                                  m("td", m("ul",
                                            medlemmer,
                                            m("a.button",
                                              {onclick: (e) => {
                                                  let searchEngine = new SearchEngine(SERVICE_DELTAGER.deltagere().filter((deltager) => deltager.er_voksen),
                                                                                      (deltager) => deltager.navn,
                                                                                      (deltager) => {SERVICE_GRUPPE.addPerson(gruppe.gruppe, deltager.fdfid); closeModal()});
                                                  openModal(() => {
                                                      return [
                                                          m("h2", "Vælg gruppemedlem"),
                                                          m(Search, {engine: searchEngine, render: (deltager) => m("span", deltager.navn), autofocus: true}),
                                                      ];
                                                  }, "fitted")}},
                                              m("span.fdficon.green", "\uf39a")
                                             ))),
                                 )},
                     (grupper, type) => {
                         return m("tbody",
                                  m("tr",
                                    m("th", type),
                                    m("th", "Beskrivelse"),
                                    m("th", "Antal"),
                                    m("th", "Navne"),
                                   ),
                                  // m(Tr, m("th", {colspan: 4}, type)),
                                  grupper,
                                 )})
            .List();
        return m("table",
                 // m("thead",
                 //   m("tr",
                 //     m("th", "Udvalg / Job"),
                 //     m("th", "Beskrivelse"),
                 //     m("th", "Antal"),
                 //     m("th", "Navne"),
                 //    )),
                 content);
    }
}

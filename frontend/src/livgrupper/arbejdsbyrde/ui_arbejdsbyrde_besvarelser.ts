import m from "mithril";
import {error} from "src/error";
import {load} from "src/load";

import {SERVICE_MINUS} from "src/minus/service_minus";


export class UiArbejdsbyrdeBesvarelser {
    public view(vnode: m.Vnode<{state: StateArbejdsbyrdeBesvarelser}>) {
        let grupperGivingMinus = SERVICE_MINUS.grupperGivingMinus();
        let content = $it(vnode.attrs.state.arbejdsbyrder)
            .mapRuns((x) => x.gruppe.type,
                     (gruppe) => {
                         let results = $it(gruppe.besvarelser)
                             .map((besvarelse) => [
                                 m("td", {style: {"border-left": "1px solid black",
                                                  "text-align": "right"}},
                                   besvarelse.før),
                                 m("td", {style: {"text-align": "right"}},
                                   besvarelse.under),
                                 m("td", {style: {"text-align": "right"}},
                                   besvarelse.erfaring ? m("span.fdficon", "\uf2d2") : null),
                                 // m("td", besvarelse.erfaring ? "×" : null),
                             ])
                             .List();
                         return m("tr",
                                  m("td", gruppe.gruppe.gruppe),
                                  results,
                                 );
                     },
                     (grupper, type) => {
                         return m("tbody",
                                  m("tr",
                                    m("th", type)),
                                  grupper);
                     })
            .List()

        return m("div",
                 m("h2", "Alle besvarelser"),
                 m("table",
                   content,
                   m("tbody",
                     m("tr",
                       m("th", "Vægtning")),
                     m("tr",
                       m("td", "Vægtning"),
                       // m("td", {style: {borderRight: "2px solid black"}}, vnode.attrs.state.avgVægtning),
                       $it(vnode.attrs.state.vægtninger).map((vægtning) => m("td", {colspan: 3, style: {"border-left": "1px solid black", "text-align": "right"}}, vægtning)).List(),
                      )),
                  ));
    }
}

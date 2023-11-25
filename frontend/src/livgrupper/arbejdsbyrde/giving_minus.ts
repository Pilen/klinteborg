import m from "mithril";
import {error} from "src/error";
import {$it, Iter} from "src/lib/iter";
import {load} from "src/load";

import {GRUPPE_SERVICE, Gruppe} from "src/services/gruppe_service";
import {MINUS_SERVICE} from "src/services/minus_service";

export class UiMinusGrupper {
    public view(vnode: m.Vnode) {
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
        let grupper = GRUPPE_SERVICE.grupper()
        if (grupperGivingMinus === undefined || grupper == undefined) {
            return m("div", "loading");
        }
        let content = $it(grupper)
            .mapRuns("type",
                     (gruppe) => {
                         if (grupperGivingMinus.has(gruppe.gruppe)) {
                             return m("tr",
                                      {onclick: (e) => MINUS_SERVICE.setGruppeMinus(gruppe.gruppe, false)},
                                      m("td", m("a.button", m("b", gruppe.gruppe))),
                                      m("td", m("span.fdficon", "\uf2d2")));
                         } else {
                             return m("tr",
                                      {onclick: (e) => MINUS_SERVICE.setGruppeMinus(gruppe.gruppe, true)},
                                      m("td", m("a.button", gruppe.gruppe)),
                                      m("td", m("span", "")));
                         }
                     },
                     (grupper, type) => {
                         return m("tbody",
                                  m("tr",
                                    m("th", type),
                                    m("th", "Minus?")),
                                  grupper);
                     })
            .List();
        return m("div",
                 m("h2", "Hvilke udvalg / jobs kan give minus?"),
                 m("p",
                   "Kun udvalg / jobs der har et flueben vil blive vist og blive brugt i beregningerne til minus", m("br"),
                   "Start med at udfylde dette"),
                 m("table", content));
    }
}

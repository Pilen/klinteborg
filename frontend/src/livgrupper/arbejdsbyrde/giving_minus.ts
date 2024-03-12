import m from "mithril";
import {error} from "src/error";
import {$it, Iter} from "src/lib/iter";
import {load} from "src/load";

import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {Gruppe} from "src/grupper/model_gruppe";
import {SERVICE_MINUS} from "src/minus/service_minus";

export class UiMinusGrupper {
    public view(vnode: m.Vnode) {
        let grupperGivingMinus = SERVICE_MINUS.grupperGivingMinus();
        let grupper = SERVICE_GRUPPE.grupper()
        if (grupperGivingMinus === undefined || grupper == undefined) {
            return m("div", "loading");
        }
        let content = $it(grupper)
            .mapRuns("type",
                     (gruppe) => {
                         if (grupperGivingMinus.has(gruppe.gruppe)) {
                             return m("tr",
                                      {onclick: (e) => SERVICE_MINUS.setGruppeGivingMinus(gruppe.gruppe, false)},
                                      m("td", m("a.button", m("b", gruppe.gruppe))),
                                      m("td", m("span.fdficon", "\uf2d2")));
                         } else {
                             return m("tr",
                                      {onclick: (e) => SERVICE_MINUS.setGruppeGivingMinus(gruppe.gruppe, true)},
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

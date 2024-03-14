import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";

import {SERVICE_GIVING_MINUS} from "src/livgrupper/minus/service_giving_minus";


export class UiCustomScores {
    public view(vnode: m.Vnode<{state: StateCustomScores, besvarelser: StateArbejdsbyrdeBesvarelser}>) {
        let grupperGivingMinus = SERVICE_GIVING_MINUS.grupperGivingMinus();
        let content = $it(vnode.attrs.besvarelser.arbejdsbyrder)
            .mapRuns((arbejdsbyrde) => arbejdsbyrde.gruppe.type,
                     (arbejdsbyrde) => {
                         return m("tr",
                                  m("td", arbejdsbyrde.gruppe.gruppe),
                                  // m("td", arbejdsbyrde.score),
                                  m("td",
                                    {style: vnode.attrs.state.isAutomatic(arbejdsbyrde.gruppe.gruppe) ? null : "color: #AAAAAA"},
                                    isNaN(arbejdsbyrde.score) ? null : arbejdsbyrde.score.toFixed(4)),
                                  m("td",
                                    m("input",
                                      {oninput: (e) => vnode.attrs.state.update(arbejdsbyrde.gruppe.gruppe, e.currentTarget.value),
                                       value: vnode.attrs.state.custom.get(arbejdsbyrde.gruppe.gruppe) ?? ""})),
                                 );
                     },
                     (rows, type) => m("tbody",
                                       m("tr",
                                         m("td", type),
                                         m("td", "Beregnet"),
                                         m("td", "Manuel"),
                                        ),
                                       rows)
                    )
            .List();


        return [
            m("h2", "Manuel indstilling"),
            m("table", content),
            m("button", {onclick: (e) => vnode.attrs.state.save()}, "Gem"),
        ]
    }
}

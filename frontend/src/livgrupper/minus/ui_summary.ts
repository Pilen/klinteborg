import m from "mithril";
import {StateMinus} from "src/livgrupper/minus/state_minus";


export class UiSummary {
    public view(vnode: m.Vnode<{state: StateMinus}>) {
        let content = $it(vnode.attrs.state.deltagere)
            .map((modelDeltagerMinus) =>
                m("tr",
                  m("td", modelDeltagerMinus.deltager.navn),
                  m("td", modelDeltagerMinus.arbejdsbyrde_sum.toFixed(2)),
                  // m("td", "= ", $it(modelDeltagerMinus.arbejdsbyrder).get("score").map((score) => score.toFixed(2)).Join(" + ")),

                  m("td", modelDeltagerMinus.minus_uge1.livgruppe_periods_available),
                  m("td", modelDeltagerMinus.minus_uge1.other_periods_available),
                  m("td", modelDeltagerMinus.minus_uge1.score.toFixed(2) || "-"),
                  m("td", modelDeltagerMinus.minus_uge1.ratio.toFixed(2) || "-"),
                  m("td", modelDeltagerMinus.minus_uge1.periods || "-"),

                  m("td", modelDeltagerMinus.minus_uge2.livgruppe_periods_available),
                  m("td", modelDeltagerMinus.minus_uge2.other_periods_available),
                  m("td", modelDeltagerMinus.minus_uge2.score.toFixed(2) || "-"),
                  m("td", modelDeltagerMinus.minus_uge2.ratio.toFixed(2) || "-"),
                  m("td", modelDeltagerMinus.minus_uge2.periods || "-"),

                 ))
            .List();
        return m("div",
                 m("h2", "Detaljer"),
                 m("table",
                   m("thead",
                     m("tr",
                       m("td", ""),
                       m("td", ""),
                       m("td", {colspan: 5, style: "background: redq;"}, "Uge 1"),
                       m("td", {colspan: 5}, "Uge 2"),
                      ),
                     m("tr",
                       m("th", "Person"),
                       m("th", "Arbejdsbyrde"),
                       m("th", {title: "Tilgængelige livgruppe perioder i uge1"}, "lp1"),
                       m("th", {title: "Tilgængelige andre perioder i uge2"}, "ap1"),
                       m("th", {title: ""}, "score1"),
                       m("th", {title: ""}, "ratio1"),
                       m("th", {title: ""}, "perioder1"),

                       m("th", {title: "Tilgængelige livgruppe perioder i uge1"}, "lp2"),
                       m("th", {title: "Tilgængelige andre perioder i uge12"}, "ap2"),
                       m("th", {title: ""}, "score2"),
                       m("th", {title: ""}, "ratio2"),
                       m("th", {title: ""}, "perioder2"),
                      )),
                   m("tbody", content)),
                 m("ul",
                   $it(vnode.attrs.state.errors_uge1).map((error) => m("li", error)).List(),
                   $it(vnode.attrs.state.errors_uge2).map((error) => m("li", error)).List()));

    }
}

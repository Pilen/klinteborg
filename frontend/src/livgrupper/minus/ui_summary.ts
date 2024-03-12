import m from "mithril";
import {StateMinus} from "src/livgrupper/minus/state";

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
                  m("td", modelDeltagerMinus.minus_uge2.livgruppe_periods_available),
                  m("td", modelDeltagerMinus.minus_uge2.other_periods_available),

                  m("td", modelDeltagerMinus.minus_uge1.lscore),
                  m("td", modelDeltagerMinus.minus_uge2.lscore),
                 ))

            .List();
        return m("div",
                 m("h2", "Opgørelse for personer"),
                 m("table",
                   m("thead",
                     m("tr",
                       m("th", "Person"),
                       m("th", "Score"),
                       m("th", {title: "Tilgængelige livgruppe perioder i uge1"}, "lp1"),
                       m("th", {title: "Tilgængelige livgruppe perioder i uge1"}, "ap1"),
                       m("th", {title: "Tilgængelige andre perioder i uge2"}, "lp2"),
                       m("th", {title: "Tilgængelige andre perioder i uge12"}, "ap2"),
                      )),
                   m("tbody", content)));

    }
}

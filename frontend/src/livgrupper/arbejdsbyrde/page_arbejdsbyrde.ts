import m from "mithril";
import {error} from "src/error";
import {$it, Iter} from "src/lib/iter";
import {openModal, closeModal, ModalBase} from "src/modal";
import {load} from "src/load";

import {UiChartArbejdsbyrder} from "src/livgrupper/arbejdsbyrde/ui_chart_arbejdsbyrder";
import {StateCustomScores} from "src/livgrupper/arbejdsbyrde/state_custom_scores";
import {UiCustomScores} from "src/livgrupper/arbejdsbyrde/ui_custom_scores";
import {UiArbejdsbyrdeBesvarelse} from "src/livgrupper/arbejdsbyrde/ui_arbejdsbyrde_besvarelse";
import {StateArbejdsbyrdeBesvarelse} from "src/livgrupper/arbejdsbyrde/state_arbejdsbyrde_besvarelse";
import {StateArbejdsbyrdeBesvarelser} from "src/livgrupper/arbejdsbyrde/state_arbejdsbyrde_besvarelser";
import {UiArbejdsbyrdeBesvarelser} from "src/livgrupper/arbejdsbyrde/ui_arbejdsbyrde_besvarelser";
import {UiMinusGrupper} from "src/livgrupper/arbejdsbyrde/ui_minus_grupper";

export class PageArbejdsbyrde {
    currentBesvarelse: StateArbejdsbyrdeBesvarelse = new StateArbejdsbyrdeBesvarelse();
    besvarelser = new StateArbejdsbyrdeBesvarelser();
    customScores = new StateCustomScores();

    public view(vnode: m.Vnode) {
        return [
            load([this.customScores, this.besvarelser], m(UiCustomScores, {state: this.customScores, besvarelser: this.besvarelser})),
            m("h1", "Arbejdsbyrde besvarelser"),
            load(this.besvarelser, m(UiChartArbejdsbyrder, {state: this.besvarelser})),
            m("h2", "Manuel indstilling"),
            m("button",
              {onclick: (e) =>
                  openModal(() => {
                      return load([this.customScores, this.besvarelser],
                                  m(UiCustomScores, {state: this.customScores, besvarelser: this.besvarelser}));
                  })
              },
              "Manuel indstilling"),
            m("h2", "Opret ny"),
            m("button",
              {onclick: (e) => {
                  openModal(() => {
                      return load(this.currentBesvarelse,
                                  m(UiArbejdsbyrdeBesvarelse, {state: this.currentBesvarelse}));
                  })
              }},
              "Ny besvarelse"),
            load(this.besvarelser, m(UiArbejdsbyrdeBesvarelser, {state: this.besvarelser})),
            m(UiMinusGrupper),
            m("h2", "Spørgeskema"),
            m("a.disabled", "Åben printbart spørgeskema"), // TODO: Implement this
        ];
    }
}

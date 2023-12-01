import m from "mithril";
import {error} from "src/error";
import {$it, Iter} from "src/lib/iter";
import {openModal, closeModal, ModalBase} from "src/modal";
import {load} from "src/load";

import {UiChartArbejdsbyrder} from "src/livgrupper/arbejdsbyrde/statistics";
import {UiCustomScores} from "src/livgrupper/arbejdsbyrde/custom_scores";
import {UiArbejdsbyrdeBesvarelse, StateArbejdsbyrdeBesvarelse} from "src/livgrupper/arbejdsbyrde/besvarelse";
import {UiArbejdsbyrdeBesvarelser, StateArbejdsbyrdeBesvarelser} from "src/livgrupper/arbejdsbyrde/besvarelser";
import {UiMinusGrupper} from "src/livgrupper/arbejdsbyrde/giving_minus";

export class PageArbejdsbyrde {
    currentBesvarelse: StateArbejdsbyrdeBesvarelse = new StateArbejdsbyrdeBesvarelse();
    besvarelser = new StateArbejdsbyrdeBesvarelser();

    public view(vnode: m.Vnode) {
        return [
            // load(this.currentBesvarelse, m(UiArbejdsbyrdeBesvarelse, {state: this.currentBesvarelse})),
            // m(UiChart, {options: OPTIONS}),
            m("h1", "Arbejdsbyrde besvarelser"),
            load(this.besvarelser, m(UiChartArbejdsbyrder, {state: this.besvarelser})),
            m("h2", "Manuel indstilling"),
            m("button",
              {onclick: (e) =>
                  openModal(() => {
                      return m(UiCustomScores);
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

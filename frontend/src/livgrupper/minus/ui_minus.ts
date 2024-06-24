

export class UiMinus {
    public view (vnode: m.Vnode<{state: StateMinus}>) {
        let content = $it(vnode.attrs.state.deltagere)
            .map((modelDeltagerMinus) =>
                m("tr",
                  m("td", modelDeltagerMinus.deltager.navn),
                  m("td", m("input[type=checkbox]", {
                      checked: modelDeltagerMinus.modelDeltagerLivgruppeCount.locked,
                      onclick: (e) => modelDeltagerMinus.modelDeltagerLivgruppeCount.locked = e.currentTarget.checked})),
                  m("td", modelDeltagerMinus.minus_uge1.periods),
                  m("td", m("input", {
                      value: modelDeltagerMinus.modelDeltagerLivgruppeCount.antal_uge1,
                      // oninput: (e) =>
                  })),
                  m("td", modelDeltagerMinus.minus_uge2.periods),
                  m("td", m("input", {value: modelDeltagerMinus.modelDeltagerLivgruppeCount.antal_uge2}))))
            .List()


        // stream = new Stream(modelDeltagerMinus.modelDeltagerLivgruppeCount.antal_uge1);
        // stream.map((x) => {modelDeltagerMinus.modelDeltagerLivgruppeCount.antal_uge1 = x; return x});
        // m("td", m(NumericInput, {stream: stream})),

        //     .List();
        return m("div",
                 m("h2", "Antal livgrupper"),
                 m("button", "Gem"),
                 m("table",
                   m("thead",
                     m("tr",
                       m("th", "Person"),
                       m("th", "Låst"),
                       m("th", "Uge 1"),
                       m("th", "tildelt"),
                       m("th", "Uge 2"),
                       m("th", "tildelt"))),
                   m("tbody",
                     content)));
    }
}

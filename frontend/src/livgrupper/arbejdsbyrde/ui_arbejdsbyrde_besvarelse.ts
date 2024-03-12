import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";

export class UiArbejdsbyrdeBesvarelse {
    public view(vnode: m.Vnode<{state: StateArbejdsbyrdeBesvarelse}>) {
        let state = vnode.attrs.state;
        function formatInput(row, field) {
            let value = row[field];
            if (value === null) {
                return m("input",
                         {style: "width: 2em; text-align: center; border: 1px solid var(--korngul);",
                          value: value,
                          oninput: (e) => state.update(row, field, e.currentTarget.value)});
            } else {
                return m("input",
                         {style: "width: 2em; text-align: center; border: 1px solid var(--granit);",
                          value: value,
                          oninput: (e) => state.update(row, field, e.currentTarget.value)});
            }
        }
        function formatCheckbox(row, field) {
            let value = row[field];
            if (value === null) {
                return m("input[type=checkbox]",
                         {style: "color: var(--korngul)",
                          checked: value,
                          onclick: (e) => {row[field] = true; m.redraw();}});
            } else {
                return m("input[type=checkbox]",
                         {checked: value,
                          onclick: (e) => row[field] = !value});

            }

        }
        let content = $it(state.besvarelse.grupper)
            .map((row) =>
                m("tr",
                  m("td", row.gruppe),
                  m("td", formatInput(row, "før")),
                  m("td", formatInput(row, "under")),
                  m("td", formatCheckbox(row, "erfaring")),
        ))
            .List();
        return m("div",
                 m("div",
                   m("h2", "Arbejdsbyrde besvarelse"),
                   "Udfyld felterne med heltal 0 - 10", m("br"),
                   "Kommatal rundes af. Hvis tallet slutter på \"komma 5\", rundes mod 5", m("br"),
                  ),
                 m("table",
                   m("thead",
                     m("tr",
                       m("th", "Gruppe"),
                       m("th", "før"),
                       m("th", "under"),
                       m("th", "erfaring"),
                      )),
                   m("tbody", content)),
                 m("div",
                   m("label",
                     {"for": "vægtning"},
                     "Vægtning"),
                   m("input#vægtning",
                     {oninput: (e) => state.setVægtning(e.currentTarget.value)})),
                 m("button",
                   {onclick: (e) => state.save()},
                   "Gem"),
                );
    }
}

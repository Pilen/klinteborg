import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";

import {ModelArbejdsbyrdeBesvarelse} from "src/livgrupper/arbejdsbyrde/models";
import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {MINUS_SERVICE} from "src/services/minus_service";
import {SERVICE_ARBEJDSBYRDE_BESVARELSE} from "src/livgrupper/arbejdsbyrde/services";

export class StateArbejdsbyrdeBesvarelse {
    besvarelse: ModelArbejdsbyrdeBesvarelse | undefined;
    loaders = [() => MINUS_SERVICE.grupperGivingMinus(),
               () =>  SERVICE_GRUPPE.grupper()];
    isLoaded = false;

    public load() {
        // this.besvarelse = [];
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
        let grupper = $it(SERVICE_GRUPPE.grupper())
            .filter((gruppe) => grupperGivingMinus.has(gruppe.gruppe))
            .sort("type")
            .map((gruppe) => {return {"gruppe": gruppe.gruppe, "før": null, "under": null, "erfaring": null};})
            .List();
        this.besvarelse = new ModelArbejdsbyrdeBesvarelse();
        this.besvarelse.grupper = grupper;
        this.besvarelse.vægtning = null;
        this.besvarelse.id = null;
    }

    private sanitize(value) {
        value = value.trim();
        value = parseInt(value);
        if (isNaN(value)) {
            value = "";
        }
        if (value < 0) {
            value = 0;
        }
        if (value > 10) {
            value = 10;
        }
        return value;
    }

    public update(row, field, value) {
        row[field] = this.sanitize(value);
    }

    public setVægtning(value: string) {
        this.besvarelse.vægtning = this.sanitize(value);
    }

    // public handleKey(row, field, e) {
    //     const [RETURN, UP, DOWN] = [13, 38, 40];
    //     if (e.keyCode === RETURN) {
    //         if (field === " før") {
    //             field = "under";
    //         } else if (field == "under") {
    //             field = "erfaring";
    //         }
    //     }
    // }
    public save() {
        let p = SERVICE_ARBEJDSBYRDE_BESVARELSE.save(this.besvarelse);
        p.then(() => {
            console.log("saved")
            this.load();
            m.redraw();
        });
    }
}


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

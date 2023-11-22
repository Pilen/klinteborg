import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {GRUPPE_SERVICE, Gruppe} from "src/services/gruppe_service";
import {MINUS_SERVICE} from "src/services/minus_service";



// export class Besvarelse {
//     constructor() {

//     }
// }
// export class LivgrupperMinusSpørgeskemaBesvarelseComponent {
//     public view(vnode: m.Vnode) {

//     }
// }


// class StateMinusBesvarelse {
//     besvarelse: Array<{"gruppe": string, "før": number, "under": number, "erfaring": boolean}>;
//     vægtning: number | undefined;

//     constructor() {
//         // this.besvarelse = [];
//         let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
//         this.besvarelse = $it(GRUPPE_SERVICE.grupper())
//             .filter((gruppe) => grupperGivingMinus.has(gruppe.gruppe))
//             .sort("type")
//             .map((gruppe) => {return {"gruppe": gruppe.gruppe, "før": undefined, "under": undefined, "erfaring": undefined};})
//             .List();
//         this.index = 0;
//         this.field = 0;
//     }

//     public update(row, field, value) {
//         value = value.trim();
//         row[field] = value;
//     }

//     public setVægtning(value) {
//         value = value.trim
//         this.vægtning = value;
//     }

//     public handleKey(row, field, e) {
//         const [RETURN, UP, DOWN] = [13, 38, 40];
//         if (e.keyCode === RETURN) {
//             if (field === " før") {
//                 field = "under";
//             } else if (field == "under") {
//                 field = "erfaring";
//             }
//         }
//     }
//     public save() {
//         // MINUS_SERVICE.save(...)
//     }
// }
// const MINUS_BESVARELSE_SERVICE = new MinusBesvarelseService();
// window.MINUS_BESVARELSE_SERVICE = MINUS_BESVARELSE_SERVICE;
// class UiMinusSpørgeskemaBesvarelse {
//     public view(vnode: m.Vnode<{state: StateMinusBesvarelse}>) {
//         let state = vnode.attrs.state;
//         function formatInput(row, field) {
//             let value = row[field];
//             if (value === undefined) {
//                 return m("input",
//                          {style: "width: 2em; text-align: center; border: 1px solid var(--korngul);",
//                           value: value,
//                           oninput: (e) => state.update(row, field, e.currentTarget.value)});
//             } else {
//                 return m("input",
//                          {style: "width: 2em; text-align: center; border: 1px solid var(--granit);",
//                           value: value,
//                           oninput: (e) => state.update(row, field, e.currentTarget.value)});
//             }
//         }
//         function formatCheckbox(row, field) {
//             let value = row[field];
//             if (value === undefined) {
//                 return m("input[type=checkbox]",
//                          {style: "color: var(--korngul)",
//                           checked: value,
//                           onclick: (e) => {row[field] = true; m.redraw();}});
//             } else {
//                 return m("input[type=checkbox]",
//                          {checked: value,
//                           onclick: (e) => row[field] = !value});

//             }

//         }
//         let content = $it(state.besvarelse)
//             .map((row) =>
//                 m("tr",
//                   m("td", formatCheckbox(row, "erfaring")),
//                   m("td", row.gruppe),
//                   m("td", formatInput(row, "før")),
//                   m("td", formatInput(row, "under")),
//                   m("td", formatCheckbox(row, "erfaring")),
//         ))
//             .List();
//         return m("div",
//                  m("table",
//                    m("thead",
//                      m("tr",
//                        m("th", ""),
//                        m("th", "Gruppe"),
//                        m("th", "før"),
//                        m("th", "under"),
//                        m("th", "erfaring"),
//                       )),
//                    m("tbody", content)),
//                  m("div",
//                    m("label",
//                      {"for": "vægtning"},
//                      "Vægtning"),
//                    m("input#vægtning",
//                      {oninput: (e) => state.setVægtning(e.currentTarget.value)})),
//                  m("button",
//                    {onclick: (e) => state.save()},
//                    "Gem"),
//                 );
//     }
// }

export class PageMinus {
    // load(MINUS_SERVICE.grupperGivingMinus, GRUPPE_SERVICE.grupper).then(() => {this.state = new StateArbejdsbyrdeBesvarelse()});
    // if (this.state) {

    // }}

    stateMinusBesvarelse: StateMinusBesvarelse | undefined;
    public view(vnode: m.Vnode) {
        // if (this.stateMinusBesvarelse === undefined) {
        //     if (MINUS_SERVICE.grupperGivingMinus() !== undefined && GRUPPE_SERVICE.grupper() !== undefined) {
        //         this.stateMinusBesvarelse = new StateMinusBesvarelse();
        //     } else {
        //         return null;
        //     }
        // }
        return [
            // m(MinusGrupper),
            // m(UiMinusSpørgeskemaBesvarelse, {state: this.stateMinusBesvarelse})
        ];

        // return m("div", "hej");
    }
}

import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";
// import {State} from "src/base";

// import {ModelArbejdsbyrde} from "src/livgrupper/arbejdsbyrde/models";
import {GRUPPE_SERVICE, Gruppe} from "src/services/gruppe_service";
import {MINUS_SERVICE} from "src/services/minus_service";
import {SERVICE_ARBEJDSBYRDE_BESVARELSE, SERVICE_CUSTOM_SCORES} from "src/livgrupper/arbejdsbyrde/services";



export class StateCustomScores {
    // loaders: Array<() => any> = [
    loaders = [
        () => SERVICE_CUSTOM_SCORES.customScores()(),
    ];
    isLoaded = false;

    // custom: Map<string, number>;
    custom: Map<string, string>

    constructor() {
        // this.loaders.push(() => besvarelser.isLoaded ? true : undefined);
    }
    public load() {
        // this.custom = SERVICE_CUSTOM_SCORES.customScores()();
        this.custom = $it(SERVICE_CUSTOM_SCORES.customScores()())
            .map(([gruppe, score]) => [gruppe, "" + score])
            .Map();
    }

    public save() {
        let custom = $it(this.custom)
            .map(([gruppe, score]) => [gruppe, Number(score.replace(",", "."))])
            .filter(([gruppe, score]) => !isNaN(score))
            .Map()
        SERVICE_CUSTOM_SCORES.save(custom);
    }

    public isAutomatic(gruppe: string) {
        return !this.custom.has(gruppe);
    }

    public update(gruppe: string, value: string) {
        value = value.trim();
        if (value === "") {
            this.custom.delete(gruppe);
            return;
        }
        const re = RegExp("^(-?)([0-9]*|([0-9]+[.,][0-9]*))$");
        if (!value.match(re)) {
            return
        }
        console.log(value, "=", Number(value));
        this.custom.set(gruppe, value);
        return;
        let score = Number(value); // parseFloat allows trailing garbage
        if (isNaN(score)) {
            return;
        }
        this.custom.set(gruppe, value);
    }
}


export class UiCustomScores {
    public view(vnode: m.Vnode<{state: StateCustomScores, besvarelser: StateArbejdsbyrdeBesvarelser}>) {
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
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

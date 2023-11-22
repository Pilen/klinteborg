import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {GRUPPE_SERVICE, Gruppe} from "src/services/gruppe_service";
import {MINUS_SERVICE} from "src/services/minus_service";
import {openModal, closeModal, Modal} from "src/modal";
import {load} from "src/load";
import {UiChartBase} from "src/chart";

import ApexCharts from "apexcharts";







class MinusGrupper {
    public view(vnode: m.Vnode) {
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
        let grupper = GRUPPE_SERVICE.grupper()
        if (grupperGivingMinus === undefined || grupper == undefined) {
            return m("div", "loading");
        }
        let content = $it(grupper)
            .mapRuns("type",
                     (gruppe) => {
                         if (grupperGivingMinus.has(gruppe.gruppe)) {
                             return m("tr",
                                      {onclick: (e) => MINUS_SERVICE.setGruppeMinus(gruppe.gruppe, false)},
                                      m("td", m("a.button", m("b", gruppe.gruppe))),
                                      m("td", m("span.fdficon", "\uf2d2")));
                         } else {
                             return m("tr",
                                      {onclick: (e) => MINUS_SERVICE.setGruppeMinus(gruppe.gruppe, true)},
                                      m("td", m("a.button", gruppe.gruppe)),
                                      m("td", m("span", "")));
                         }
                     },
                     (grupper, type) => {
                         return m("tbody",
                                  m("tr",
                                    m("th", type),
                                    m("th", "Minus?")),
                                  grupper);
                     })
            .List();
        return m("div",
                 m("h2", "Hvilke udvalg / jobs kan give minus?"),
                 m("p",
                   "Kun udvalg / jobs der har et flueben vil blive vist og blive brugt i beregningerne til minus", m("br"),
                   "Start med at udfylde dette"),
                 m("table", content));
    }
}





class ModelArbejdsbyrdeBesvarelse {
    id: number | null;
    grupper: Array<{"gruppe": string, "før": number | null, "under": number | null, "erfaring": boolean | null}>;
    vægtning: number | null;
}

export class ServiceArbejdsbyrdeBesvarelse {
    _besvarelser: Array<ModelArbejdsbyrdeBesvarelse> | undefined;

    public downloadBesvarelser() {
        return m.request({
            method: "GET",
            url: "/api/minus/arbejdsbyrde/besvarelse/all",
            withCredentials: true,
        }).catch((e) => {
            error(e)
        }).then((result: Array<ModelArbejdsbyrdeBesvarelse>) => {
            this._besvarelser = result;
        });
    }
    public besvarelser() {
        if (this._besvarelser === undefined) {
            this.downloadBesvarelser();
            return undefined;
        }
        return this._besvarelser;
    }
    public save(besvarelse: ModelArbejdsbyrdeBesvarelse) {
        return m.request({
            method: "POST",
            url: "/api/minus/arbejdsbyrde/besvarelse/save",
            withCredentials: true,
            body: {id: besvarelse.id, grupper: besvarelse.grupper, vægtning: besvarelse.vægtning},
        }).catch((e) => {
            error(e);
        }).then((result) => {
            this.downloadBesvarelser();
        });
    }
}
const SERVICE_ARBEJDSBYRDE_BESVARELSE = new ServiceArbejdsbyrdeBesvarelse();

export class StateArbejdsbyrdeBesvarelse {
    besvarelse: ModelArbejdsbyrdeBesvarelse | undefined;
    loaders = [() => MINUS_SERVICE.grupperGivingMinus(),
               () =>  GRUPPE_SERVICE.grupper()];
    isLoaded = false;

    public load() {
        // this.besvarelse = [];
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
        let grupper = $it(GRUPPE_SERVICE.grupper())
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



class UiArbejdsbyrdeBesvarelse {
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








class ModelArbejdsbyrde {
    // gruppe: string;
    gruppe: Gruppe;
    besvarelser: Array<{før: number | null, under: number | null, erfaring: boolean}>;
    før: Array<number>;
    under: Array<number>;
    avgFør: number;
    avgUnder: number;
    score: number;
}

class StateArbejdsbyrdeBesvarelser {
    loaders = [() => MINUS_SERVICE.grupperGivingMinus(),
               () => GRUPPE_SERVICE.grupper(),
               () => SERVICE_ARBEJDSBYRDE_BESVARELSE.besvarelser(),
              ];
    isLoaded = false;

    arbejdsbyrder: ModelArbejdsbyrde;
    vægtninger: Array<number | null>;
    avgVægtning: number;

    private avg(values: Array<number | null>): number | null {
        let sum = 0;
        let count = 0;
        for (let value of values) {
            if (value !== null) {
                sum += value;
                count++;
            }
        }
        if (count === 0) {
            return null;
        }
        return sum / count;
    }

    private calculateScore(besvarelser: Array<{før: number | null, under: number | null, erfaring: boolean}>, avgVægtning): number {
        let weight = avgVægtning / 10.0 // 0.0 to 1.0
        let sumFør = 0;
        let countFør = 0;
        let sumUnder = 0;
        let countUnder = 0;
        for (let besvarelse of besvarelser) {
            let scale = besvarelse.erfaring ? 3 : 1
            if (besvarelse.før !== null) {
                sumFør += besvarelse.før * scale;
                countFør += scale;
            }
            if (besvarelse.under !== null) {
                sumUnder += besvarelse.under * scale;
                countUnder += scale;
            }
        }
        let avgFør = sumFør / countFør;
        let avgUnder = sumUnder / countUnder;
        let score = avgFør * (1.0 - weight) + avgUnder * weight;
        return score;
    }

    private histogram(values: Array<number>, offset: number) {
        let count = $it(values).filter((x) => x !== null).Count();
        let result =  $it.range(11).map((x) => ({x: x, y: (count.get(x) ?? 0) + offset})).List();
        return result;
    }

    public load() {
        let besvarelser = SERVICE_ARBEJDSBYRDE_BESVARELSE.besvarelser();
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
        let grupper = GRUPPE_SERVICE.grupper();

        this.vægtninger = $it(besvarelser).get("vægtning").List();
        this.avgVægtning = this.avg(this.vægtninger);

        this.arbejdsbyrder = $it(grupper)
            .filter((gruppe) => grupperGivingMinus.has(gruppe.gruppe))
            // .sort("type")
            .map((gruppe) => {
                let listFør = [];
                let listUnder = [];
                let relevant = $it(besvarelser)
                    .map((besvarelse) => {
                        let found = $it(besvarelse.grupper)
                            .filter((gruppe2) => gruppe2.gruppe === gruppe.gruppe)
                            .List();
                        let før = null;
                        let under = null;
                        let erfaring = false;
                        if (found.length == 1) {
                            før = found[0].før;
                            under = found[0].under;
                            erfaring = found[0].erfaring;
                        } else if (found.length > 1) {
                            error("Flere grupper hedder det samme");
                        }
                        listFør.push(før);
                        listUnder.push(under);
                        return {før: før, under: under, erfaring: erfaring};
                    })
                    .List();

                let arbejdsbyrde = {
                    gruppe: gruppe,
                    besvarelser: relevant,
                    // før: listFør,
                    // under: listUnder,
                    // avgFør: this.avg(listFør),
                    // avgUnder: this.avg(listUnder),
                    histogramFør: this.histogram(listFør, 0.00),
                    histogramUnder: this.histogram(listUnder, 0.1),
                    score: this.calculateScore(relevant, this.avgVægtning),
                };
                return arbejdsbyrde;
            })
            .List();
    }
}

class UiArbejdsbyrdeBesvarelser {
    public view(vnode: m.Vnode<{state: StateArbejdsbyrdeBesvarelser}>) {
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
        let content = $it(vnode.attrs.state.arbejdsbyrder)
            .filter((arbejdsbyrde) => grupperGivingMinus.has(arbejdsbyrde.gruppe.gruppe))
            .mapRuns((x) => x.gruppe.type,
                     (gruppe) => {
                         let results = $it(gruppe.besvarelser)
                             .map((besvarelse) => [
                                 m("td", {style: {"border-left": "1px solid black",
                                                  "text-align": "right"}},
                                   besvarelse.før),
                                 m("td", {style: {"text-align": "right"}},
                                   besvarelse.under),
                                 m("td", {style: {"text-align": "right"}},
                                   besvarelse.erfaring ? m("span.fdficon", "\uf2d2") : null),
                                 // m("td", besvarelse.erfaring ? "×" : null),
                             ])
                             .List();
                         return m("tr",
                                  m("td", gruppe.gruppe.gruppe),
                                  results,
                                 );
                     },
                     (grupper, type) => {
                         return m("tbody",
                                  m("tr",
                                    m("th", type)),
                                  grupper);
                     })
            .List()

        return m("div",
                 m("h2", "Alle besvarelser"),
                 m("table",
                   content,
                   m("tbody",
                     m("tr",
                       m("th", "Vægtning")),
                     m("tr",
                       m("td", "Vægtning"),
                       // m("td", {style: {borderRight: "2px solid black"}}, vnode.attrs.state.avgVægtning),
                       $it(vnode.attrs.state.vægtninger).map((vægtning) => m("td", {colspan: 3, style: {"border-left": "1px solid black", "text-align": "right"}}, vægtning)).List(),
                      )),
                  ));
    }
}

class StateChart {
    options = {
        chart: {
            type: "line",
            // width: "400px",
            width: "800px",
            toolbar: {
                show: false,
            }
        },
        series: [
            {
                name: "Før",
                data: [],
            },
            {
                name: "Under",
                data: [],
            },
        ],
        xaxis: {
            // categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
            title: {
                text: "Score",
            }
        },
        yaxis: {
            decimalsInFloat: 0,
            min: 0,
            max: 10,
            title: {
                text: "Antal stemmer",
            },
        },
        tooltip: {
            // enabled: false,
        },
    };
    chart = null;
    shown: StateArbejdsbyrdeBesvarelser;

    constructor(besvarelser: StateArbejdsbyrdeBesvarelser) {
        this.besvarelser = besvarelser;
    }

    public show(arbejdsbyrde) {
        this.shown = arbejdsbyrde;
        // this.chart.updateSeries([
        //     {name:  "Før",
        //      data: arbejdsbyrde.histogramFør},
        //     {name: "Under",
        //      data: arbejdsbyrde.histogramUnder},
        // ]);
        let options = {
            ...this.options,
            series: [
                {name:  "Før",
                 data: arbejdsbyrde.histogramFør},
                {name: "Under",
                 data: arbejdsbyrde.histogramUnder},
            ],
            title: {
                text: arbejdsbyrde.gruppe.gruppe,

            },
            annotations: {
                xaxis: [{
                    x: arbejdsbyrde.score,
                    label: {
                        text: `Score = ${arbejdsbyrde.score.toFixed(2)}`,
                        orientation: "horizontal",
                    },
                }],
            },
        };
        this.chart.updateOptions(options);

    }
}


class UiChartArbejdsbyrder {
    state: StateChart

    public oninit(vnode: m.Vnode<{state: StateArbejdsbyrdeBesvarelser}>) {
        this.state = new StateChart(vnode.attrs.state);
    }
    public view(vnode: m.Vnode) {
        let content = $it(this.state.besvarelser.arbejdsbyrder)
            .sort((arbejdsbyrde) => [arbejdsbyrde.gruppe.type, isNaN(arbejdsbyrde.score) ? 0 : arbejdsbyrde.score], true)
            .mapRuns((arbejdsbyrde) => arbejdsbyrde.gruppe.type,
                     (arbejdsbyrde) => m("tr",
                                         m("td",
                                           m("a.button",
                                             {style: arbejdsbyrde === this.state.shown ? {"font-weight": "900"} : null,
                                              onclick: () => this.state.show(arbejdsbyrde)},
                                             arbejdsbyrde.gruppe.gruppe)),
                                         m("td", isNaN(arbejdsbyrde.score) ? null : arbejdsbyrde.score.toFixed(2))),
                     (rows, type) => m("tbody", m("tr", m("td", m("h4", type)), m("td", "Score")), rows))
            .List();

        return m("div",
                 {style: {display: "flex"}},
                 m("table",
                   content,
                   m("tbody",
                     m("tr", m("th", m("h4", "Vægtning"))),
                     m("tr", m("td", "Vægtning:"), m("td", this.state.besvarelser.avgVægtning)))),
                 m(UiChartBase, {state: this.state, style: "background: red;"}),
                );
    }
}


class ServiceCustomScores {
    // _customScores: Array<{gruppe: string, score: number}>
    _customScores: Map<string, number>

    public downloadCustomScores() {
        return m.request({
            method: "GET",
            url: "/api/minus/arbejdsbyrde/custom_scores/all",
            withCredentials: true,
        }).catch((e) => {
            error(e)
        // }).then((result: Array<{gruppe: string, score: number}>) => {
        //     this._customScores = result;
        // });
        }).then((result: {gruppe: number}) => {
            let map = $it.objectEntries(result).Map();
            this._customScores = map;
        });
    }
    public customScores() {
        if (this._customScores === undefined) {
            this.downloadCustomScores();
            return undefined;
        }
        return this._customScores;
    }

    public save(gruppe: string, score: number) {
        return m.request({
            method: "POST",
            url: "/api/minus/arbejdsbyrde/custom_scores/save",
            withCredentials: true,
            body: {gruppe: gruppe, score: score},
        }).catch((e) => {
            error(e);
        }).then((result) => {
            // Do nothing
        });
    }

    public delete(gruppe) {
        return m.request({
            method: "POST",
            url: "/api/minus/arbejdsbyrde/custom_scores/delete",
            withCredentials: true,
            body: {gruppe: gruppe, score: score},
        }).catch((e) => {
            error(e);
        }).then((result) => {
            // Do nothing
        });
    }
}
const SERVICE_CUSTOM_SCORES = new ServiceCustomScores();

class StateCustomScores {
    loaders = [() => MINUS_SERVICE.grupperGivingMinus(),
               () => GRUPPE_SERVICE.grupper(),
               () => SERVICE_CUSTOM_SCORES.customScores(),
              ];
    isLoaded = false;

    constructor(besvarelser) {
        this.loaders.push(() => besvarelser.isLoaded ? true : undefined);
    }
    public load() {
        // this.
    }
}


class UiCustomScores {
    public view(vnode: m.Vnode) {

    }
}


export class PageArbejdsbyrde {
    currentBesvarelse: StateArbejdsbyrdeBesvarelse = new StateArbejdsbyrdeBesvarelse();
    besvarelser = new StateArbejdsbyrdeBesvarelser()

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
            m(MinusGrupper),
            m("h2", "Spørgeskema"),
            m("a.disabled", "Åben printbart spørgeskema"), // TODO: Implement this
        ];
    }
}

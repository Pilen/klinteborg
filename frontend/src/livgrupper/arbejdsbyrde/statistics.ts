import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";

import {UiChartBase} from "src/chart";
import ApexCharts from "apexcharts";


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


export class UiChartArbejdsbyrder {
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

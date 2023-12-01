import m from "mithril";
// @ts-ignore
import ApexCharts from "apexcharts";

import {$it, Iter, foo} from "src/lib/iter";

interface IStateChart {
    options: any;
    chart: ApexCharts | null;
}
export class UiChartBase {
    public oncreate(vnode: m.VnodeDOM<{state: IStateChart}>) {
    // public oncreate({dom, attrs}) {
    //     let vnode = {dom: dom, attrs: attrs};
        let dom = vnode.dom;
        let state = vnode.attrs.state;
        state.chart = new ApexCharts(vnode.dom, state.options);
        state.chart.render();
    }
    public onremove(vnode: m.Vnode<{state: IStateChart}>) {
        let state = vnode.attrs.state
        state.chart.destroy();
        state.chart = null;
    }
    public view(vnode: m.Vnode<{state: IStateChart}>) {
        return m("div");
    }
}

////////////////////////////////////////////////////////////////////////////////
// Example:
////////////////////////////////////////////////////////////////////////////////
//
// class StateChart {
//     options = {
//         chart: {
//             type: "line",
//         },
//         series: [
//             {
//                 name: "sales",
//                 // data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
//                 data: [],
//             },
//         ],
//         xaxis: {
//             categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
//         },
//         tooltip: {
//             enabled: false,
//         },
//     };
//     list = [];
//     chart = null;
//
//     public add() {
//         this.list.push(Math.random() * 100);
//         this.chart.updateSeries([{
//             name: "sales",
//             data: this.list,
//         }]);
//     }
//
// }
//
//
// class UiChartTest {
//     public oninit(vnode: m.Vnode) {
//         this.state = new StateChart();
//     }
//     public view(vnode: m.Vnode) {
//         return [m(UiChartBase, {state: this.state}),
//                 m("button", {onclick: () => {this.state.add();}}, "add"),
//                ];
//     }
// }
////////////////////////////////////////////////////////////////////////////////

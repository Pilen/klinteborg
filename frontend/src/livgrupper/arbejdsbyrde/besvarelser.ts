import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";

import {ModelArbejdsbyrde} from "src/livgrupper/arbejdsbyrde/models";
import {GRUPPE_SERVICE, Gruppe} from "src/services/gruppe_service";
import {MINUS_SERVICE} from "src/services/minus_service";
import {SERVICE_ARBEJDSBYRDE_BESVARELSE} from "src/livgrupper/arbejdsbyrde/services";



export class StateArbejdsbyrdeBesvarelser {
    loaders = [() => MINUS_SERVICE.grupperGivingMinus(),
               () => GRUPPE_SERVICE.grupper(),
               () => SERVICE_ARBEJDSBYRDE_BESVARELSE.besvarelser()(),
               // SERVICE_ARBEJDSBYRDE_BESVARELSE.besvarelser(), // TODO: figure out how I want this
              ];
    isLoaded = false;

    arbejdsbyrder: Array<ModelArbejdsbyrde>;
    arbejdsbyrdeMap: Map<string, ModelArbejdsbyrde>;
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
        if (isNaN(score)) {
            // score can be NaN if all all `før` or `efter` are null, meaning no replies
            score = 0;
        }
        return score;
    }

    private histogram(values: Array<number>, offset: number) {
        let count = $it(values).filter((x) => x !== null).Count();
        let result =  $it.range(11).map((x) => ({x: x, y: (count.get(x) ?? 0) + offset})).List();
        return result;
    }

    public load() {
        let besvarelser = SERVICE_ARBEJDSBYRDE_BESVARELSE.besvarelser()();
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
        this.arbejdsbyrdeMap = $it(this.arbejdsbyrder)
            .map((arbejdsbyrde) => [arbejdsbyrde.gruppe.gruppe, arbejdsbyrde])
            .Map();
    }
}


export class UiArbejdsbyrdeBesvarelser {
    public view(vnode: m.Vnode<{state: StateArbejdsbyrdeBesvarelser}>) {
        let grupperGivingMinus = MINUS_SERVICE.grupperGivingMinus();
        let content = $it(vnode.attrs.state.arbejdsbyrder)
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

import {Stab, Patrulje, Tilstede, DAYS, DATES, START_DATE} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, addDays} from "src/utils";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {Gruppe} from "src/grupper/model_gruppe";
import {StateArbejdsbyrdeBesvarelser} from "src/livgrupper/arbejdsbyrde/besvarelser";
import {StateCustomScores} from "src/livgrupper/arbejdsbyrde/custom_scores";
import {LIVGRUPPE_PERIODER, LIVGRUPPE_LEDERE} from "src/config";



class Minus {
    livgruppe_periods_available: number = 0;
    other_periods_available: number = 0;

    min_periods: number;
    max_periods: number;
    periods: number;

    lscore: number;


}
class ModelDeltagerMinus {
    deltager: Deltager;
    arbejdsbyrder: Array<ModelArbejdsbyrde> = [];
    arbejdsbyrde_sum: number;
    minus_uge1: Minus;
    minus_uge2: Minus;
    minus: Map<int, Minus>;

    // algorithmStates: Map<string, StateMinusAlgorithm> = new Map();

    constructor(deltager: Deltager, arbejdsbyrder: Array<ModelArbejdsbyrde>) {
        this.deltager = deltager;
        this.arbejdsbyrder = arbejdsbyrder;
        this.arbejdsbyrde_sum = $it(arbejdsbyrder).map((arbejdsbyrde) => arbejdsbyrde.score).Reduce((x, y) => x + y, 0);
        this.minus_uge1 = new Minus();
        this.minus_uge2 = new Minus();
        this.minus = new Map()
        this.minus.set(1, this.minus_uge1);
        this.minus.set(2, this.minus_uge2);

        this._calculate_periods_available();

    }

    private _calculate_periods_available() {
        // TODO: handle this bettew once we got a better calendar concept
        // taken from livgrupper/old.ts
        if (this.deltager.navn === "Ditlev Bastian Lykke Andersen") {console.log("DITLEV", this.deltager.dage)}

        let i = -1;
        for (let [a, b, day_name] of LIVGRUPPE_PERIODER) {
            i++;
            let day = addDays(START_DATE, i);
            let d = this.deltager.dage[i];
            if (this.deltager.navn === "Ditlev Bastian Lykke Andersen") {console.log("DITLEV NEJ", i, d)}
            if (d === "Nej") {
                continue;
            }
            if (d != "Ja") {
                console.log("Look into this", d, this.deltager.navn);
                continue;
            }
            let aa = true;
            let bb = true;
            if (formatDate(day) === formatDate(this.deltager.ankomst_dato)) {
                aa = false;
                if (this.deltager.ankomst_type === "Fælles") {
                    bb = true;
                } else if (this.deltager.ankomst_type === "Samkørsel") {
                    bb = true;
                } else if (this.deltager.ankomst_type === "Egen") {
                    if (this.deltager.ankomst_tidspunkt < 15) {
                        bb = true;
                    } else {
                        bb = false;
                    }
                } else {
                    console.error("failure");
                }
            }
            if (formatDate(day) === formatDate(this.deltager.afrejse_dato)) {
                bb = false;
                if (this.deltager.afrejse_type === "Fælles") {
                    aa = false;
                } else if (this.deltager.afrejse_type == "Samkørsel") {
                    aa = false;
                } else if (this.deltager.afrejse_type == "Egen") {
                    if (this.deltager.afrejse_tidspunkt > 14) {
                        aa = true;
                    } else {
                        aa = false;
                    }
                } else {
                    console.error("failure")
                }
            }
            if (this.deltager.navn === "Ditlev Bastian Lykke Andersen") {
                console.log(i, aa, a, bb, b);
            }

            if (false) {
                // Nothing
            } else if (aa && a && i <= 7) {
                this.minus_uge1.livgruppe_periods_available++;
            } else if (aa && a && i > 7) {
                this.minus_uge2.livgruppe_periods_available++;
            } else if (aa && !a && i <= 7) {
                this.minus_uge1.other_periods_available++;
            } else if (aa && !a && i > 7) {
                this.minus_uge2.other_periods_available++;
            } else if (!aa) {
                // Nothing
            } else {
                console.error("other case");
            }

            if (false) {
                // Nothing
            } else if (bb && b && i <= 6) {
                this.minus_uge1.livgruppe_periods_available++;
            } else if (bb && b && i > 6) {
                this.minus_uge2.livgruppe_periods_available++;
            } else if (bb && !b && i <= 6) {
                this.minus_uge1.other_periods_available++;
            } else if (bb && !b && i > 6) {
                this.minus_uge2.other_periods_available++;
            } else if (!bb) {
                // Nothing
            } else {
                console.error("other case");
            }
        }
    }




}
export class StateMinus {
    stateArbejdsbyrdeBesvarelser = new StateArbejdsbyrdeBesvarelser();
    stateCustomScores = new StateCustomScores();
    loaders = [() => SERVICE_DELTAGER.deltagere(),
               () => SERVICE_GRUPPE.grupper(),
               this.stateArbejdsbyrdeBesvarelser,
               this.stateCustomScores,
              ];
    isLoaded = false;
    deltagere: Array<ModelDeltagerMinus>;
    // deltagere = Map<Number, ModelDeltagerMinus>;

    public load() {
        let grupper_by_deltager = $it(SERVICE_GRUPPE.grupper())
            .GroupInner((gruppe) =>
                $it(gruppe.medlemmer)
                    .map((medlem) => medlem.fdfid)
                    .List());

        let arbejdsbyrder_by_deltager = new Map<number, ModelArbejdsbyrde>();
        $it(SERVICE_GRUPPE.grupper())
            .map((gruppe) =>
                $it(gruppe.medlemmer)
                    .map((medlem) => {
                        if (!arbejdsbyrder_by_deltager.has(medlem.fdfid)) {
                            arbejdsbyrder_by_deltager.set(medlem.fdfid, []);
                        }
                        let list = arbejdsbyrder_by_deltager.get(medlem.fdfid);
                        let arbejdsbyrde = this.stateArbejdsbyrdeBesvarelser.arbejdsbyrdeMap.get(gruppe.gruppe);
                        if (arbejdsbyrde) {
                            // arbejdsbyrde is undefined if it does not have a score
                            list.push(arbejdsbyrde);
                        }
                    })
                    .Go())
            .Go();
        window.arbejdsbyrder_by_deltager = arbejdsbyrder_by_deltager;
        window.stateArbejdsbyrdeBesvarelser = this.stateArbejdsbyrdeBesvarelser;
        this.deltagere = $it(SERVICE_DELTAGER.deltagere())
            // .filter((deltager) => deltager.er_voksen)
            .filter((deltager) => LIVGRUPPE_LEDERE.indexOf(deltager.fdfid) != -1)
            .map((deltager) =>
                new ModelDeltagerMinus(deltager, arbejdsbyrder_by_deltager.get(deltager.fdfid) ?? [])) // this.stateArbejdsbyrdeBesvarelser, this.stateCustomScores, ))
            .sort((m) => m.arbejdsbyrde_sum, true)
            .List();


    }
}

import {Stab, Patrulje, Tilstede, DAYS, DATES, START_DATE} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, addDays} from "src/utils";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {Gruppe} from "src/grupper/model_gruppe";
import {StateArbejdsbyrdeBesvarelser} from "src/livgrupper/arbejdsbyrde/state_arbejdsbyrde_besvarelser";
import {StateCustomScores} from "src/livgrupper/arbejdsbyrde/state_custom_scores";
import {LIVGRUPPE_PERIODER, LIVGRUPPE_LEDERE} from "src/config";
import {SERVICE_DELTAGER_LIVGRUPPE_COUNT, ModelDeltagerLivgruppeCount} from "src/livgrupper/minus/service_deltager_livgruppe_count";
import {algorithmMinus, WEEK_1, WEEK_2} from "src/livgrupper/minus/state_algorithm_minus";



class Minus {
    livgruppe_periods_available: number = 0;
    other_periods_available: number = 0;

    min_periods: number = 1;
    max_periods: number = 6;
    periods: number;

    score: number = 0;
    ratio: number = 0;
    // lscore: number;
}

class ModelDeltagerMinus {
    deltager: Deltager;
    arbejdsbyrder: Array<ModelArbejdsbyrde> = [];
    arbejdsbyrde_sum: number;
    minus_uge1: Minus;
    minus_uge2: Minus;
    minus: Map<int, Minus>;

    // algorithmStates: Map<string, StateMinusAlgorithm> = new Map();
    modelDeltagerLivgruppeCount: ModelDeltagerLivgruppeCount;

    constructor(deltager: Deltager, arbejdsbyrder: Array<ModelArbejdsbyrde>, modelDeltagerLivgruppeCount: ModelDeltagerLivgruppeCount) {
        this.deltager = deltager;
        this.arbejdsbyrder = arbejdsbyrder;
        this.arbejdsbyrde_sum = $it(arbejdsbyrder).map((arbejdsbyrde) => arbejdsbyrde.score).Reduce((x, y) => x + y, 0);
        this.minus_uge1 = new Minus();
        this.minus_uge2 = new Minus();
        this.minus = new Map()
        this.minus.set(1, this.minus_uge1);
        this.minus.set(2, this.minus_uge2);

        this._calculate_periods_available();
        this.minus_uge1.max_periods = this.minus_uge1.livgruppe_periods_available;
        this.minus_uge2.max_periods = this.minus_uge2.livgruppe_periods_available;

        this.modelDeltagerLivgruppeCount = modelDeltagerLivgruppeCount;
    }

    private _calculate_periods_available() {
        // TODO: handle this bettew once we got a better calendar concept
        // taken from livgrupper/old.ts

        let i = -1;
        for (let [a, b, day_name] of LIVGRUPPE_PERIODER) {
            i++;
            let day = addDays(START_DATE, i);
            let d = this.deltager.dage[i];
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

    errors_uge1: Array<string>;
    errors_uge2: Array<string>;

    public load() {
        let deltager_livgruppe_count = SERVICE_DELTAGER_LIVGRUPPE_COUNT.all()();
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
                new ModelDeltagerMinus(
                    deltager,
                    arbejdsbyrder_by_deltager.get(deltager.fdfid) ?? [],
                    deltager_livgruppe_count.get(deltager.fdfid) ?? {
                        fdfid: deltager.fdfid,
                        antal_uge1: 0,
                        antal_uge2: 0,
                        locked: false}))
            .sort((m) => m.arbejdsbyrde_sum, true)
            .List();

        this.errors_uge1 = algorithmMinus(this.deltagere, WEEK_1);
        this.errors_uge2 = algorithmMinus(this.deltagere, WEEK_2);

    }
}

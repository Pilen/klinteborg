import m from "mithril";
import {error} from "src/error";
import {$it, Iter} from "src/lib/iter";
import {openModal, closeModal, ModalBase} from "src/modal";
import {load} from "src/load";

import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {H1, H2, H5, Tr, formatDate, formatDateTime, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";
import {StateMinus} from "src/livgrupper/minus/state_minus";
import {UiSummary} from "src/livgrupper/minus/ui_summary";
import {UiMinus} from "src/livgrupper/minus/ui_minus";
import {UiAlgorithmMinusSettings} from "src/livgrupper/minus/ui_algorithm_minus_settings";
import {UiSettings} from "src/settings/ui_settings";
import {SERVICE_SETTINGS} from "src/settings/service_settings";
import {SERVICE_DELTAGER_LIVGRUPPE_COUNT, ModelDeltagerLivgruppeCount} from "src/livgrupper/minus/service_deltager_livgruppe_count";


export class PageMinus {
    stateMinus = new StateMinus();

    public view(vnode: m.Vnode) {
        return m("div",
                 load([() => SERVICE_SETTINGS.settings(), () => SERVICE_DELTAGER_LIVGRUPPE_COUNT.all()], m(UiAlgorithmMinusSettings)),
                 load([this.stateMinus], m(UiMinus, {state: this.stateMinus})),
                 load([this.stateMinus], m(UiMinus, {state: this.stateMinus})),
                 // load([() => SERVICE_SETTINGS.settings()], m(UiSettings, {filter: (setting) => setting.category = "Livgrupper"})),
                 load([this.stateMinus], m(UiSummary, {state: this.stateMinus})),
                 // // m(PageOverview),
               );
    }
}

class PageOverview {
    public view(vnode: m.Vnode) {
        let deltagere = $it(SERVICE_DELTAGER.deltagere() ?? [])
            .sort((deltager) => [calculateAge(deltager.fødselsdato)])
            .filter((deltager) => (deltager.tilmelding["Deltagelse Uge 1: / Lørdag 1"] || deltager.tilmelding["Deltagelse Uge 1: / Søndag 1"] || deltager.tilmelding["Deltagelse Uge 1: / Mandag 1"] || deltager.tilmelding["Deltagelse Uge 1: / Tirsdag 1"] || deltager.tilmelding["Deltagelse Uge 1: / Onsdag 1"] || deltager.tilmelding["Deltagelse Uge 1: / Torsdag 1"] || deltager.tilmelding["Deltagelse Uge 1: / Fredag 1"] || deltager.tilmelding["Deltagelse Uge 1: / Lørdag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Søndag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Mandag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Tirsdag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Onsdag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Torsdag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Fredag 2"] || deltager.tilmelding["Deltagelse Uge 2: / Lørdag 3"]))
            .filter((deltager) => !compare(deltager))
            .map((deltager) => [
                m("tr", m("td", ".")),
                m("tr", m("td", ".")),
                m("tr",
                  m("td", deltager.navn),
                  m("td", m(UiDays, {days: deltager.dage})),
                  m("td", deltager.ankomst_tidspunkt),
                  m("td", deltager.afrejse_tidspunkt),


                 ),
                m("tr",
                  m("td", ""),
                  m("td", [
                      m("div.days",
                        deltager.tilmelding["Deltagelse Uge 1: / Lørdag 1"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 1: / Søndag 1"] ? "x" : "_",
                        ":",
                        deltager.tilmelding["Deltagelse Uge 1: / Mandag 1"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 1: / Tirsdag 1"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 1: / Onsdag 1"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 1: / Torsdag 1"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 1: / Fredag 1"] ? "x" : "_",
                        ":",
                        // deltager.tilmelding["Deltagelse Uge 1: / Lørdag 2"] ? "x" : "_",
                        // deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "x" : "_",
                        (deltager.tilmelding["Deltagelse Uge 1: / Lørdag 2"] && deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "b" : (deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "E" : (deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "T" : "_"))),
                        deltager.tilmelding["Deltagelse Uge 2: / Søndag 2"] ? "x" : "_",

                        ":",
                        deltager.tilmelding["Deltagelse Uge 2: / Mandag 2"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 2: / Tirsdag 2"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 2: / Onsdag 2"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 2: / Torsdag 2"] ? "x" : "_",
                        deltager.tilmelding["Deltagelse Uge 2: / Fredag 2"] ? "x" : "_",
                        ":",
                        deltager.tilmelding["Deltagelse Uge 2: / Lørdag 3"] ? "x" : "_",
                       )]))

            ])
            .List();

        return [
            m("table", m("tbody", deltagere)),
            // m(UiDeltagere),
        ];
    }
}



function compare(deltager: Deltager) {
    console.log(deltager);
    function f(i) {
        if (deltager.dage[i] === "Ja") {
            return "X";
        }
        if (deltager.dage[i] === "Nej") {
            return "_";
        }
        return deltager.dage[i];
    }
    function h(t) {
        if (t === "X") {
            return "X";
        }
        if (t === "") {
            return "_";
        }
        return t;
    }
    console.log(
        f(0),
        f(1),
        f(2),
        f(3),
        f(4),
        f(5),
        f(6),
        f(7),
        f(8),
        f(9),
        f(10),
        f(11),
        f(12),
        f(13),
        f(14),
    )
    console.log(
        h(deltager.tilmelding["Deltagelse Uge 1: / Lørdag 1"]),
        h(deltager.tilmelding["Deltagelse Uge 1: / Søndag 1"]),
        h(deltager.tilmelding["Deltagelse Uge 1: / Mandag 1"]),
        h(deltager.tilmelding["Deltagelse Uge 1: / Tirsdag 1"]),
        h(deltager.tilmelding["Deltagelse Uge 1: / Onsdag 1"]),
        h(deltager.tilmelding["Deltagelse Uge 1: / Torsdag 1"]),
        h(deltager.tilmelding["Deltagelse Uge 1: / Fredag 1"]),
        // h(deltager.tilmelding["Deltagelse Uge 1: / Lørdag 2"]),
        // h(deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"]),
        h(deltager.tilmelding["Deltagelse Uge 1: / Lørdag 2"] && deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "X" : (deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "E" : (deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "T" : "_"))),
        h(deltager.tilmelding["Deltagelse Uge 2: / Søndag 2"]),
        h(deltager.tilmelding["Deltagelse Uge 2: / Mandag 2"]),
        h(deltager.tilmelding["Deltagelse Uge 2: / Tirsdag 2"]),
        h(deltager.tilmelding["Deltagelse Uge 2: / Onsdag 2"]),
        h(deltager.tilmelding["Deltagelse Uge 2: / Torsdag 2"]),
        h(deltager.tilmelding["Deltagelse Uge 2: / Fredag 2"]),
        h(deltager.tilmelding["Deltagelse Uge 2: / Lørdag 3"]),
    )
    return (
        true &&
            f(0) === h(deltager.tilmelding["Deltagelse Uge 1: / Lørdag 1"]) &&
            f(1) === h(deltager.tilmelding["Deltagelse Uge 1: / Søndag 1"]) &&
            f(2) === h(deltager.tilmelding["Deltagelse Uge 1: / Mandag 1"]) &&
            f(3) === h(deltager.tilmelding["Deltagelse Uge 1: / Tirsdag 1"]) &&
            f(4) === h(deltager.tilmelding["Deltagelse Uge 1: / Onsdag 1"]) &&
            f(5) === h(deltager.tilmelding["Deltagelse Uge 1: / Torsdag 1"]) &&
            f(6) === h(deltager.tilmelding["Deltagelse Uge 1: / Fredag 1"]) &&
            // f(7) === h(deltager.tilmelding["Deltagelse Uge 1: / Lørdag 2"]) &&
            // f(8) === h(deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"]) &&
            f(7) === h(deltager.tilmelding["Deltagelse Uge 1: / Lørdag 2"] && deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "X" : (deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "E" : (deltager.tilmelding["Deltagelse Uge 2: / Lørdag 2"] ? "T" : "_"))) &&
            f(8) === h(deltager.tilmelding["Deltagelse Uge 2: / Søndag 2"]) &&
            f(9) === h(deltager.tilmelding["Deltagelse Uge 2: / Mandag 2"]) &&
            f(10) === h(deltager.tilmelding["Deltagelse Uge 2: / Tirsdag 2"]) &&
            f(11) === h(deltager.tilmelding["Deltagelse Uge 2: / Onsdag 2"]) &&
            f(12) === h(deltager.tilmelding["Deltagelse Uge 2: / Torsdag 2"]) &&
            f(13) === h(deltager.tilmelding["Deltagelse Uge 2: / Fredag 2"]) &&
            f(14) === h(deltager.tilmelding["Deltagelse Uge 2: / Lørdag 3"])
    );
}

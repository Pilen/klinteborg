import m from "mithril";
import {UiSetting} from "src/settings";
import {SERVICE_SETTINGS} from "src/settings/service_settings";
import {UiSetting} from "src/settings/ui_setting";


export class UiAlgorithmMinusSettings {
    public view(vnode: m.Vnode<{state: StateAlgorithmMinus}>) {
        return m("div",
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Antal perioder uge 1", "Livgrupper")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Min. perioder uge 1", "Livgrupper")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Max. perioder uge 1", "Livgrupper")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Antal åbne slots uge 1", "Livgrupper")}),

                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Antal perioder uge 2", "Livgrupper")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Min. perioder uge 2", "Livgrupper")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Max. perioder uge 2", "Livgrupper")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Antal åbne slots uge 2", "Livgrupper")}),
                );

        // return m("table",
        //          m("thead",
        //            m("tr",
        //              m("th", "Indstilling"),
        //              m("th", "Uge 1"),
        //              m("th", "Uge 2"))),
        //          m("tbody",
        //            m("tr",
        //              m("td", "perioder"),
        //              m("td", m("input", {value: vnode.attrs.minus_uge1.perioder, oninput: (e) => vnode.attrs.minus_uge1.perioder})),
        //              m("td", m("input", {value: vnode.attrs.minus_uge2.perioder}))),
        //            m("tr",
        //              m("td", "min perioder"),
        //             ),
        //            m("tr",
        //              m("td", "max perioder"),
        //             ),
        //            m("tr",
        //              m("td", "max score cutoff"),
        //             ),
        //            m("tr",
        //              m("td", "activity bonus"),
        //             ),
        //            m("tr",
        //              m("td", "slots"))));

    }
}

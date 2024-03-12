import m from "mithril";
import {UiSetting} from "src/settings";
import {SERVICE_SETTINGS} from "src/settings/service_settings";
import {UiSetting} from "src/settings/ui_setting";


export class UiAlgorithmMinusSettings {
    public view(vnode: m.Vnode<{state: StateAlgorithmMinus}>) {
        return m("div",
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper perioder uge 1")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper min perioder uge 1")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper max perioder uge 1")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper åbne slots uge 1")}),

                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper perioder uge 2")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper min perioder uge 2")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper max perioder uge 2")}),
                 m(UiSetting, {setting: SERVICE_SETTINGS.get("Livgrupper åbne slots uge 2")}),
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

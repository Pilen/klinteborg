import m from "mithril";
import {error} from "src/error";
import {$it} from "src/lib/iter";
import {load, UiLoading} from "src/load";
import {SERVICE_SETTINGS} from "src/settings/service_settings";
import {UiSetting} from "src/settings/ui_setting";

export class UiSettings {
    public view(vnode: m.Vnode<{filter: (ModelSetting) => boolean}>) {
        let settings = SERVICE_SETTINGS.settings();
        if (settings === undefined) {
            return m(UiLoading);
        }
        let content = $it(settings)
            .filter(vnode.attrs.filter)
            .map((setting) => m(UiSetting, {setting: setting}))
            .List()
        return m("div", content);
    }
}

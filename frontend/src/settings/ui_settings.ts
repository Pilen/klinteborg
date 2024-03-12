import m from "mithril";
import {error} from "src/error";
import {$it} from "src/lib/iter";
import {load, UiLoading} from "src/load";


export class UiSettings {
    public view(vnode: m.Vnode) {
        let settings = SERVICE_SETTINGS.settings();
        if (settings === undefined) {
            return m(UiLoading);
        }
        let content = $it(settings)
            .map((setting) => m(UiSetting, {setting: setting}))
            .List()
        return m("div", content);
    }
}

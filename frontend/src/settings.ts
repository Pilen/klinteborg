import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {Gruppe} from "src/grupper/model_gruppe";
import {SERVICE_MINUS} from "src/minus/service_minus";
import {openModal, closeModal, ModalBase} from "src/modal";
import {load, UiLoading} from "src/load";

class ModelSetting {
    setting: string;
    value: any;
    default: any;
    type: any
    description: string;
}

class ServiceSettings {
    _settings: Array<ModelSetting>;

    public downloadSettings() {
        return m.request({
            method: "GET",
            url: "/api/settings/all",
            withCredentials: true
        }).catch((e) => {
            error(e)
        }).then((result: Array<ModelSetting>) => {
            this._settings = result;
        });
    }

    public settings() {
        if (this._settings === undefined) {
            this.downloadSettings();
            return undefined;
        }
        return this._settings
    }
    public get(setting: string) {
        if (this._settings === undefined) {
            return undefined;
        }
        for (let s of this._settings) {
            if (setting === s.setting) {
                return s;
            }
        }
        console.error("Unknown setting");
    }
    public set(setting: string, value: any) {
        console.error("Not implemented yet!");
    }
}
export const SERVICE_SETTINGS = new ServiceSettings();

export class UiSetting {
    setting;
    values;
    raw: string;
    bad: boolean;
    public oninit(vnode: m.Vnode<{setting: ModelSetting}>) {
        // if (vnode.attrs.setting instanceof string) {
        //     this.setting = SERVICE_SETTINGS.get(vnode.attrs.setting);
        // } else {
        //     this.setting = vnode.attrs.setting;
        // }
        // this.setting = SERVICE_SETTINGS.get(vnode.attrs.setting);
        this.setting = vnode.attrs.setting;
        console.assert(this.setting !== undefined);
        this.value = this.setting.value;
        this.raw = ""; // TODO: unparse this.value
        this.bad = false;
    }
    public change(raw) {
        this.raw = raw;
        if (this.setting.type == "int") {
            let value = parseInt(raw);
            if (isNaN(value)) {
                this.bad = true;
                this.value = null;
            } else {
                this.bad = false;
                this.value = value;
            }
        } else {
            console.error("Unhandled type");
        }
    }
    public save() {
        if (this.bad) {
            return;
        }
        SERVICE_SETTINGS.set(this.setting.setting, this.value);
    }
    public view(vnode: m.Vnode<{setting: ModelSetting}>) {
        return m("tr",
                 m("td", this.setting.setting),
                 m("td", m("input",
                           {value: this.value,
                            oninput: (e) => this.change(e.currentTarget.value)})),
                 m("td", m("button",
                           {"class": this.bad ? "red" : "green",
                            "style": this.bad ? {cursor: "disabled"} : null,
                            onclick: (e) => this.save()},
                           "Gem")),
                );

    }
}

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

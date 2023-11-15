import m from "mithril";
import {error} from "./error";
import {$it, Iter, foo} from "./lib/iter";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "./utils";
import {GRUPPE_SERVICE, Gruppe} from "./services/gruppe_service";
import {MINUS_SERVICE} from "./services/minus_service";
import {openModal, closeModal, Modal} from "./modal";
import {load, UiLoading} from "./load";

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
}
const SERVICE_SETTINGS = new ServiceSettings();

export class UiSetting {
    setting;
    public oninit(vnode: m.Vnode<{setting: ModelSetting}>) {
        // if (vnode.attrs.setting instanceof string) {
        //     this.setting = SERVICE_SETTINGS.get(vnode.attrs.setting);
        // } else {
        //     this.setting = vnode.attrs.setting;
        // }
        // this.setting = SERVICE_SETTINGS.get(vnode.attrs.setting);
        this.setting = vnode.attrs.setting;
        this.value = this.setting.value;
        this.raw = ""; // TODO: unparse this.value
        this.bad = false;
    }
    public change(raw) {
        this.raw = raw;
        if (this.setting.type == "int") {
            value = parseInt(raw);
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
    public view(vnode: m.Vnode<{setting: string}>) {
        return m("div",
                 m("span", this.setting.setting),
                 m("input",
                   {value: this.value,
                    oninput: (e) => this.change(e.currentTarget.value)}),
                 m("button",
                   {"class": this.bad ? "red" : "green",
                    "style": this.bad ? {cursor: "disabled"} : null,
                    onclick: (e) => this.save()},
                   "Gem"),
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

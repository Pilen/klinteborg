import m from "mithril";
import {error} from "src/error";
import {$it} from "src/lib/iter";
import {ModelSetting} from "src/settings/model_settings";

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

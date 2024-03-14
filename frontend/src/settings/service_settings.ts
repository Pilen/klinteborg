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
    public get(setting: string, category: string) {
        if (this._settings === undefined) {
            return undefined;
        }
        for (let s of this._settings) {
            if (setting === s.setting && category === s.category) {
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



class ServiceSettings2 {
    apiStreamSettings = new ApiStream<Array<ModelSetting>>()
        .get("/api/settings/all")

    public settings() {
        return this.apiStreamSettings.stream();
    }
    public getValue(setting: string, category: string) {
        // TODO: should this method be discarded / get functionality of get?
        let settings = this.apiStreamSettings.stream()();
        if (settings === undefined) {
            return undefined;
        }
        for (let s of settings) {
            if (setting === s.setting && category === s.category) {
                return s;
            }
        }
        console.error(`Unknown setting: ${category}.${setting}`);
    }
    public get(setting: string, category: string) {
        return this.apiStreamSettings.stream().map((settings) => {
            for (let s of settings) {
                if (setting === s.setting && category === s.category) {
                    return s;
                }
            }
            console.error(`Unknown setting: ${category}.${setting}`);
        });
    }
    public set(setting: string, category: string, value: any) {
        console.error("Not implemented yet!");
    }

}

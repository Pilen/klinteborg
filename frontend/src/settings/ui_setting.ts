import m from "mithril";
import {error} from "src/error";
import {$it} from "src/lib/iter";


export class UiSetting {
    setting: ModelSetting;
    value: any;
    raw: string;
    bad: boolean;
    modified: boolean;
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
        this.modified = false;
    }
    public change(raw) {
        this.raw = raw;
        this.modified = true;
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
                 m("td", {title: this.setting.description}, this.setting.setting),
                 m("td", m("input",
                           {value: this.value,
                            oninput: (e) => this.change(e.currentTarget.value)})),
                 m("td", this.modified ? m("button",
                           {"class": this.bad ? "red" : "green",
                            "style": this.bad ? {cursor: "disabled !important"} : null,
                            onclick: (e) => this.save()},
                                           "Gem") : ""),
                );

    }
}

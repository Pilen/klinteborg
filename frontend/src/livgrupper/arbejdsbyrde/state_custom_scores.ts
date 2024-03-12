import m from "mithril";
import {error} from "src/error";
import {$it} from "src/lib/iter";
import {SERVICE_CUSTOM_SCORES} from "src/livgrupper/arbejdsbyrde/service_custom_scores";


export class StateCustomScores {
    // loaders: Array<() => any> = [
    loaders = [
        () => SERVICE_CUSTOM_SCORES.customScores()(),
    ];
    isLoaded = false;

    // custom: Map<string, number>;
    custom: Map<string, string>

    constructor() {
        // this.loaders.push(() => besvarelser.isLoaded ? true : undefined);
    }
    public load() {
        // this.custom = SERVICE_CUSTOM_SCORES.customScores()();
        this.custom = $it(SERVICE_CUSTOM_SCORES.customScores()())
            .map(([gruppe, score]) => [gruppe, "" + score])
            .Map();
    }

    public save() {
        let custom = $it(this.custom)
            .map(([gruppe, score]) => [gruppe, Number(score.replace(",", "."))])
            .filter(([gruppe, score]) => !isNaN(score))
            .Map()
        SERVICE_CUSTOM_SCORES.save(custom);
    }

    public isAutomatic(gruppe: string) {
        return !this.custom.has(gruppe);
    }

    public update(gruppe: string, value: string) {
        value = value.trim();
        if (value === "") {
            this.custom.delete(gruppe);
            return;
        }
        const re = RegExp("^(-?)([0-9]*|([0-9]+[.,][0-9]*))$");
        if (!value.match(re)) {
            return
        }
        console.log(value, "=", Number(value));
        this.custom.set(gruppe, value);
        return;
        let score = Number(value); // parseFloat allows trailing garbage
        if (isNaN(score)) {
            return;
        }
        this.custom.set(gruppe, value);
    }
}

import m from "mithril";
import Stream from "mithril/stream";
import {error} from "src/error";
import {$it} from "src/lib/iter";
import {Api, ApiStream} from "src/api";


interface ModelDeltagerLivgruppeCount {
    fdfid: number;
    antal_uge1: number;
    antal_uge2: number;
    locked: boolean;
}


class ServiceDeltagerLivgruppeCount {
    apiStreamMinus = new ApiStream<Map<number, ModelDeltagerLivgruppeCount>>()
        .get("/api/minus/livgruppe-antal")
        .then((models) => $it(models).GroupBy("fdfid"))

    apiSave = new Api()
        .post("/api/minus/save-livgruppe-antal")
        .then(this.apiStreamMinus)

    public all() {
        return this.apiStreamMinus.stream();
    }
    public save(models: Map<number, ModelDeltagerLivgruppeCount>) {
        let list = $it.mapEntries(models).get(1).List()
        return this.apiSet.request(list);
    }

}
export const SERVICE_DELTAGER_LIVGRUPPE_COUNT = new ServiceDeltagerLivgruppeCount();

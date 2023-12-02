import m from "mithril";
import Stream from "mithril/stream";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {load} from "src/load";
import {Api, ApiStream} from "src/api";

import {ModelArbejdsbyrdeBesvarelse} from "src/livgrupper/arbejdsbyrde/models";


class ServiceArbejdsbyrdeBesvarelse {
    apiStreamBesvarelser = new ApiStream<Array<ModelArbejdsbyrdeBesvarelse>>().get("/api/minus/arbejdsbyrde/besvarelse/all");
    apiSave = new Api()
        .post("/api/minus/arbejdsbyrde/besvarelse/save")
        .then(() => this.apiStreamBesvarelser.newRequest());
    public besvarelser(): Stream<Array<ModelArbejdsbyrdeBesvarelse>>{
        return this.apiStreamBesvarelser.stream();
    }
    public save(besvarelse: ModelArbejdsbyrdeBesvarelse) {
        return this.apiSave.request({
            id: besvarelse.id,
            grupper: besvarelse.grupper,
            vægtning: besvarelse.vægtning});
    }
}
export const SERVICE_ARBEJDSBYRDE_BESVARELSE = new ServiceArbejdsbyrdeBesvarelse();


class ServiceCustomScores {
    apiStreamCustomScores = new ApiStream()
        .get("/api/minus/arbejdsbyrde/custom-score/all")
        .then((result) => $it.objectEntries(result).Map());
    apiSave = new Api().post("/api/minus/arbejdsbyrde/custom-score/save-all");
    apiDelete = new Api().post("/api/minus/arbejdsbyrde/custom-score/delete")
    public customScores() {
        return this.apiStreamCustomScores.stream();
    }
    // public save(gruppe: string, score: number){
    //     return this.apiSave.request({gruppe, score});
    // }
    public save(scores: Map<string, number>) {
        this.apiSave.request($it(scores).Obj())
            .then(() => this.apiStreamCustomScores.newRequest());
    }
    public delete(gruppe: string) {
        return this.apiDelete.request({gruppe});
    }
}
export const SERVICE_CUSTOM_SCORES = new ServiceCustomScores();

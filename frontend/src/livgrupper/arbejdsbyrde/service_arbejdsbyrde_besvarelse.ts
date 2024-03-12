import m from "mithril";
import Stream from "mithril/stream";
import {error} from "src/error";
import {$it} from "src/lib/iter";
import {Api, ApiStream} from "src/api";

import {ModelArbejdsbyrdeBesvarelse} from "src/livgrupper/arbejdsbyrde/model_arbejdsbyrde_besvarelse";


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

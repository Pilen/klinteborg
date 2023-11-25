import {Api, ApiStream} from "src/api";

class ServiceArbejdsbyrdeBesvarelse {
    apiStreamBesvarelser = new ApiStream().get("/api/minus/arbejdsbyrde/besvarelse/all");
    apiSave = new Api()
        .post("/api/minus/arbejdsbyrde/besvarelse/save")
        .then(() => this.apiStreamBesvarelser.newRequest());
    public besvarelser() {
        return this.apiStreamBesvarelser.stream();
    }
    public save(besvarelse: ModelArbejdsbyrdeBesvarelse) {
        this.apiSave.request({
            id: besvarelse.id,
            grupper: besvarelse.grupper,
            vægtning: besvarelse.vægtning});
    }
}
export const SERVICE_ARBEJDSBYRDE_BESVARELSE = new ServiceArbejdsbyrdeBesvarelse();


class ServiceCustomScores {
    apiStreamCustomScores = new ApiStream()
        .get("/api/minus/arbejdsbyrde/custom_scores/all")
        .then((result) => $it.objectEntries(result).Map());
    apiSave = new Api().post("/api/minus/arbejdsbyrde/custom_scores/save");
    apiDelete = new Api().post("/api/minus/arbejdsbyrde/custom_scores/delete")
    public customScores() {
        return this.apiStreamCustomScores.stream();
    }
    public save(gruppe: string, score: number){
        this.apiSave.request({gruppe, score});
    }
    public delete(gruppe: string) {
        this.apiDelete.request({gruppe});
    }
}
export const SERVICE_CUSTOM_SCORES = new ServiceCustomScores();

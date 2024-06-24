import m from "mithril";
import Stream from "mithril/stream";
import {error} from "src/error";
import {$it} from "src/lib/iter";
import {Api, ApiStream} from "src/api";



class ServiceCustomScores {
    apiStreamCustomScores = new ApiStream()
        .get("/api/minus/arbejdsbyrde/custom-score/all")
        .then((result) => $it.objectEntries(result).Map());
    apiSave = new Api()
        .post("/api/minus/arbejdsbyrde/custom-score/save-all")
        .then(this.apiStreamCustomScores)
    apiDelete = new Api()
        .post("/api/minus/arbejdsbyrde/custom-score/delete")
        .then(this.apiStreamCustomScores)

    public customScores() {
        return this.apiStreamCustomScores.stream();
    }
    // public save(gruppe: string, score: number){
    //     return this.apiSave.request({gruppe, score});
    // }
    public save(scores: Map<string, number>) {
        this.apiSave.request($it(scores).Obj())
    }
    public delete(gruppe: string) {
        return this.apiDelete.request({gruppe});
    }
}
export const SERVICE_CUSTOM_SCORES = new ServiceCustomScores();

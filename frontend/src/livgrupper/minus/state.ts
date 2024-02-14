
class ModelDeltagerMinus {
    deltager: Deltager;
    arbejdsbyrder: Array<ModelArbejdsbyrde>;
    arbejdsbyrde_sum: number;
    max_periods: number;
    min_periods: number;

    algorithmStates = Map<string, StateMinusAlgorithm> = new Map();

    constructor(deltager: Deltager, arbejdsbyrder: Array<ModelArbejdsbyrde>) {
        this.deltager = deltager;
        this.arbejdsbyrder = arbejdsbyrder;
    }

}
export class StateMinus {
    stateArbejdsbyrdeBesvarelser = new StateArbejdsbyrdeBesvarelser();
    stateCustomScores = new stateCustomScores();
    loaders = [() => DELTAGER_SERVICE.deltagere(),
               this.stateArbejdsbyrdeBesvarelser,
               this.stateCustomScores,
              ];
    isLoader = false;
    deltagere = Array<ModelDeltagerMinus>;
    public load() {
        let grupper_by_deltager = $it(GRUPPE_SERVICE.grupper())
            .GroupInner((gruppe) =>
                $it(gruppe.medlemmer)
                    .map((medlem) =>
                        medlem.fdfid));

        let arbejdsbyrder_by_deltager = new Map<number, ModelArbejdsbyrde>();
        $it(GRUPPE_SERVICE.grupper())
            .map((gruppe) =>
                $it(gruppe.medlemmer)
                    .map((medlem) => {
                        if (!arbejdsbyrder_by_deltager.has(medlem.fdfid)) {
                            arbejdsbyrder_by_deltager.set(medlem.fdfid, []);
                        }
                        let list = arbejdsbyrder_by_deltager.get(medlem.fdfid);
                        let arbejdsbyrde = this.stateArbejdsbyrdeBesvarelser.arbejdsbyrderMap.get(gruppe.gruppe);
                        list.push(arbejdsbyrde);
                    })
                    .Go();
                )
            .Go();
        let $it(DELTAGER_SERVICE.deltagere())
            .map((deltager) =>
                new ModelDeltagerMinus(deltager, arbejdsbyrder_by_deltager[deltager.fdfid])) // this.stateArbejdsbyrdeBesvarelser, this.stateCustomScores, ))
            .List();
    }
}

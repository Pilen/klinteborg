export class StateCustomScores {
    loaders = [() => MINUS_SERVICE.grupperGivingMinus(),
               () => GRUPPE_SERVICE.grupper(),
               () => SERVICE_CUSTOM_SCORES.customScores(),
              ];
    isLoaded = false;

    constructor(besvarelser) {
        this.loaders.push(() => besvarelser.isLoaded ? true : undefined);
    }
    public load() {
        // this.
    }
}


export class UiCustomScores {
    public view(vnode: m.Vnode) {

    }
}


export interface State {
    loaders: Array<() => any | undefined>;
    isLoaded: boolean;
    load: () => void;
    // public load() {

    // }

}

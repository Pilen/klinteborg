import m from "mithril";


export function load(state, element) {
    // console.log("in load");
    if (state.isLoaded) {
        return element;
    }
    for (let loader of state.loaders) {
        if (loader() === undefined) {
            return m("div", "Loading...");
        }
    }
    state.load();
    state.isLoaded = true;
    return element;
}

export class UiLoading {
    public view(vnode: m.Vnode) {
        return m("div", "Loading...");
    }
}

// export function whenReady(component) {
//    for (let loader of component.loaders) {
//         if (loader() === undefined) {
//             return m("div", "Loading...");
//         }
//    }
//     return component

// }

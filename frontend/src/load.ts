import m from "mithril";
import Stream from "mithril/stream";
import {Api, ApiStream} from "src/api";


// export function load(state, element) {
//     // console.log("in load");
//     if (state.isLoaded) {
//         return element;
//     }
//     for (let loader of state.loaders) {
//         if (loader() === undefined) {
//             return m("div", "Loading...");
//         }
//     }
//     state.load();
//     state.isLoaded = true;
//     return element;
// }

interface State {

}
export function load(things: any, element: m.Vnode) {
    if (!Array.isArray(things)) {
        things = [things];
    }
    let isLoaded = true;
    for (let thing of things) {
        if (thing instanceof ApiStream) {
            if (thing.stream()() === undefined) {
                isLoaded = false;
            }
        // } else if (thing instanceof Stream<any>) {
        //     if (thing() === undefined) {
        //         isLoaded = false;
        //     }
        } else if (typeof thing === "function") {
            if (thing() === undefined) {
                isLoaded = false;
            }
        } else {
            // if (thing instanceof State) {
            let state = thing;
            if (state.isLoaded) {
                continue;
            }
            let loadState = true;
            for (let loader of state.loaders) {
                if (loader() === undefined) {
                    isLoaded = false;
                    loadState = false;
                    break;
                }
            }
            if (loadState) {
                state.load();
                state.isLoaded = true;
            }
        }
    }
    if (isLoaded) {
        return element;
    } else {
        return m(UiLoading)
    }
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

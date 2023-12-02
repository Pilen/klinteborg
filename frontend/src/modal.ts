import m from "mithril";


let modal = null;
let className = null;
export function openModal(modal_, className_) {
    modal = modal_;
    className = className_;
}
export function closeModal() {
    modal = null;
}
export class ModalBase {
    public view(vnode: m.Vnode<unknown>) {
        if (modal) {
            return m(".modal-base",
                     {onclick: (e) => {
                         // Should the dom be saved in this inside an oncreate?
                         // @ts-ignore
                         let dom = vnode.dom;
                         if (e.target === dom) {
                             closeModal();
                         }
                     }},
                     m(".modal",
                       {class: className},
                       modal(),
                      ));
        }
        // return m("div", "empty modal base")
        return null;
    }
}

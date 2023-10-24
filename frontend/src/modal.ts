import m from "mithril";


let modal = null;
export function openModal(modal_) {
    modal = modal_;
}
export function closeModal() {
    modal = null;
}
export class ModalBase {
    public view(vnode: m.Vnode) {
        if (modal) {
            return m(".modal-base",
                     {onclick: (e) => {
                         if (e.target === vnode.dom) {
                             closeModal();
                         }
                     }},
                     m(".modal",
                       modal(),
                      ));
        }
        // return m("div", "empty modal base")
        return null;
    }
}

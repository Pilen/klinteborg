import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {SERVICE_GRUPPE} from "src/grupper/service_gruppe";
import {Gruppe} from "src/grupper/model_gruppe";
import {openModal, closeModal, ModalBase} from "src/modal";
import {load} from "src/load";
import {UiSettings} from "src/settings/ui_settings";

export class PageAdmin {
    public view(vnode: m.Vnode) {
        return m(UiSettings, {filter: (setting) => true});
    }
}

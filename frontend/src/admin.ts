
import m from "mithril";
import {error} from "../error";
import {$it, Iter, foo} from "../lib/iter";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "../utils";
import {GRUPPE_SERVICE, Gruppe} from "../services/gruppe_service";
import {MINUS_SERVICE} from "../services/minus_service";
import {openModal, closeModal, Modal} from "../modal";
import {load} from "../load";
import {UiSettings} from "./settings";

export class PageAdmin {
    public view(vnode: m.Vnode) {
        return m(UiSettings);
    }
}

import m from "mithril";
import Stream from "mithril/stream";
import {
    ErrorView
} from "./error";
import {ModalBase} from "./modal";
import {DELTAGER_SERVICE} from "./services/deltager_service";
import {
    PageDeltagereIndestab,
    PageDeltagerePiltestab,
    PageDeltagereVæbnerstab,
    PageDeltagereResten,
    PageDeltagereAlle,
} from "./deltagere/basic";
import {PageDeltagereProblematiske} from "./deltagere/problematiske";
import {PageDeltagereTransport} from "./deltagere/transport";
import {PageDeltagereFødselsdage} from "./deltagere/fødselsdage";
import {PageDeltagereKøkken} from "./deltagere/køkken";
import {PageDeltagereLejrlæge} from "./deltagere/lejrlæge";
import {PageDeltagereSøg} from "./deltagere/søg";
import {PageDeltager} from "./deltagere/deltager";

import {PageDeltagereAfkrydsning} from "./deltagere/afkrydsning";
import {PageDeltagereTelefoner} from "./deltagere/telefoner";
import {PageDeltagereSangbog} from "./deltagere/sangbog";
import {PageDeltagerePost} from "./deltagere/post";
import {PageDeltagereVæbnerkop} from "./deltagere/væbnerkop";

import {PageLivgrupperAdminOld} from "./livgrupper/old";
import {PageMinus} from "./livgrupper/minus";
import {PageArbejdsbyrde} from "./livgrupper/arbejdsbyrde";

import {PageGrupper} from "./sekretær/grupper";

import {PageFrontpage} from "./frontpage/frontpage";

import {PageAdmin} from "./admin/admin";

import {UiLoadingApi} from "./api";
import {formatDateTime} from "./utils";



// m("span.fdficon", "")


class NotFound {
    public view(vnode: m.Vnode) {
        return m("div", "Siden findes ikke / er ikke lavet færdig");
    }
}

class Layout {
    public view(vnode: m.Vnode<{title: string}>) {
        document.title = vnode.attrs.title;
        if (!DELTAGER_SERVICE.isReady()) {
            return m(".loading", m("span", "Loading"));
        }
        return m.fragment({}, [
            m("header",
              m("nav",
                m("a", {href: "/"},
                  m(".header-title", "Klinteborg"),
                  m(".header-title-year", "2023")),
                m(".dropdown",
                  m("a", "Program"),
                  m(".dropdown-content",
                    m(m.route.Link, {href: "/program/mit", "class": "disabled"}, "Mit program"),
                    m(m.route.Link, {href: "/program/lejrens", "class": "disabled"}, "Lejrens program"),
                    m(m.route.Link, {href: "/program/dags", "class": "disabled"}, "Dagsprogram"),
                   )),
                m(".dropdown",
                  m("a", "Deltagere"),
                  m(".dropdown-content",
                    m(m.route.Link, {href: "/deltagere/indestab"}, "Indestab"),
                    m(m.route.Link, {href: "/deltagere/piltestab"}, "Piltestab"),
                    m(m.route.Link, {href: "/deltagere/væbnerstab"}, "Væbnerstab"),
                    m(m.route.Link, {href: "/deltagere/resten"}, "Resten"),
                    m(m.route.Link, {href: "/deltagere/alle"}, "Alle"),
                    m(m.route.Link, {href: "/deltagere/problematiske"}, "Problematiske"),
                    m(m.route.Link, {href: "/deltagere/transport"}, "Transport"),
                    m(m.route.Link, {href: "/deltagere/fødselsdage"}, "Fødselsdage"),
                    m(m.route.Link, {href: "/deltagere/køkken"}, "Køkken"),
                    m(m.route.Link, {href: "/deltagere/lejrlæge"}, "Lejrlæge"),
                    m(m.route.Link, {href: "/deltagere/søg", "class": "disabled"}, "Søg"),
                   )),
                m(".dropdown",
                  m("a", "Livgrupper"),
                  m(".dropdown-content",
                    m(m.route.Link, {href: "/livgrupper/tilmeld", "class": "disabled"}, "Tilmeld"),
                    m(m.route.Link, {href: "/livgrupper/minus"}, "Minussystem"),
                    m(m.route.Link, {href: "/livgrupper/arbejdsbyrde"}, "Arbejdsbyrde"),
                   )),
                m(".dropdown",
                  m("a", "Sekretær"),
                  m(".dropdown-content",
                    m(m.route.Link, {href: "/sekretær/ret-program", "class": "disabled"}, "Ret program"),
                    m(m.route.Link, {href: "/sekretær/grupper"}, "Udvalg / Jobs"),
                    m(m.route.Link, {href: "/sekretær/tjanser", "class": "disabled"}, "Tjanser"),
                    m(m.route.Link, {href: "/sekretær/bordhold", "class": "disabled"}, "Bordhold"),
                    m(m.route.Link, {href: "/sekretær/værelser", "class": "disabled"}, "Værelser"),
                   )),
                // m(m.route.Link, {href: "/udvalg"}, "Udvalg"),
                // m(m.route.Link, {href: "/livgrupper"}, "Livgrupper"),
                // m(m.route.Link, {href: "/opgaver"}, "Opgaver"),
                // m(m.route.Link, {href: "/bordhold"}, "Bordhold"),
               ),
              m(".print",
                m(".header-title", "Klinteborg 2023"),
                m("div", vnode.attrs.title),
                m("div", formatDateTime(new Date())),
               ),
             ),
            m(ErrorView),
            m("main", vnode.children),
            m(ModalBase),
            m(UiLoadingApi),
        ]);
    }
    public static wrap(cls: any, title: string) {
        return {
            render: function(vnode: m.Vnode) {
                return m(Layout, {title: title}, m(cls, {...vnode.attrs}));
            }
        };
    }
}

m.route(document.body, "/", {
    "/": Layout.wrap(PageFrontpage, "Klinteborg"),
    "/deltagere/indestab":   Layout.wrap(PageDeltagereIndestab, "Deltagere Indestab"),
    "/deltagere/piltestab":  Layout.wrap(PageDeltagerePiltestab, "Deltagere Piltestab"),
    "/deltagere/væbnerstab": Layout.wrap(PageDeltagereVæbnerstab, "Deltagere Væbnerstab"),
    "/deltagere/resten":     Layout.wrap(PageDeltagereResten, "Deltagere Resten"),
    "/deltagere/alle":       Layout.wrap(PageDeltagereAlle, "Deltagere Alle"),
    "/deltagere/problematiske": Layout.wrap(PageDeltagereProblematiske, "Deltagere Problematiske"),
    "/deltagere/transport":  Layout.wrap(PageDeltagereTransport, "Deltagere Transport"),
    "/deltagere/fødselsdage": Layout.wrap(PageDeltagereFødselsdage, "Deltagere Fødselsdage"),
    "/deltagere/køkken":   Layout.wrap(PageDeltagereKøkken, "Køkken"),
    "/deltagere/lejrlæge":   Layout.wrap(PageDeltagereLejrlæge, "Lejrlægelisten"),
    "/deltagere/afkrydsning": Layout.wrap(PageDeltagereAfkrydsning, "Afkrydsning"),
    "/deltagere/telefoner":  Layout.wrap(PageDeltagereTelefoner, "Telefoner"),
    "/deltagere/sangbog":  Layout.wrap(PageDeltagereSangbog, "Sangbog"),
    "/deltagere/væbnerkop":  Layout.wrap(PageDeltagereVæbnerkop, "Væbnerkop"),
    "/deltagere/post":  Layout.wrap(PageDeltagerePost, "Post"),
    "/deltager/:fdfid":      Layout.wrap(PageDeltager, "Deltager"),
    "/deltagere/søg":        Layout.wrap(PageDeltagereSøg, "Deltagere Søg"),


    "/livgrupper/admin-old":     Layout.wrap(PageLivgrupperAdminOld, "Livgrupper"),
    "/livgrupper/minus":     Layout.wrap(PageMinus, "Minussystem"),
    "/livgrupper/arbejdsbyrde":     Layout.wrap(PageArbejdsbyrde, "Arbejdsbyrde"),

    "/sekretær/grupper":     Layout.wrap(PageGrupper, "Udvalg / Jobs"),

    "/admin":                Layout.wrap(PageAdmin, "Admin"),
    "/:404...":              Layout.wrap(NotFound, "Siden mangler"),
});

DELTAGER_SERVICE.downloadDeltagere();
window.m = m;
window.Stream = Stream;

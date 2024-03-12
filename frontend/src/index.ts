import m from "mithril";
import Stream from "mithril/stream";
import {ErrorView} from "src/error";
import {ModalBase} from "src/modal";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {PageDeltager} from "src/deltagere/page_deltager";
import {
    PageDeltagereIndestab,
    PageDeltagerePiltestab,
    PageDeltagereVæbnerstab,
    PageDeltagereResten,
    PageDeltagereAlle,
}                                   from "src/deltagere/lister/page_deltagere_basic";
import {PageDeltagereProblematiske} from "src/deltagere/lister/page_deltagere_problematiske";
import {PageDeltagereTransport}     from "src/deltagere/lister/page_deltagere_transport";
import {PageDeltagereFødselsdage}   from "src/deltagere/lister/page_deltagere_fødselsdage";
import {PageDeltagereKøkken}        from "src/deltagere/lister/page_deltagere_køkken";
import {PageDeltagereLejrlæge}      from "src/deltagere/lister/page_deltagere_lejrlæge";
import {PageDeltagereSøg}           from "src/deltagere/lister/page_deltagere_søg";

import {PageDeltagereAfkrydsning}   from "src/deltagere/lister/page_deltagere_afkrydsning";
import {PageDeltagereTelefoner}     from "src/deltagere/lister/page_deltagere_telefoner";
import {PageDeltagereSangbog}       from "src/deltagere/lister/page_deltagere_sangbog";
import {PageDeltagerePost}          from "src/deltagere/lister/page_deltagere_post";
import {PageDeltagereVæbnerkop}     from "src/deltagere/lister/page_deltagere_væbnerkop";

import {PageLivgrupperAdminOld} from "src/livgrupper/old";
import {PageMinus} from "src/livgrupper/minus/page_minus";
import {PageArbejdsbyrde} from "src/livgrupper/arbejdsbyrde/page_arbejdsbyrde";

import {PageGrupper} from "src/grupper/page_grupper";

import {PageFrontpage} from "src/frontpage/page_frontpage";

import {PageAdmin} from "src/admin/page_admin";

import {UiLoadingApi} from "src/api";
import {formatDateTime} from "src/utils";



// m("span.fdficon", "")


class NotFound {
    public view(vnode: m.Vnode) {
        return m("div", "Siden findes ikke / er ikke lavet færdig");
    }
}

class Layout {
    public view(vnode: m.Vnode<{title: string}>) {
        document.title = vnode.attrs.title;
        if (!SERVICE_DELTAGER.isReady()) {
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
                    m(m.route.Link, {href: "/deltagere/alle"}, "Alle"),
                    m(m.route.Link, {href: "/deltagere/indestab"}, "Indestab"),
                    m(m.route.Link, {href: "/deltagere/piltestab"}, "Piltestab"),
                    m(m.route.Link, {href: "/deltagere/væbnerstab"}, "Væbnerstab"),
                    m(m.route.Link, {href: "/deltagere/resten"}, "Resten"),
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
                m(".spacer"),
                m(".dropdown.right",
                  m("a", m("span.fdficon", "\uf3c7")),
                  m(".dropdown-content",
                    m(m.route.Link, {href: "/", "class": "disabled"}, "Mine data"),
                    m(m.route.Link, {href: "/", "class": "disabled"}, "Log ud"),
                   )),
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
    "/deltagere/alle":       Layout.wrap(PageDeltagereAlle, "Deltagere Alle"),
    "/deltagere/indestab":   Layout.wrap(PageDeltagereIndestab, "Deltagere Indestab"),
    "/deltagere/piltestab":  Layout.wrap(PageDeltagerePiltestab, "Deltagere Piltestab"),
    "/deltagere/væbnerstab": Layout.wrap(PageDeltagereVæbnerstab, "Deltagere Væbnerstab"),
    "/deltagere/resten":     Layout.wrap(PageDeltagereResten, "Deltagere Resten"),
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

SERVICE_DELTAGER.downloadDeltagere();
// @ts-ignore
window.m = m;
// @ts-ignore
window.Stream = Stream;

import m from "mithril";
import {
    ErrorView
} from "./error";
import {DELTAGERE_STATE} from "./deltagere_state";
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
import {PageDeltagereLejrlæge} from "./deltagere/lejrlæge";
import {PageDeltagereSøg} from "./deltagere/søg";
import {PageDeltager} from "./deltagere/deltager";

import {PageLivgrupperAdmin} from "./livgrupper";
import {formatDateTime} from "./utils";



// m("span.fdficon", "")
class Index {
    public view(vnode: m.Vnode) {
        return m("div", "Vi skal snart på Klinteborg!",
                 m("h1", "Abc def ghi"),
                 m("h2", "Abc def ghi"),
                 m("h3", "Abc def ghi"),
                 m("h4", "Abc def ghi"),
                 m("h5", "Abc def ghi"),
                 m("h6", "Abc def ghi"),
                 m("div", "Abc def ghi"),

                 m("h1", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h2", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h3", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h4", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h5", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h6", "Abc def ghi"),
                );
    }
}

class NotFound {
    public view(vnode: m.Vnode) {
        return m("div", "Siden findes ikke / er ikke lavet færdig");
    }
}

class Layout {
    public view(vnode: m.Vnode<{title: string}>) {
        document.title = vnode.attrs.title;
        if (DELTAGERE_STATE.deltagere.length == 0) {
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
                    m(m.route.Link, {href: "/deltagere/lejrlæge"}, "Lejrlæge"),
                    m(m.route.Link, {href: "/deltagere/søg", "class": "disabled"}, "Søg"),
                   )),
                m(".dropdown",
                  m("a", "Livgrupper"),
                  m(".dropdown-content",
                    m(m.route.Link, {href: "/livgrupper/tilmeld", "class": "disabled"}, "Tilmeld"),
                    m(m.route.Link, {href: "/livgrupper/administrer", "class": "disabled"}, "Administrer"),
                   )),
                m(".dropdown",
                  m("a", "Sekretær"),
                  m(".dropdown-content",
                    m(m.route.Link, {href: "/sekretær/ret-program", "class": "disabled"}, "Ret program"),
                    m(m.route.Link, {href: "/sekretær/udvalg", "class": "disabled"}, "Udvalg / Jobs"),
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
    "/": Layout.wrap(Index, "Klinteborg"),
    "/deltagere/indestab":   Layout.wrap(PageDeltagereIndestab, "Deltagere Indestab"),
    "/deltagere/piltestab":  Layout.wrap(PageDeltagerePiltestab, "Deltagere Piltestab"),
    "/deltagere/væbnerstab": Layout.wrap(PageDeltagereVæbnerstab, "Deltagere Væbnerstab"),
    "/deltagere/resten":     Layout.wrap(PageDeltagereResten, "Deltagere Resten"),
    "/deltagere/alle":       Layout.wrap(PageDeltagereAlle, "Deltagere Alle"),
    "/deltagere/problematiske": Layout.wrap(PageDeltagereProblematiske, "Deltagere Problematiske"),
    "/deltagere/transport":  Layout.wrap(PageDeltagereTransport, "Deltagere Transport"),
    "/deltagere/fødselsdage": Layout.wrap(PageDeltagereFødselsdage, "Deltagere Fødselsdage"),
    "/deltagere/lejrlæge":   Layout.wrap(PageDeltagereLejrlæge, "Lejrlæge listen"),
    "/deltager/:fdfid":      Layout.wrap(PageDeltager, "Deltager"),
    "/deltagere/søg":        Layout.wrap(PageDeltagereSøg, "Deltagere Søg"),
    "/livgrupper/admin":     Layout.wrap(PageLivgrupperAdmin, "Livgrupper"),
    "/:404...":              Layout.wrap(NotFound, "Siden mangler"),
});

DELTAGERE_STATE.download();

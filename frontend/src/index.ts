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
    PageDeltagereMærkelige,
    PageDeltagereSøg
} from "./deltagere_page";



// m("span.fdficon", "")
class Index {
    public view(vnode: m.Vnode) {
        return m("div", "Vi skal snart på Klinteborg!", );
    }
}

class NotFound {
    public view(vnode: m.Vnode) {
        return m("div", "Siden findes ikke / er ikke lavet færdig");
    }
}

class Layout {
    public view(vnode: m.Vnode) {
        // let error = getError();
        // let error = null;
        // let errorNode = error ? m(".error") {onclick:
        // console.log(DELTAGERE_STATE.deltagere);
        return m.fragment(
            {},
            [
                m("header",
                  m("nav",
                    m("a", {href: "/"},
                      m(".header-title", "Klinteborg"),
                      m(".header-title-year", "2023")),
                    m(".dropdown",
                      m("a", "Program"),
                      m(".dropdown-content",
                        m(m.route.Link, {href: "/program/mit"}, "Mit program"),
                        m(m.route.Link, {href: "/program/lejrens"}, "Lejrens program"),
                        m(m.route.Link, {href: "/program/dags"}, "Dagsprogram"),
                       )),
                    m(".dropdown",
                      m("a", "Deltagere"),
                      m(".dropdown-content",
                        m(m.route.Link, {href: "/deltagere/indestab"}, "Indestab"),
                        m(m.route.Link, {href: "/deltagere/piltestab"}, "Piltestab"),
                        m(m.route.Link, {href: "/deltagere/væbnerstab"}, "Væbnerstab"),
                        m(m.route.Link, {href: "/deltagere/resten"}, "Resten"),
                        m(m.route.Link, {href: "/deltagere/mærkelige"}, "Mærkelige"),
                        m(m.route.Link, {href: "/deltagere/søg"}, "Søg"),
                       )),
                    m(".dropdown",
                      m("a", "Livgrupper"),
                      m(".dropdown-content",
                        m(m.route.Link, {href: "/livgrupper/tilmeld"}, "Tilmeld"),
                        m(m.route.Link, {href: "/livgrupper/administrer"}, "Administrer"),
                       )),
                    m(".dropdown",
                      m("a", "Sekretær"),
                      m(".dropdown-content",
                        m(m.route.Link, {href: "/sekretær/ret-program"}, "Ret program"),
                        m(m.route.Link, {href: "/sekretær/udvalg"}, "Udvalg / Jobs"),
                        m(m.route.Link, {href: "/sekretær/tjanser"}, "Tjanser"),
                        m(m.route.Link, {href: "/sekretær/bordhold"}, "Bordhold"),
                        m(m.route.Link, {href: "/sekretær/værelser"}, "Værelser"),
                       )),

                    // m(m.route.Link, {href: "/udvalg"}, "Udvalg"),
                    // m(m.route.Link, {href: "/livgrupper"}, "Livgrupper"),
                    // m(m.route.Link, {href: "/opgaver"}, "Opgaver"),
                    // m(m.route.Link, {href: "/bordhold"}, "Bordhold"),
                   ),
                 ),
                m(ErrorView),
                m("main", vnode.children),
            ]);
    }
    public static wrap(cls: any) {
        return {
            render: function() {
                return m(Layout, m(cls));
            }
        };
    }
}

m.route(document.body, "/", {
    "/": Layout.wrap(Index),
    "/deltagere/indestab": Layout.wrap(PageDeltagereIndestab),
    "/deltagere/piltestab": Layout.wrap(PageDeltagerePiltestab),
    "/deltagere/væbnerstab": Layout.wrap(PageDeltagereVæbnerstab),
    "/deltagere/resten": Layout.wrap(PageDeltagereResten),
    "/deltagere/mærkelige": Layout.wrap(PageDeltagereMærkelige),
    "/deltagere/søg": Layout.wrap(PageDeltagereSøg),
    "/:404...": Layout.wrap(NotFound),
});


DELTAGERE_STATE.download();

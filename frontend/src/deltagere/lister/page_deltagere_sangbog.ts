import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {SERVICE_DELTAGER} from "src/deltagere/service_deltager";
import {Deltager} from "src/deltagere/model_deltager";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";
import {UiDays} from "src/deltagere/ui_days";


export class PageDeltagereSangbog {
    public view(vnode: m.Vnode) {
        // let content = $it([{x: "a", y:1},
        //                    {x: "a", y:2},
        //                    {x: "b", y:3},
        //                    {x: "b", y:4}])
        //     .mapRuns((foo) => foo.x,
        //              (foo) => "hej"+foo.y,
        //              (foos, x) => [x, foos])
        //     .List();
        // console.log(content)
        // // return null;


        function f(key) {
        let content = $it(SERVICE_DELTAGER.deltagere())
            .filter((deltager) => deltager.tilmelding["Sangbog"])
            .filter(key)
            // .sort((deltager) => [deltager.tilmelding["Sangbog"], deltager.er_voksen, deltager.dage, deltager.navn, deltager.patrulje.order])
            .sort((deltager) => [deltager.bordhold_uge1 || deltager.bordhold_uge2, deltager.er_voksen, deltager.navn])
            .map((deltager) =>
                m("tr",
                  m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
                  m("td", deltager.tilmelding["Sangbog"].includes(" med ") ? "spiral" : "almindelig"),
                  m("td", deltager.bordhold_uge1),
                  m("td", deltager.bordhold_uge2),
                  m("td", deltager.patrulje.name),
                  m("td", m(UiDays, {days: deltager.dage})),
                  // m("td", deltager.tilmelding["Sangbog"]),
                 ))
            .List();
            return m("table",
                     m("thead",
                       m("tr",
                         m("th", "Navn"),
                         m("th", "type"),
                         m("th", "Bord 1"),
                         m("th", "Bord 2"),
                         m("th", "Patrulje"),
                         m("th", "Dage"),
                        )),
                     m("tbody", content));
        }


            // .mapRuns((deltager) => deltager.tilmelding["Sangbog"],
            //          (deltager) => m("tr",
            //                          m("td", m(m.route.Link, {selector: "a.subdued-link", href: "/deltager/:fdfid", params: {fdfid: deltager.fdfid}}, deltager.navn)),
            //                          m("td", deltager.patrulje.name),
            //                          m("td", m(UiDays, {days: deltager.dage})),
            //                          m("td", deltager.bordhold_uge1),
            //                          m("td", deltager.bordhold_uge2),
            //                          // m("td", deltager.tilmelding["Sangbog"]),
            //                         ),
            //          (deltagere, variable) => m("table",
            //                                     m("tbody",
            //                                       m("tr",
            //                                         m("th", {colspan: 4}, variable),
            //                                         m("th", deltagere.length),
            //                                        ),
            //                                       deltagere)))
            // .List();
        // return content;
        return [m("h1", "Uge 1"),
                f((deltager) => deltager.bordhold_uge1),
                m("h1", "Uge 2"),
                f((deltager) => (deltager.bordhold_uge2 && !deltager.bordhold_uge1)),
                ]
    }
}

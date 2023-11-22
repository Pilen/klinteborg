import m from "mithril";
import {error} from "src/error";
import {$it, Iter, foo} from "src/lib/iter";
import {DELTAGER_SERVICE, Deltager} from "src/services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES} from "src/definitions";
import {H1, H2, H5, Tr, formatDate, calculateAge} from "src/utils";


export class Days {
    public view(vnode: m.Vnode<{days: Array<Tilstede>}>) {
        let days = $it(vnode.attrs.days).zip(DAYS).map(([day, weekday]) => {
            if (day === "Ja") {
                return m("span.day-ja", {title: weekday}, "+");
            }
            if (day === "Nej") {
                return m("span.day-nej", "_");
            }
            if (day === "Måske") {
                return m("span.day-måske", "?");
            }
            if (day === "Delvist") {
                return m("span.day-delvist", "%");
            }
        }).List();
        return m("div.days",
                 days[0],
                 days[1],
                 m("span.dag-sep", ":"),
                 days[2],
                 days[3],
                 days[4],
                 days[5],
                 days[6],
                 m("span.dag-sep", ":"),
                 days[7],
                 days[8],
                 m("span.dag-sep", ":"),
                 days[9],
                 days[10],
                 days[11],
                 days[12],
                 days[13],
                 m("span.dag-sep", ":"),
                 days[14],
                );
    }
}

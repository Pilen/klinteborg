import m from "mithril";
import {error} from "./error";
import {$it, Iter, foo} from "./lib/iter";
import {DELTAGER_SERVICE, Deltager} from "./services/deltager_service";
import {Stab, Patrulje, Tilstede, DAYS, DATES, START_DATE} from "./definitions";
import {H1, H2, H5, Tr, formatDate, addDays} from "./utils";

function handle(deltager, i) {
    let day = addDays(START_DATE, i);
    let d = deltager.dage[i];
    if (d == "Nej") {
        return "_,_,";

    }
    if (d != "Ja") {
        return "q,q,";
    }
    if (formatDate(day) == formatDate(deltager.ankomst_dato)) {
        if (deltager.ankomst_type == "Fælles") {
            return "t,x,";
        }
        if (deltager.ankomst_type == "Samkørsel") {
            return "t,x,";
        }
        if (deltager.ankomst_type == "Egen") {
            if (deltager.ankomst_tidspunkt < 15) {
                return "t,x,";
            }
            return "t,t,";
        }
        console.error("failure")
    }
    if (formatDate(day) == formatDate(deltager.afrejse_dato)) {
        if (deltager.afrejse_type == "Fælles") {
            return "t,t,";
        }
        if (deltager.afrejse_type == "Samkørsel") {
            return "t,t,";
        }
        if (deltager.afrejse_type == "Egen") {
            if (deltager.afrejse_tidspunkt > 14) {
                return "x,t,";
            }
            return "t,t,";
        }
        console.error("failure")
    }
    return "x,x,";

}
function split(t) {
    return [t.substring(0, 2), "], [", t.substring(2, 4), " "]
}

export class PageLivgrupperAdmin {
    public view(vnode: m.Vnode) {
        let longest = 0;
        let ledere = $it(DELTAGER_SERVICE.deltagere())
            .filter((deltager) => deltager.navn === "Nadia Sara Møller" || (
                deltager.er_voksen &&
                deltager.patrulje != Patrulje.get("Numlinge") &&
                deltager.patrulje != Patrulje.get("?") &&
                deltager.patrulje != Patrulje.get("Ingen")))
            .sort((deltager) => [
                // deltager.patrulje.order,
                deltager.navn
            ])
            .sideEffect((deltager) => {
                if (deltager.navn.length > longest) {
                    longest = deltager.navn.length;
                }
            })
            .List();
        let row = $it(ledere)
            .map((deltager) => [
                "Person(",
                deltager.fdfid, ", ",
                `"${deltager.navn}",`.padEnd(longest+2+2),
                "[",
                handle(deltager, 0), " ",
                handle(deltager, 1), " ",
                "   ",
                handle(deltager, 2), " ",
                handle(deltager, 3), " ",
                handle(deltager, 4), " ",
                handle(deltager, 5), " ",
                handle(deltager, 6), " ",
                "   ",
                split(handle(deltager, 7)),
                handle(deltager, 8), " ",
                "   ",
                handle(deltager, 9), " ",
                handle(deltager, 10), " ",
                handle(deltager, 11), " ",
                handle(deltager, 12), " ",
                handle(deltager, 13), " ",
                "   ",
                handle(deltager, 14),
                "], ",
                deltager.row["Leder-oplysninger / Tutvagt"] ? "True" : "False", ", ",
                deltager.row["Leder-oplysninger / Bundgarnspæl"] ? "True" : "False",
                "),\n",

            ])
            .List();
        return m("pre", row);
    }
}

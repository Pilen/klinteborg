import m from "mithril";

export function formatDateTime(d: Date): string {
    let year = d.getFullYear();
    let month = d.getMonth() + 1; // Why would they make month zero based?!
    let day = d.getDate();
    let hours_int = d.getHours();
    let hours_string = "00" + hours_int;
    let hours = hours_string.substr(hours_string.length-2);
    let minutes_int = d.getMinutes();
    let minutes_string = "00" + minutes_int;
    let minutes = minutes_string.substr(minutes_string.length-2);
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatDate(d: Date): string {
    let year = d.getFullYear();
    let month = d.getMonth() + 1; // Why would they make month zero based?!
    let day = d.getDate();
    return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function calculateAge(date: Date): number {
    let delta = Date.now() - date;
    let d = new Date(delta)
    return Math.abs(d.getUTCFullYear() - 1970)
}

export function calculateModa(date: Date): number {
    return (date.getMonth() + 1) * 100 + date.getDate();
}

export class Breakable {
    tag = "span";
    isBreaking: boolean;
    constructor(vnode: m.Vnode) {
        this.isBreaking = !!vnode.attrs.break;
    }
    public view(vnode: m.Vnode) {
        return m(this.tag,
                 {class: this.isBreaking ? "breakable breakable-break" : "breakable breakable-no-break",
                  title: "⤶: Sideskift i print",
                  onclick: (e) => {this.isBreaking = !this.isBreaking}},
                 vnode.children,
                );
    }
}
export class H1 extends Breakable {
    tag = "h1"
}
export class H2 extends Breakable {
    tag = "h2"
}
export class H3 extends Breakable {
    tag = "h3"
}
export class H4 extends Breakable {
    tag = "h4"
}
export class H5 extends Breakable {
    tag = "h5"
}
export class H6 extends Breakable {
    tag = "h6"
}

export class Tr extends Breakable {
    tag = "tr"
}

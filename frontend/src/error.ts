import m from "mithril";


let current_error = null;

export function error(status, message?) {
    if (typeof(status) === "object" && message === undefined) {
        // @ts-ignore
        // window.e = status;
        let arg = status;
        status = arg.code;
        if (arg.message !== "[object Object]") {
            message = arg.message;
        } else {
            if (arg.response.hasOwnProperty("detail") && Object.keys(arg.response).length == 1 && typeof(arg.response.detail) === "string") {
                message = arg.response.detail;
            } else {
                message = JSON.stringify(arg.response);
            }
        }
        if (message === null) {
            message = "Internal Server Error";
        }
    }
    if (current_error && current_error.status == status && current_error.message == message) {
    } else {
        m.redraw();
    }
    current_error = {status: status, message: message};
}

export function getError() {
    return current_error;
}

export function clearError() {
    current_error = null;
}

export class ErrorView {
    public view() {
        if (current_error === null) {
            return null;
        }
        return m(".error",
                 {onclick: clearError},
                 // @ts-ignore
                 m("span.header", `⚠ Fejl ${current_error.status}: `),
                 // @ts-ignore
                 m("span.body", current_error.message));
    }
}

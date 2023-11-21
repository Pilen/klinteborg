import m from "mithril";
import {error} from "./error";

let loadingApis = new Set();

export class Api {
    constructor(method, url, then) {
        this._method = method;
        this._url = url;
        this._then = then;
        this._request = null;
        this._xhr = null;
    }
    public get(url) {
        this._method = "GET";
        this._url = url;
    }
    public post(url) {
        this._method = "POST";
        this._url = url;
    }
    public then(then) {
        this._then = then;
    }

    public request(body, params) {
        if (this._request !== null) {
            return;
        }
        let options = {
            method: this._method,
            url: thir._url,
            withCredentials: true
            params: params,
            body: body,
            config: (xhr) => {this._xhr = xhr;},
        };
        this._request = m.request(this._options)
            .catch((e) => {
                this.done();
                error(e);
            })
            .then((data) => {
                this.done();
                let result = this._then(data);
                return result;
            })
            .catch((e) => {
                error(e);
            });
        loadingApis.add(this);
    }

    public newRequest(body, params) {
        this.abort();
        this.request(body, params);
    }

    public abort() {
        if (this._xhr !== null) {
            this._xhr.abort();
            this.done();
        }
    }

    private done() {
        this._request = null;
        this._xhr = null;
        loadingApis.delete(this);
    }
}

export class ApiStream extends Api{
    constructor(method, url, then) {
        super(method, url, then);
        this._stream = Stream();
    }

    public request(body, params) {
        if (this._request !== null) {
            return;
        }
        let options = {
            method: this._method,
            url: thir._url,
            withCredentials: true
            params: params,
            body: body,
            config: (xhr) => {this._xhr = xhr;},
        };
        this._request = m.request(this._options)
            .catch((e) => {
                this.done();
                error(e);
            })
            .then((data) => {
                this.done();
                let result = this._then(data);
                this._stream(result); // This is the difference between Api.request and ApiStream.request
                return result;
            })
            .catch((e) => {
                error(e);
            });
        loadingApis.add(this);
    }

    public stream(body, params) {
        if (this._stream() === undefined) {
            this.request(body, params);
        }
        return this._stream;
    }

}


export class UiLoadingApi {
    public view(vnode: m.Vnode) {
        if (loadingApis.size === 0) {
            return null;
        }
        return m("div.loading-full",
                 m("p",
                   m("h1", "Loading..."),
                   `${loadingApis.size} remaining`,
                  )
                );
    }
}

window.Api = Api;
window.loadingApis = loadingApis;

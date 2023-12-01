import m from "mithril";
import Stream from "mithril/stream";
import {error} from "src/error";

let loadingApis = new Set();

export class Api {
    _method: string;
    _url: string;
    _then: (any) => any;
    _request: Promise<any> | null;
    _xhr: XMLHttpRequest | null;
    constructor(method = undefined, url = undefined, then = undefined) {
        this._method = method;
        this._url = url;
        this._then = then;
        this._request = null;
        this._xhr = null;
        if (this._then === undefined) {
            this._then = (result) => result;
        }
    }
    public get(url) {
        this._method = "GET";
        this._url = url;
        return this;
    }
    public post(url) {
        this._method = "POST";
        this._url = url;
        return this;
    }
    public then(then) {
        this._then = then;
        return this;
    }

    public request(body = undefined, params = undefined) {
        if (this._request !== null) {
            return;
        }
        let options = {
            method: this._method,
            url: this._url,
            withCredentials: true,
            params: params,
            body: body,
            config: (xhr) => {this._xhr = xhr;},
        };
        this._request = m.request(options)
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
        return this._request;
    }
    protected _post_then(result) {

    }

    public newRequest(body = undefined, params = undefined) {
        this.abort();
        return this.request(body, params);
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

export class ApiStream<T> extends Api{
    _stream: Stream<T>;
    constructor(method = undefined, url = undefined, then = undefined) {
        super(method, url, then);
        this._stream = Stream();
    }

    public request(body = undefined, params = undefined) {
        let r = super.request(body, params);
        r.then((result) => {
            this._stream(result);
            return result;
        })
        return r;
    }
    // public request(body, params) {
    //     if (this._request !== null) {
    //         return;
    //     }
    //     let options = {
    //         method: this._method,
    //         url: this._url,
    //         withCredentials: true,
    //         params: params,
    //         body: body,
    //         config: (xhr) => {this._xhr = xhr;},
    //     };
    //     this._request = m.request(options)
    //         .catch((e) => {
    //             this.done();
    //             error(e);
    //         })
    //         .then((data) => {
    //             this.done();
    //             let result = this._then(data);
    //             this._stream(result); // This is the difference between Api.request and ApiStream.request
    //             return result;
    //         })
    //         .catch((e) => {
    //             error(e);
    //         });
    //     loadingApis.add(this);
    // }

    public stream(body = undefined, params = undefined) {
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

// @ts-ignore
window.Api = Api;
// @ts-ignore
window.loadingApis = loadingApis;

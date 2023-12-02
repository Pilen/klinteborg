import m from "mithril";
import {$it, Iter, make_extract} from "src/lib/iter";

function escapeRegExp(string) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export class SearchEngine<T> {
    data: Array<{text: string, value: T}>;
    onSelect: (v: T) => void;
    query: string;
    suggestions: Array<{text: string, value: T, score: number}>;
    totalResults: number;
    limit: number;
    active: number | null;
    // task: number;
    // taskDelay: number = 100; // milliseconds

    constructor(
        data: Array<T>,
        extract: string | number | ((T) => string),
        onSelect: (T) => void,
        limit: number = 20,
    ) {
        let _extract = make_extract(extract);
        this.data = $it(data).map((entry) => ({text: _extract(entry), value: entry})).List();
        this.onSelect = onSelect;
        this.query = "";
        this.suggestions = [];
        this.totalResults = 0;
        this.limit = limit;
        this.active = null;
        // this.task = null;
    }

    public handleKey(e) {
        const [RETURN, UP, DOWN] = [13, 38, 40];
        if (e.keyCode === RETURN) {
            this.select();
        } else if (e.keyCode === UP) {
            if (this.active > 0) {
                this.active--;
            }
        } else if (e.keyCode === DOWN) {
            if (this.active < this.suggestions.length - 1) {
                this.active++;
            }
        }
    }

    public select() {
        this.onSelect(this.suggestions[this.active].value)
        this.clear();
    }

    public clear() {
        this.query = "";
        this.suggestions = []
        this.active = null;
        // clearTimeout(this.task); // Does not care about null
    }

    public search(query) {
        this.query = query;
        this.totalResults = 0;
        this.active = 0;
        if (this.query === "") {
            this.suggestions = [];
            return;
        }
        let pattern = new RegExp("\\b" + escapeRegExp(this.query).replaceAll(/\s+/g, ".*\\b"), "i"); // Should we add a word boundery to the beginning of pattern, or is it fine that the first query can be used to match against internal parts of the words?
        this.suggestions = $it(this.data)
            .map(({text, value}) => ({score: text.search(pattern), text, value}))
            .filter(({score, text, value}) => score >= 0)
            .sideEffect((_, i) => {this.totalResults = i + 1;})
            .sort(({score, text, value}) => [score, text])
            .takeFirst(this.limit)
            .List();

    }
}


export class Search<T> {
    public oncreate(vnode: m.Vnode<{autofocus: boolean | undefined}>) {
        if (vnode.attrs.autofocus === true) {
            vnode.dom.firstChild.focus();
        }
    }
    public view(vnode: m.Vnode<{engine: SearchEngine<T>, render: (T) => any}>) {
        let engine = vnode.attrs.engine;
        let render = vnode.attrs.render;
        let suggestions = null;
        if (engine.suggestions.length > 0) {
            suggestions = (
                m("ul.search-suggestions",
                  $it(engine.suggestions).map((suggestion, i) => (
                      m("li.search-suggestion",
                        {"class": i === engine.active ? "search-suggestion-active" : null,
                         onmouseenter: (e) => {engine.active = i;},
                         onclick: (e) => engine.select(),
                        },
                        render(suggestion.value),
                       ))).List()
                 ));
        }
        return m(".search",
                 m("input",
                   {value: engine.query,
                    oninput: (e) => engine.search(e.currentTarget.value),
                    onkeydown: (e) => engine.handleKey(e),
                   }),
                 suggestions);

    }
}

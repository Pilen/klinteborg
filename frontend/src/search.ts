import m from "mithril";
import {$it, Iter, make_extract} from "./lib/iter";

function escapeRegExp(string) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export class SearchEngine<T> {
    data: Array<[string, T]>;
    onSelect: (v: T) => void;
    query: string;
    suggestions: Array<{

    }>;
    totalResults: number;
    limit: number;
    active: number | null;
    // task: number;
    // taskDelay: number = 100; // milliseconds

    constructor(
        data: Array<T>,
        extract: any,
        onSelect) {
        extract = make_extract(extract)
        this.data = $it(data).map((entry) => [extract(entry), entry]).List();
        this.onSelect = onSelect;
        this.query = "";
        this.suggestions = [];
        this.totalResults = 0;
        this.limit = 20;
        // this.limit = 5;
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
        console.log(this.data);
        this.suggestions = (
            $it(this.data)
                .map(([text, value]) => [text.search(pattern), text, value])
                .filter(([score, text, value]) => score >= 0)
                .sideEffect((_, i) => {this.totalResults = i + 1})
                .sort(([score, text, value]) => [score, text])
                .takeFirst(this.limit)
                .map(([score, text, value]) => ({score: score, text: text, value: value}))
                .List());
    }
}


export class Search<T> {
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

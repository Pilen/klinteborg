
export function $it<T>(it: Iter<T> | Iterable<T>): Iter<T> {
    if (it instanceof Iter) {
        return it
    }
    return new Iter(function*() {
        for (let item of it) {
            yield item;
        }
    });
}
$it.range = function(start: number, stop?: number, step?: number) {
    if (step === undefined) {
        step = 1;
    }
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    return new Iter(function*() {
        for (let i = start; i < stop; i += step) {
            yield i
        }
    });
}
$it.repeat = function<T>(item: T) {
    return new Iter(function*() {
        while (true) {
            yield item;
        }
    });
}
$it.objectEntries = function(obj: Object): Iter<[string, any]> {
    return new Iter(function*() {
        for (let key in obj) {
            yield [key, obj[key]];
        }
    });
}
$it.mapEntries = function<K, V>(map: Map<K, V>) {
    // Iterating over maps yields tuples
    return $it(map);
}


export class Iter<T> {
    it: Iterable<T>;

    constructor(it: () => Iterable<T>) {
        this.it = it();
    }

    public map<T2>(func: (x: T, y?: number) => T2) {
        let it = this.it;
        return new Iter(function*() {
            let i = 0;
            for (let item of it) {
                yield func(item, i);
                i++;
            }
        });
    }

    public filter(pred: (x: T) => boolean) {
        let it = this.it;
        return new Iter(function*() {
            for (let item of it) {
                if (pred(item)) {
                    yield item;
                }
            }
        });
    }

    public flatten() {
        // Types are broken for this
        // Unfortunately this loses the type information and produces an Iter<any>
        let it = this.it;
        return new Iter(function*() {
            for (let items of it) {
                // @ts-ignore
                for (let item of items) {
                    yield item;
                }
            }
        })
    }

    public zip<T2>(other: Iter<T2> | Iterable<T2>): Iter<[T, T2]> {
        let it = this.it;
        let otherIter = $it(other);
        return new Iter(function*() {
            while (true) {
                // @ts-ignore
                let my = it.next();
                // @ts-ignore
                let ot = otherIter.it.next();
                if (my.done || ot.done) {
                    return;
                }
                yield [my.value, ot.value];
            }
        })
    }

    public zipl<T2>(other: Iter<T2> | Iterable<T2>, default_value_a: T, default_value_b: T2): Iter<[T, T2]>{
        let it = this.it;
        let otherIter = $it(other);
        return new Iter(function*() {
            // @ts-ignore
            let my = it.next();
            // @ts-ignore
            let ot = it.next();
            if (my.done && ot.done) {
                return;
            }
            yield [my.done ? default_value_a : my.value,
                   ot.done ? default_value_b : ot.value];
        });
    }

    public zipjects(headers: Iterable<string>) {
        // Types are broken for this
        // Turn an iterable of rows and a list of headers into objects
        let it = this.it;
        let headersList = $it(headers).List();
        return new Iter(function*() {
            for (let row of it) {
                let item = {}
                // @ts-ignore
                $it(headersList).zip(row).map(([key, value]) => item[key] = value).Go();
                yield item;
            }
        });
    }

    public chain(items: Iter<T> | Iterable<T>) {
        let it = this.it;
        let items_it = $it(items).it;
        return new Iter(function*() {
            yield *it;
            yield *items_it;
        });
    }

    public chain_before(items: Iter<T> | Iterable<T>) {
        let it = this.it;
        let items_it = $it(items).it;
        return new Iter(function*() {
            yield *items_it;
            yield *it;
        });
    }

    public interleave(sep: T): Iter<T> {
        let it = this.it;
        return new Iter(function*() {
            // @ts-ignore
            let first = it.next();
            if (first.done) {
                return; // The iter is empty
            }
            yield first.value;
            for (let item of it) {
                yield sep;
                yield item;
            }
        });
    }

    public slice(start: number, stop?: number, step?: number) {
        if (step === undefined) {
            step = 1;
        }
        if (stop === undefined) {
            stop = start;
            start = 0;
        }
        if (start < 0) {
            throw new Error("Start can't be negative")
        }
        throw new Error("Not implemented");
    }

    public takeFirst(n?: number) {
        let it = this.it;
        if (n === undefined) {
            n = 1
        }
        return new Iter(function*() {
            let i = 0;
            for (let item of it) {
                if (i >= n) {
                    return;
                }
                yield item;
            }
        });
    }

    public skipFirst(n?: number) {
        let it = this.it;
        if (n === undefined) {
            n = 1;
        }
        return new Iter(function*() {
            for (let i = 0; i < n; i++) {
                // @ts-ignore
                it.next();
            }
            for (let item of it) {
                yield item;
            }
        });
    }

    public skipAt(skipped: number | Iterable<number>) {
        let it = this.it;
        let indexes: Array<number>;
        if (typeof(skipped) === "number") {
            indexes = [skipped];
        } else {
            indexes = $it(skipped)
                .map(i => {if (typeof(i) !== "number") {throw new Error("Not a number: "+i);}
                           if (i < 0) {throw new Error("Negative index"+i);}
                           return i;})
                .sort(x=>x, true).List();
        }
        return new Iter(function*() {
            // TODO: Decide whether popping is bad, and whether it would be better to just iterate
            let index = indexes.pop();
            let i = 0;
            for (let item of it) {
                if (i !== index) {
                    yield item;
                } else {
                    index = indexes.pop();
                }
                i++;
            }
        });
    }

    public replaceAt(index: number, value: T) {
        let it = this.it;
        return new Iter(function*() {
            for (let item of it) {
                if (index === 0) {
                    yield value;
                } else {
                    yield item;
                }
                index--;
            }
        });
    }

    public enumerate(start?: number): Iter<[number, T]> {
        let it = this.it;
        let index = start === undefined ? 0 : start;
        return new Iter(function*() {
            for (let item of it) {
                yield [index, item];
                index++;
            }
        });
    }

    public sort(key?: (x: T) => any, reverse = false): Iter<T>{
        let it = this.it;
        let extract = make_extract(key);
        return new Iter(function*() {
            let list = [];
            for (let item of it) {
                list.push({value: item, key: extract(item)});
            }

            let EQUAL = 0; // a = b
            let A = -1;    // a < b
            let B = 1;     // a > b
            if (reverse) {
                A = 1;
                B = -1;
            }
            function compare(a: any, b: any) {
                if (Array.isArray(a) && Array.isArray(b)) {
                    let al = a.length;
                    let bl = b.length;
                    let i = 0;
                    while (true) {
                        if (i >= al && i >= bl) {
                            return EQUAL;
                        }
                        if (i < al && i >= bl) {
                            return B;
                        }
                        if (i >= al && i < bl) {
                            return A;
                        }

                        let cmp = compare(a[i], b[i]);
                        if (cmp !== EQUAL) {
                            return cmp;
                        }
                        i++;
                    }
                } else if (a instanceof Date && b instanceof Date) {
                    return compare(a.getTime(), b.getTime());
                } else {
                    if (a < b) {
                        return A;
                    } else if (a > b) {
                        return B;
                    } else if (a === b) {
                        return EQUAL;
                    }
                }
                throw new Error("Error comparing items " + typeof(a) + " " + typeof(b) + "\n" + a + "\n" + b);
            }
            list.sort(function(a, b) {return compare(a.key, b.key)});
            for (let item of list) {
                yield item.value;
            }
        });
    }

    public unique(key?: (T) => any) {
        let it = this.it;
        let extract = make_extract(key);
        return new Iter(function*() {
            let seen = new Set();
            for (let item of it) {
                let key = extract(item);
                if (!seen.has(key)) {
                    seen.add(key);
                    yield item;
                }
            }
        });
    }

    public reverse() {
        let it = this.it;
        let this_ = this;
        return new Iter(function*() {
            let list = this_.List();
            list.reverse();
            for (let item of list) {
                yield item;
            }
        });
    }

    public chunks(size: number): Iter<Array<T>>{
        let it = this.it;
        return new Iter(function*() {
            let chunk = []
            for (let item of it) {
                chunk.push(item);
                if (chunk.length === size) {
                    yield chunk;
                    chunk = [];
                }
            }
            if (chunk.length > 0) {
                yield chunk;
            }
        });
    }

    public pairs(): Iter<[T, T]>{
        let it = this.it;
        return new Iter(function*() {
            // @ts-ignore
            let first = it.next();
            if (first.done) {
                return;
            }
            let previous = first.value
            for (let item of it) {
                yield [previous, item];
                previous = item;
            }
        });
    }

    public itemize<T2>(default_value: T2) {
        // Types are broken for this
        // What is the purporse of this?
        let it = this.it;
        return new Iter(function*() {
            for (let item of it) {
                if (item && Array.isArray(item)) {
                    if (item.length === 1) {
                        yield [item, default_value];
                    } else if (item.length === 2) {
                        yield item;
                    } else {
                        throw new Error("Error! Can't itemize "+item);
                    }
                } else {
                    yield [item, default_value];
                }
            }
        });
    }

    public when(decide: boolean) {
        let it = this.it;
        return new Iter(function*() {
            if (decide) {
                for (let item of it) {
                    yield item;
                }
            }
        });
    }

    public takeUntil(func: (T) => boolean) {
        let it = this.it;
        return new Iter(function*() {
            for (let item of it) {
                if (func(item)) {
                    return;
                }
                yield item;
            }
        });
    }

    public unzip() {
        // Types are broken for this
        let it = this.it;
        return new Iter(function*() {
            let results = [];
            for (let sublist of it) {
                // @ts-ignore
                for (let i = 0; i < sublist.length; i++) {
                    if (i < results.length) {
                        results[i].push(sublist[i]);
                    } else {
                        results.push([sublist[i]]);
                    }
                }
            }
            yield *results;
        });
    }

    public pad<T2>(minLength: number, default_value: T2): Iter<T | T2> {
        let it = this.it;
        let this_ = this;
        return new Iter(function*() {
            for (let item of it) {
                yield item;
                minLength--;
            }
            while (minLength > 0) {
                yield default_value;
                minLength--;
            }
        });
    }

    public padBefore<T2>(minLength: number, default_value: T2): Iter<T | T2> {
        let it = this.it;
        let this_ = this;
        return new Iter(function*() {
            let list = this_.List();
            for (let i = list.length; i < minLength; i++) {
                yield default_value;
            }
            yield *list;
        });
    }

    public unpack(headers: Array<string>) {
        // Types are broken for this
        let it = this.it;
        // EXAMPLE: $it([{a: 1, b: 2}, {a: 3, b: 4, c: 5}]).unpack(["a", "b"]).List() === [[1, 2], [3, 4]];
        return new Iter(function*() {
            for (let item of it) {
                yield $it(headers).map(function(header) {return item[header];}).List();
            }
        });
    }

    public get(key: string) {
        // Types are broken for this
        let it = this.it;
        return new Iter(function*() {
            for (let item of it) {
                yield item[key];
            }
        });
    }

    public collect<T2>(list: Array<T2>, func?: (T) => T2) {
        let it = this.it;
        if (func === undefined) {
            func = x => x;
        }
        return new Iter(function*() {
            for (let item of it) {
                list.push(func(item));
                yield item;
            }
        });
    }

    public sideEffect(func: (x: T, i?: number) => any) {
        let it = this.it;
        return new Iter(function*() {
            let i = 0;
            for (let item of it) {
                func(item, i);
                i++;
                yield item;
            }
        });
    }

    public groupRuns(key): Iter<Array<T>> {
        let it = this.it;
        let extract = make_extract(key);
        let previous = undefined;
        return new Iter(function*() {
            function equal(a: any, b: any): boolean {
                if (typeof(a) != typeof(b)) {
                    return false;
                }
                if (Array.isArray(a)) {
                    if (a.length != b.length) {
                        return false;
                    }
                    for(let i = 0; i < a.length; i++) {
                        if (!equal(a[i], b[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                if (a instanceof Date) {
                    return a.getTime() === b.getTime();
                }
                if (a === b) {
                    return true;
                }
                if (typeof(a) === "string" || typeof(a) === "number" || typeof(a) === "boolean") {
                    return a === b;
                }
                throw new Error("Unable to compare items");
            }
            // @ts-ignore
            let first = it.next();
            if (first.done) {
                return;
            }
            let values = [first.value];
            let current_key = extract(first.value);
            for (let item of it) {
                let next_key = extract(item);
                if (equal(current_key, next_key)) {
                    values.push(item);
                } else {
                    yield values;
                    values = [item];
                    current_key = next_key;
                }
            }
            if (values.length > 0) {
                yield values;
            }
        });
    }



























    public All(): boolean {
        let it = this.it;
        for (let item of it) {
            if (!item) {
                return false;
            }
            return true;
        }
    }

    public Any(): boolean {
        let it = this.it;
        for (let item of it) {
            if (item) {
                return true;
            }
            return false;
        }
    }

    public groupBy(key: string | number | ((T) => any)) {
        // @ts-ignore
        return $it(this.GroupBy(key));
    }
    public GroupBy(key: string | number | ((T) => any)) {
        let it = this.it;
        let extract = make_extract(key);
        let result = new Map();
        for (let item of it) {
            let value = extract(item);
            if (result.has(value)) {
                result.get(value).push(item);
            } else {
                result.set(value, [item]);
            }
        }
        return result;
    }

    public count(default_value?: any) {
        return $it(this.Count(default_value));
    }
    public Count(default_value?: any): Map<T, number> {
        let it = this.it;
        let result = new Map();
        if (default_value !== undefined) {
            throw new Error("What is this used for?")
            // result = $it(default_value).itemize(0).Obj();
        }
        for (let item of it) {
            if (result.has(item)) {
                result.set(item, result.get(item) + 1);
            } else {
                result.set(item, 1);
            }
        }
        return result;
    }

    public StrJoin(sep: string): string {
        return this.List().join(sep);
    }
    public Join(sep: string): string {
        return this.List().join(sep);
    }

    public Length(): number {
        let it = this.it;
        let length = 0;
        // @ts-ignore
        while (!it.next().done) {
            length++;
        }
        // for (let item of it) {
        //     length++;
        // }
        return length;
    }

    public Reduce<T2>(f: (T2, T) => T2, acc: T2): T2 {
        let it = this.it;
        for (let item of it) {
            acc = f(acc, item);
        }
        return acc;
    }

    public List(): Array<T> {
        let it = this.it;
        let list = [];
        for (let item of it) {
            list.push(item);
        }
        return list;
    }

    public Obj() {
        let it = this.it;
        let obj = {};
        for (let item of it) {
            // @ts-ignore
            let [key, value] = item;
            obj[key] = value;
        }
        return obj;
    }

    public Map() {
        let it = this.it;
        let map = new Map();
        for (let item of it) {
            // @ts-ignore
            let [key, value] = item;
            map.set(key, value);
        }
        return map;
    }

    public Go() {
        let it = this.it;
        // @ts-ignore
        while (!it.next().done) {
            // Do nothing with the value
        }
        // for (let item of it) {
        //     // Do nothing with the value
        // }
    }
}

function make_extract<T> (key: string | number | ((T) => any)): any {
    let extract;
    if (key === undefined) {
        extract = (x) => x;
    } else if (typeof(key) === "string" || typeof(key) === "number") {
        extract = x => x[key];
    } else {
        extract = key;
    }
    return extract;
}

console.log("a")
// $it.Iter = Iter;

// @ts-ignore
window.$it = $it;

export function foo() {
    let x = $it([{n: "a"}, {n: "a"}, {n: "b"}]).groupRuns((x) => x.n).List();

    console.log(x);

    // let x: never = $it([1,2,3]).skipAt([2,3]);
    // let x: never = $it(["a", "b", "c"]).pad(2, "a")


}

import m from "mithril";

export class PageFrontpage {
    public view(vnode: m.Vnode) {
        return m("div", "Vi skal snart på Klinteborg!",
                 m("h1", "Abc def ghi h1"),
                 m("h2", "Abc def ghi h2"),
                 m("h3", "Abc def ghi h3"),
                 m("h4", "Abc def ghi h4"),
                 m("h5", "Abc def ghi h5"),
                 m("h6", "Abc def ghi h6"),
                 m("div", "Abc def ghi p"),

                 m("h1", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h2", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h3", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h4", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h5", "Abc def ghi"),
                 m("div", "Abc def ghi"),
                 m("h6", "Abc def ghi"),
                );
    }
}

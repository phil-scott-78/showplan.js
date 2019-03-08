class TagAndParser<T> {
    public TagName: string;

    public Action: (element: Element) => T;

    public constructor(TagName: string, Action: (element: Element) => T) {
        this.TagName = TagName;
        this.Action = Action;
    }
}

export default TagAndParser;

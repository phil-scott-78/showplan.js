export class TagAndParser<T> {
  public TagName: string;
  public Action: (element: Element) => T;

  constructor(TagName: string, Action: (element: Element) => T) {
    this.TagName = TagName;
    this.Action = Action;
  }
}

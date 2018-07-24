export class Convert {
  public static GetFloat(element: Element, attribute: string): number | undefined {
    const input = element.getAttribute(attribute);
    if (input === null || input === '') { return undefined; }

    return parseFloat(input);
  }

  public static GetInt(element: Element, attribute: string): number | undefined {
    const input = element.getAttribute(attribute);
    if (input === null || input === '') { return undefined; }

    return parseInt(input, 10);
  }

  public static GetString(element: Element, attribute: string): string | undefined {
    const input = element.getAttribute(attribute);
    if (input === null || input === '') { return undefined; }

    return input;
  }

  public static GetBoolean(element: Element, attribute: string): boolean | undefined {
    const input = element.getAttribute(attribute);
    if (input === null || input === '') { return undefined; }

    return input !== 'false';
  }

  public static GetDate(element: Element, attribute: string): Date | undefined {
    const input = element.getAttribute(attribute);
    if (input === null || input === '') { return undefined; }

    return new Date(Date.parse(input));
  }
}

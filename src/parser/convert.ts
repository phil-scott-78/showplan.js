class Convert {
    public static GetFloat(element: Element, attribute: string): number {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { throw Error('Expected a float but received undefined'); }

        return parseFloat(input);
    }

    public static GetInt(element: Element, attribute: string): number {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { throw Error('Expected a int but received undefined'); }

        return parseInt(input, 10);
    }

    public static GetString(element: Element, attribute: string): string {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { throw Error('Expected a string but received undefined'); }

        return input;
    }

    public static GetBoolean(element: Element, attribute: string): boolean {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { throw Error('Expected a boolean but received undefined'); }

        return input !== 'false';
    }

    public static GetDate(element: Element, attribute: string): Date {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { throw Error('Expected a date but received undefined'); }

        return new Date(Date.parse(input));
    }

    public static GetFloatOrUndefined(element: Element, attribute: string): number | undefined {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { return undefined; }

        return parseFloat(input);
    }

    public static GetIntOrUndefined(element: Element, attribute: string): number | undefined {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { return undefined; }

        return parseInt(input, 10);
    }

    public static GetStringOrUndefined(element: Element, attribute: string): string | undefined {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { return undefined; }

        return input;
    }

    public static GetBooleanOrUndefined(element: Element, attribute: string): boolean | undefined {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { return undefined; }

        return input !== 'false';
    }

    public static GetDateOrUndefined(element: Element, attribute: string): Date | undefined {
        const input = element.getAttribute(attribute);
        if (input === null || input === '') { return undefined; }

        return new Date(Date.parse(input));
    }
}

export default Convert;

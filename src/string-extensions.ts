declare global {
    interface String {
        replaceAll(search: string, replace: string): string;
    }
}

function escapeRegExp(str: string): string {
    // eslint-disable-next-line no-useless-escape
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

// eslint-disable-next-line no-extend-native
String.prototype.replaceAll = function replaceAll(this: string, search: string, replace: string) {
    const s = this;
    return s.replace(new RegExp(escapeRegExp(search), 'g'), replace);
};

export {};

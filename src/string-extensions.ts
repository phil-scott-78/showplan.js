String.prototype.replaceAll = function (this: string, search: string, replace: string) {
    const s = this;
    return s.replace(new RegExp(escapeRegExp(search), 'g'), replace);
};

function escapeRegExp(str: string) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

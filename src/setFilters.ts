import Vue from 'vue';
import numbro from 'numbro';

function setFilters(): void {
    Vue.filter('filterBytes', (value: number) => numbro(value).format({
        output: 'byte',
        thousandSeparated: true,
        base: 'general',
        mantissa: 1,
    }));
    Vue.filter('filterKiloBytes', (value: number) => numbro(value * 1024).format({
        output: 'byte',
        thousandSeparated: true,
        base: 'general',
        mantissa: 1,
    }));
    Vue.filter('filterSigfig', (value: number) => {
        if (value > 100000) {
            return value.toExponential(2);
        }
        return numbro(value).format('0[.]0000');
    });
    Vue.filter('filterPercent', (value: number) => numbro(value).format({ output: 'percent', mantissa: 0 }));
    Vue.filter('filterInteger', (value: number) => numbro(value).format('0,0'));
    Vue.filter('stripBrackets', (value: string) => value.split('[').join('').split(']').join(''));
    Vue.filter('ordinal', (value: number) => numbro(value).format({ output: 'ordinal' }));
    Vue.filter('maxLength', (value: string, maxLength: number = 30) => {
        if (value.length < maxLength) {
            return value;
        }
        return `${value.substring(0, maxLength)}...`;
    });
}

export default setFilters;

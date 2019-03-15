import Vue, { VueConstructor } from 'vue';
import VueDragscroll from 'vue-dragscroll';
import numbro from 'numbro';

function SetVueFilters(vue: VueConstructor<Vue>): void {
    vue.filter('filterBytes', (value: number) => numbro(value).format({
        output: 'byte',
        thousandSeparated: true,
        base: 'general',
        mantissa: 1,
    }));
    vue.filter('filterKiloBytes', (value: number) => numbro(value * 1024).format({
        output: 'byte',
        thousandSeparated: true,
        base: 'general',
        mantissa: 1,
    }));
    vue.filter('filterSigfig', (value: number) => {
        if (value > 100000) {
            return value.toExponential(2);
        }
        return numbro(value).format('0[.]0000');
    });
    vue.filter('filterPercent', (value: number) => numbro(value).format({ output: 'percent', mantissa: 0 }));
    vue.filter('filterInteger', (value: number) => numbro(value).format('0,0'));
    vue.filter('stripBrackets', (value: string) => value.split('[').join('').split(']').join(''));
    vue.filter('ordinal', (value: number) => numbro(value).format({ output: 'ordinal' }));
    vue.filter('maxLength', (value: string, maxLength: number = 30) => {
        if (value.length < maxLength) {
            return value;
        }
        return `${value.substring(0, maxLength)}...`;
    });
}

function SetVueDirectives(vue: VueConstructor<Vue>): void {
    vue.use(VueDragscroll);
}

export { SetVueFilters, SetVueDirectives };

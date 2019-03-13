import { RelOp } from '@/parser/showplan';
import { Vue } from 'vue-property-decorator';
import {
    mount, createLocalVue, Wrapper, VueClass,
} from '@vue/test-utils';
import { SetVueDirectives, SetVueFilters } from '@/vueConfig';


function getOperationVueWrapper<T extends Vue>(vueOperation: VueClass<T>, relOp: RelOp): Wrapper<T> {
    const vue = createLocalVue();
    SetVueFilters(vue);
    SetVueDirectives(vue);

    const wrapper = mount(vueOperation,
        {
            localVue: vue,
            propsData: {
                operation: relOp,
            },
        });

    return wrapper;
}

export { getOperationVueWrapper }; // eslint-disable-line import/prefer-default-export

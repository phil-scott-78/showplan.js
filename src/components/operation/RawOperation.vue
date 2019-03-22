<template>
    <div class="content raw-data">
        <tree-view :data="shallowOperation" />
    </div>
</template>
<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import TreeView from 'vue-json-tree'; // eslint-disable-line

import * as ShowPlan from '@/parser/showplan';

@Component({
    components: {
        TreeView,
    },
})
export default class RawOperation extends Vue {
    @Prop() public operation!: ShowPlan.RelOp;

    public get shallowOperation(): ShowPlan.RelOp {
        // clone the operation but remove the child relop collection
        // for displaying in the 'raw' display
        const shallow: ShowPlan.RelOp = JSON.parse(JSON.stringify(this.operation, (key, value) => {
            if (key === 'RelOp' || key === 'ParentRelOp' || key === 'expandedComputedColumns') {
                return undefined;
            }

            return value;
        }));

        return shallow;
    }
}
</script>

<style lang="scss" scoped>
    .json-tree-root {
        background-color: inherit !important;
        padding:0 !important;
        margin: 0;
    }

    .json-tree-sign {
        display: none;
    }

    .json-tree {
        font-size: .75rem !important;
    }
</style>

<template>
    <div class="content">
        <div v-if="segment.GroupBy.length > 0">
            <h4>Group By</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in segment.GroupBy"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                        :expanded-columns="expandedColumns"
                    />
                </li>
            </ul>
        </div>
        <div v-if="segment.SegmentColumn !== undefined">
            <h4>Segment Column</h4>
            <ul class="small">
                <li>
                    <sql-string
                        :sql="segment.SegmentColumn.toString()"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, Segment, ExpandedComputedColumn } from 'showplan-js';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class SegmentView extends Vue {
    @Prop() public operation!: RelOp;

    private get segment(): Segment {
        return this.operation.Action as Segment;
    }

    private get expandedChildColumns(): ExpandedComputedColumn[] {
        return this.operation.GetChildExpandedComputedColumns();
    }
}
</script>

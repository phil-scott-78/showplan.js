<template>
    <div>
        <div class="content" v-if="stremAggregate.GroupBy !== undefined && stremAggregate.GroupBy.length > 0">
            <h4>Group By</h4>
            <ul class="small">
                <li v-for="(column, index) in stremAggregate.GroupBy" :key="index"><sql-string :sql="column.toString()" :expandedColumns="expandedChildColumns"></sql-string></li>
            </ul>
        </div>
        <defined-values v-if="stremAggregate.DefinedValues !== undefined && stremAggregate.DefinedValues.length > 0" :definedValues="stremAggregate.DefinedValues" :expandedColumns="expandedChildColumns"></defined-values>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, StreamAggregate, ExpandedComputedColumn } from '@/parser/showplan';

import DefinedValues from './DefinedValues.vue';
import SqlString from './SqlString.vue';

@Component({
    components: { DefinedValues, SqlString },
})
export default class StreamAggregateView extends Vue {
  @Prop() public operation!: RelOp;

  private get stremAggregate(): StreamAggregate {
      return this.operation.Action as StreamAggregate;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

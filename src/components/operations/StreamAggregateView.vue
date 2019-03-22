<template>
    <div>
        <div
            v-if="streamAggregate.GroupBy !== undefined && streamAggregate.GroupBy.length > 0"
            class="content"
        >
            <h4>Group By</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in streamAggregate.GroupBy"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="streamAggregate.RollupInfo !== undefined"
            class="content"
        >
            <h4>Rollup Info</h4>
            <div class="item">
                Highest Level <strong>{{ streamAggregate.RollupInfo.HighestLevel }}</strong>
            </div>
            <div class="item">
                <span>Rollup Levels</span>
                <ul class="comma-list">
                    <li
                        v-for="(level, key) in streamAggregate.RollupInfo.RollupLevel"
                        :key="key"
                    >
                        {{ level.Level }}
                    </li>
                </ul>
            </div>
        </div>
        <defined-values
            v-if="streamAggregate.DefinedValues !== undefined && streamAggregate.DefinedValues.length > 0"
            :defined-values="streamAggregate.DefinedValues"
            :expanded-columns="expandedChildColumns"
        />
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

  private get streamAggregate(): StreamAggregate {
      return this.operation.Action as StreamAggregate;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

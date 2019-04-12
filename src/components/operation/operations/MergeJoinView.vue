<template>
    <div>
        <div
            v-if="merge.Residual !== undefined"
            class="content"
        >
            <h4>Residual</h4>
            <div>
                <sql-string
                    :sql="merge.Residual.ScalarOperator.ScalarString"
                    :expanded-columns="expandedChildColumns"
                />
            </div>
        </div>

        <div
            v-if="merge.PassThru !== undefined"
            class="content"
        >
            <h4>PassThru</h4>
            <div>
                <sql-string
                    :sql="merge.PassThru.ScalarOperator.ScalarString"
                    :expanded-columns="expandedChildColumns"
                />
            </div>
        </div>

        <div
            v-if="merge.InnerSideJoinColumns !== undefined && merge.InnerSideJoinColumns.length > 0"
            class="content"
        >
            <h4>Inner Side Join Columns</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in merge.InnerSideJoinColumns"
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
            v-if="merge.OuterSideJoinColumns !== undefined && merge.OuterSideJoinColumns.length > 0"
            class="content"
        >
            <h4>Outer Side Join Columns</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in merge.OuterSideJoinColumns"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
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
import { RelOp, Merge, ExpandedComputedColumn } from 'showplan-js';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class NestedLoopView extends Vue {
  @Prop() public operation!: RelOp;

  private get merge(): Merge {
      return this.operation.Action as Merge;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

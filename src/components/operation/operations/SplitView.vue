<template>
    <div
        v-if="split.ActionColumn !== undefined"
        class="content"
    >
        <h4>Split</h4>
        <ul class="small">
            <li>
                <sql-string
                    :sql="split.ActionColumn.toString()"
                    :expanded-columns="expandedChildColumns"
                />
            </li>
        </ul>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, Split, ExpandedComputedColumn } from '@/parser/showplan';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class SplitView extends Vue {
  @Prop() public operation!: RelOp;

  private get split(): Split {
      return this.operation.Action as Split;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

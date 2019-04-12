<template>
    <div class="content">
        <h4>Group By</h4>
        <ul class="small">
            <li
                v-for="(column, index) in collapse.GroupBy"
                :key="index"
            >
                <sql-string
                    :sql="column.toString()"
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
import { RelOp, Collapse, ExpandedComputedColumn } from 'showplan-js';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class CollapseView extends Vue {
  @Prop() public operation!: RelOp;

  private get collapse(): Collapse {
      return this.operation.Action as Collapse;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

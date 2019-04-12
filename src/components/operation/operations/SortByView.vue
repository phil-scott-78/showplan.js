<template>
    <div class="content">
        <h4>
            Order By <span
                v-if="sort.Distinct"
                class="subheading"
            >Distinct</span>
        </h4>
        <ul class="small">
            <li
                v-for="(column, index) in sort.OrderBy.OrderByColumn"
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
import { RelOp, Sort, ExpandedComputedColumn } from 'showplan-js';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class SortByView extends Vue {
  @Prop() public operation!: RelOp;

  private get sort(): Sort {
      return this.operation.Action as Sort;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

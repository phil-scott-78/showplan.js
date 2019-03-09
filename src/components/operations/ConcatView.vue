<template>
  <div class="content">
    <h4>Concatenated Columns</h4>
    <ul class="small">
      <li v-for="(column, index) in concatColumns" :key="index"><sql-string :sql="column.toString()" :expandedColumns="expandedChildColumns"></sql-string></li>
    </ul>
  </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import {
    RelOp, Concat, ColumnReference, ExpandedComputedColumn,
} from '@/parser/showplan';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class ConcatVue extends Vue {
  @Prop() public operation!: RelOp;

  private get concat(): Concat {
      return this.operation.Action as Concat;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }

  private get concatColumns(): ColumnReference[] {
      if (this.concat.DefinedValues === undefined) {
          return [];
      }

      return this.concat.DefinedValues
          .filter(i => i.ColumnReference !== undefined)
          .map(i => i.ColumnReference as ColumnReference[])
          .reduce((prev, cur) => prev.concat(cur))
          .filter(i => !this.operation.OutputList.some(output => output.toString() === i.toString()));
  }
}
</script>

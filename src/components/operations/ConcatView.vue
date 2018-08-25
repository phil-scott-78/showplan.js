<template>
  <div class="content">
    <h4>Concatenated Columns</h4>
    <ul class="small">
      <li v-for="(column, index) in concatColumns" :key="index"><sql-string :sql="column.toString()" :expandedColumns="expandedChildColumns"></sql-string></li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, Concat, ColumnReference, ExpandedComputedColumn } from '@/parser/showplan';
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

    const out: ColumnReference[] = [];
    for (const definedValue of this.concat.DefinedValues) {
      if (definedValue.ColumnReference === undefined) {
        continue;
      }

      for (const columnReference of definedValue.ColumnReference!) {
        let foundInOutput = false;

        for (const output of this.operation.OutputList) {
          if (output.toString() === columnReference.toString()) {
            foundInOutput = true;
            break;
          }
        }

        if (!foundInOutput) {
          out.push(columnReference);
        }
      }
    }

    return out;
  }
}
</script>

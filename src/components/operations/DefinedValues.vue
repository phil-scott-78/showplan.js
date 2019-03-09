<template>
    <div class="content max-height">
        <h4>Scalar Operations</h4>
        <ul class="small">
            <li v-for="(op, index) in definedValues" :key="index"><sql-string :sql="getSqlString(op)" :expandedColumns="expandedColumns"></sql-string></li>
        </ul>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { DefinedValue, ExpandedComputedColumn } from '@/parser/showplan';

import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class DefinedValueView extends Vue {
  @Prop() public definedValues!: DefinedValue[];

  @Prop() public expandedColumns!: ExpandedComputedColumn[];

  private getSqlString(definedValue: DefinedValue): string {
      // if we have a column reference but no scalar operator just return the column
      if (definedValue.ColumnReference !== undefined && definedValue.ColumnReference.length === 1 && definedValue.ScalarOperator === undefined) {
          return definedValue.ColumnReference[0].toString();
      }

      // if we have multiple column references but no scalar operator just return a list of columns
      if (definedValue.ColumnReference !== undefined && definedValue.ColumnReference.length > 1 && definedValue.ScalarOperator === undefined) {
          let columns = '';
          definedValue.ColumnReference.forEach((columnReference) => {
              columns += `${columnReference.toString()}\r`;
          });
          return columns;
      }

      // if we have a column and a scalar then it's an assignment so include a
      // SET statement
      let sql = '';
      if (definedValue.ColumnReference !== undefined && definedValue.ColumnReference.length === 1) {
          sql = `SET ${definedValue.ColumnReference[0].toString()} = `;
      }

      if (definedValue.ScalarOperator !== undefined) {
          sql += definedValue.ScalarOperator.ScalarString;
      }

      return sql;
  }
}
</script>

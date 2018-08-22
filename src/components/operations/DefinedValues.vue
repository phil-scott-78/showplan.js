<template>
  <div class="content">
    <h4>Scalar Operations</h4>
    <ul class="small">
      <li v-for="(op, index) in definedValues" :key="index"><sql-string :sql="getSqlString(op)"></sql-string></li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { DefinedValue } from '@/parser/showplan';

import SqlString from './SqlString.vue';

@Component({
  components: { SqlString },
})
export default class DefinedValueView extends Vue {
  @Prop() public definedValues!: DefinedValue[];

  private getSqlString(definedValue: DefinedValue): string {
    // if we have a column reference but no scalar operator just return the column
    if (definedValue.ColumnReference !== undefined && definedValue.ColumnReference.length === 1 && definedValue.ScalarOperator === undefined) {
      return definedValue.ColumnReference[0].toString();
    }

    // if we have a column and a scalar then it's an assignment so include a
    // SET statement
    let sql = '';
    if (definedValue.ColumnReference !== undefined && definedValue.ColumnReference.length === 1) {
      sql = 'SET ' + definedValue.ColumnReference[0].toString() + ' = ';
    }

    sql += definedValue.ScalarOperator!.ScalarString;
    return sql;
  }

}
</script>

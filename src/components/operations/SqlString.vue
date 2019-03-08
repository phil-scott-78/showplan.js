<template>
  <span v-html="formatSql(sql)"></span>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop, Watch,
} from 'vue-property-decorator';
import { SqlFormatter } from '@/components/formatter';

import '@/string-extensions';
import { ExpandedComputedColumn } from '@/parser/showplan';

@Component({
})
export default class SqlString extends Vue {
  @Prop() public sql!: string;

  @Prop() public expandedColumns!: ExpandedComputedColumn[];

  private formatSql(input: string): string {
      let sql = input.replaceAll('[.]', '^^BRACKETDOTBRACKET^^'); // if someone was referencing their local db as [.] we want to leave that
      sql = sql.replaceAll('[', '');
      sql = sql.replaceAll(']', '');
      sql = sql.replaceAll('..', '[.].');
      sql = sql.replaceAll('^^BRACKETDOTBRACKET^^', '[.]');
      sql = sql.replaceAll(',', ',\u200B');
      sql = sql.replaceAll('.', '.\u200B');
      sql = sql.replaceAll(',', ', ');
      sql = sql.replaceAll('\n', ' '); // todo - make this an option to either replace with a space or a <br />
      // todo add whitespace around operators e.g. Id<5 becomes Id < 5
      const sqlFormatter = new SqlFormatter();
      let formatted = sqlFormatter.formatSql(sql);

      if (this.expandedColumns !== undefined) {
          for (const column of this.expandedColumns) {
              formatted = formatted.replaceAll(column.Column, `<abbr data-title=\"${column.Value}\">${column.Column}</abbr>`);
          }
      }


      return formatted;
  }
}
</script>

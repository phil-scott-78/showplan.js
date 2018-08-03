<template>
  <span v-html="formatSql(sql)"></span>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { SqlFormatter } from '@/components/formatter';

@Component({
})
export default class SqlString extends Vue {
  @Prop() public sql!: string;

  private formatSql(input: string): string {
    let sql = input.replaceAll('[.]', '^^BRACKETDOTBRACKET^^'); // if someone was referencing their local db as [.] we want to leave that
    sql = sql.replaceAll('[', '');
    sql = sql.replaceAll(']', '');
    sql = sql.replaceAll('..', '[.].');
    sql = sql.replaceAll('^^BRACKETDOTBRACKET^^', '[.]');
    sql = sql.replaceAll(',', ',\u200B');
    sql = sql.replaceAll('.', '.\u200B');
    sql = sql.replaceAll(',', ', ');
    sql = sql.replaceAll('\n', ' ' ); // todo - make this an option to either replace with a space or a <br />
    // todo add whitespace around operators e.g. Id<5 becomes Id < 5

    return new SqlFormatter().formatSql(sql);
  }
}
</script>

<template>
  <div class="content">
    <pre><code v-html="formattedCode()"></code></pre>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { SqlFormatter } from './formatter';
import { BaseStmtInfo, StmtSimple } from '@/parser/showplan';

@Component({
})
export default class HighlightSqlStatement extends Vue {
  @Prop() public statement!: BaseStmtInfo;

  public formattedCode(): string {
    if (this.fullStatementText !== undefined) {
      return new SqlFormatter().formatSql(this.fullStatementText);
    }

    return '';
  }

  public get fullStatementText(): string | undefined {
    if (this.statement.StatementText === undefined) {
      return undefined;
    }

    return this.statement.StatementText!.trim();
  }
}
</script>

<style lang="scss" scoped>
  pre {
    max-height:8rem;
    overflow-y: auto;
    white-space: pre-wrap;
    margin: 0;

    code {
      font-size:.8rem;
    }
  }
</style>

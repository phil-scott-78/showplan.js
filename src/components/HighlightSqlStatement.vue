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
    let variableDeclarations = '';

    if (this.statement.StatementText === undefined) {
      return undefined;
    }

    if (this.statement instanceof StmtSimple) {
      const statement = this.statement as StmtSimple;
      if (statement.QueryPlan === undefined) {
        return this.statement.StatementText;
      }

      if (statement.QueryPlan!.ParameterList !== undefined && statement.QueryPlan!.ParameterList!.length > 0) {
        for (const param of statement.QueryPlan!.ParameterList!) {
          if (param.ParameterRuntimeValue !== undefined) {
            if (param.ParameterDataType !== undefined) {
              variableDeclarations += `DECLARE ${param.Column} ${param.ParameterDataType}\n`;
            }
            variableDeclarations += `SET ${param.Column} = ${param.ParameterRuntimeValue}\n`;
          }
        }
      }

      if (variableDeclarations === '') {
        return this.statement.StatementText!.trim();
      }

      return ('// runtime parameter declarations \n' + variableDeclarations + '\n' + this.statement.StatementText).trim();
    }

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

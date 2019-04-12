<template>
    <div class="content">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <pre><code v-html="formattedCode()" /></pre>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import SqlFormatter from '@/components/formatter';
import { BaseStmtInfo } from 'showplan-js';

@Component({
})
export default class HighlightSqlStatement extends Vue {
  @Prop() public statement!: BaseStmtInfo;

  public formattedCode(): string {
      if (this.fullStatementText !== undefined) {
          return SqlFormatter.formatSql(this.fullStatementText);
      }

      return '';
  }

  public get fullStatementText(): string | undefined {
      if (this.statement.StatementText === undefined) {
          return undefined;
      }

      return this.statement.StatementText.trim();
  }
}
</script>

<style lang="scss" scoped>
  pre {
    max-height:8.2rem;
    overflow-y: auto;
    white-space: pre-wrap;
    margin: 0;

    code {
      font-size:.8rem;
    }
  }
</style>

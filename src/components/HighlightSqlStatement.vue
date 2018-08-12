<template>
    <pre><code v-html="formattedCode()"></code></pre>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { SqlFormatter } from './formatter';

@Component({
})
export default class HighlightSqlStatement extends Vue {
  @Prop() public statementText!: string;

  public formattedCode(): string {
    return new SqlFormatter().formatSql(this.statementText);
  }
}
</script>

<style lang="scss" scoped>
  pre {
    border: 1px solid var(--alt-border);
    border-radius:.3rem;
    background: var(--alt-background);;
    padding:.5rem;
    max-height:8rem;
    overflow-y: auto;
    white-space: pre-wrap;
    font-size:.8rem;
  }
</style>

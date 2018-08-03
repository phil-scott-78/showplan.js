<template>
  <div class="content">
    <h4>Filter Predicate</h4>
    <span v-html="formatSql(filter.Predicate.ScalarOperator.ScalarString)"></span>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, Filter } from '@/parser/showplan';
import { SqlFormatter } from '@/components/formatter';

@Component({})
export default class FilterView extends Vue {
  @Prop() public operation!: RelOp;

  private get filter(): Filter {
    return this.operation.Action as Filter;
  }

  private formatSql(input: string): string {
    return new SqlFormatter().formatSql(input);
  }
}
</script>

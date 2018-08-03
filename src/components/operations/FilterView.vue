<template>
  <div class="content">
    <h4>Filter Predicate</h4>
    <sql-string :sql="filter.Predicate.ScalarOperator.ScalarString"></sql-string>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, Filter } from '@/parser/showplan';
import SqlString from './SqlString.vue';

@Component({
  components: { SqlString },
})
export default class FilterView extends Vue {
  @Prop() public operation!: RelOp;

  private get filter(): Filter {
    return this.operation.Action as Filter;
  }
}
</script>

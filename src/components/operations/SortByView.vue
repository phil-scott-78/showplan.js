<template>
  <div class="content">
    <h4>Order By <span v-if="sort.Distinct" class="subheading">Distinct</span></h4>
    <ul class="small">
      <li v-for="(column, index) in sort.OrderBy.OrderByColumn" v-bind:key="index">
        <sql-string :sql="column.toString()"></sql-string>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, Sort } from '@/parser/showplan';
import SqlString from './SqlString.vue';

@Component({
  components: { SqlString },
})
export default class SortByView extends Vue {
  @Prop() public operation!: RelOp;

  private get sort(): Sort {
    return this.operation.Action as Sort;
  }
}
</script>

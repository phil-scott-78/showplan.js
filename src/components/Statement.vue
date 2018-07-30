<template>
<div>
  <h1>
    <span class="statementType">{{ statement.StatementType }}</span>
    <span v-if="statement.QueryPlan != null" class='stats'>
      <span v-if="statement.StatementSubTreeCost != null">Sub Tree Cost: <strong>{{ statement.StatementSubTreeCost }}</strong></span>
      <span v-if="statement.StatementEstRows != null">Estimated Number of Rows : <strong>{{ statement.StatementEstRows }}</strong></span>
      <span>Degree of Parallelism:
          <strong v-if="statement.QueryPlan.DegreeOfParallelism != null">{{ statement.statement.QueryPlan.DegreeOfParallelism }}</strong>
          <strong v-else>1</strong>
      </span>
      <span v-if="statement.QueryPlan.CachedPlanSize != null">Cached Plan Size: <strong>{{ statement.QueryPlan.CachedPlanSize | filterKilobytes }}</strong></span>
    </span>
  </h1>

  <div v-if="statement.StatementText != null">
    <h3>Statement Text</h3>
    <highlight-sql-statement v-bind:statementText="statement.StatementText"></highlight-sql-statement>
  </div>

  <div v-if="statement.QueryPlan != null">
    <show-plan-sunburst v-bind:queryPlan="statement.QueryPlan" v-on:rel-op-selected="relOpSelected"></show-plan-sunburst>

    <div v-if="selectedOp != null">
      <h4>{{ selectedOp.LogicalOp }}</h4>
    </div>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BaseStmtInfo, RelOp } from '@/parser/showplan';
import * as numeral from 'numeral';

import ShowPlanSunburst from './ShowPlanSunburst.vue';
import HighlightSqlStatement from './HighlightSqlStatement.vue';

@Component({
  filters: {
    filterKilobytes(value: number) {
      return numeral(value * 1024).format('0.0 ib').replace('KiB', 'KB');
    },
  },
  components: {
    ShowPlanSunburst, HighlightSqlStatement,
  },
})
export default class Statement extends Vue {
  @Prop() public statement!: BaseStmtInfo;
  private selectedOp: RelOp | null = null;

  private relOpSelected(op: RelOp) {
    this.selectedOp = op;
  }
}

</script>

<style lang="scss" scoped>
  h1 {
    .stats {
      font-weight: normal;
      font-size: .8rem;
      color: #555;

      span {
        margin-left: .5rem;
        border-right: 1px solid #ccc;
        padding-right: .5rem;
      }

      span:last-child {
        border-right: none
      }
    }
  }
</style>

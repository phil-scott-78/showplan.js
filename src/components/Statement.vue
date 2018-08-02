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
      <span v-if="statement.QueryPlan.CachedPlanSize != null">Cached Plan Size: <strong>{{ statement.QueryPlan.CachedPlanSize | filterKiloBytes }}</strong></span>
    </span>
  </h1>

  <div v-if="statement.StatementText != null">
    <h3>Statement Text</h3>
    <highlight-sql-statement v-bind:statementText="statement.StatementText"></highlight-sql-statement>
  </div>

  <div v-if="statement.QueryPlan != null" class="row">
    <div class="col-xs-8">
      <div class="box">
        <show-plan-sunburst width="600" v-bind:queryPlan="statement.QueryPlan" v-on:rel-op-selected="relOpSelected" v-on:rel-op-highlighted="relOpHighlighted"></show-plan-sunburst>
      </div>
    </div>
    <div class="col-xs">
      <div class="box">
        <div v-if="displayedOp != null" class="opSummary">
          <operation-summary v-bind:statement="statement" v-bind:operation="displayedOp"></operation-summary>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BaseStmtInfo, RelOp } from '@/parser/showplan';

import ShowPlanSunburst from './ShowPlanSunburst.vue';
import HighlightSqlStatement from './HighlightSqlStatement.vue';
import OperationSummary from './OperationSummary.vue';

@Component({
  components: {
    ShowPlanSunburst, HighlightSqlStatement, OperationSummary,
  },
})
export default class Statement extends Vue {
  @Prop() public statement!: BaseStmtInfo;

  private selectedOp: RelOp | null = null;
  private highlightedOp: RelOp | null = null;

  private get displayedOp(): RelOp | null {
    if (this.highlightedOp != null) {
      return this.highlightedOp;
    }

    return this.selectedOp;
  }

  private relOpSelected(op: RelOp) {
    this.selectedOp = op;
  }

  private relOpHighlighted(op: RelOp) {
    this.highlightedOp = op;
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

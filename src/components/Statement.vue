<template>
<div>
  <h1>
    <span class="statementType">{{ statement.StatementType }}</span> <select-plan :show-plan="showPlan" @showplan-statement-changed="selectChanged"></select-plan>
    <span v-if="statement.QueryPlan !== undefined" class='stats'>
      <span v-if="statement.StatementSubTreeCost !== undefined">Sub Tree Cost: <strong>{{ statement.StatementSubTreeCost }}</strong></span>
      <span v-if="statement.StatementEstRows !== undefined">Estimated Number of Rows : <strong>{{ statement.StatementEstRows }}</strong></span>
      <span>Degree of Parallelism:
          <strong v-if="statement.QueryPlan.DegreeOfParallelism !== undefined">{{ statement.statement.QueryPlan.DegreeOfParallelism }}</strong>
          <strong v-else>1</strong>
      </span>
      <span v-if="statement.QueryPlan.CachedPlanSize !== undefined">Cached Plan Size: <strong>{{ statement.QueryPlan.CachedPlanSize | filterKiloBytes }}</strong></span>
    </span>
  </h1>

  <div class="card" style="margin-bottom:2rem">
    <component v-bind:is="selectedOverviewTab" :statement="statement"></component>

    <div class="footer">
      <div class="buttons">
        <a @click="selectedOverviewTab='highlight-sql-statement'" :class="{ 'selected': selectedOverviewTab === 'highlight-sql-statement' }">Query Text</a>
        <a @click="selectedOverviewTab='statement-overview'" :class="{ 'selected': selectedOverviewTab === 'statement-overview' }">Query Properties</a>
        <a v-if="statement.QueryPlan != undefined && statement.QueryPlan.OptimizerStatsUsage !== undefined" @click="selectedOverviewTab='statistics-list'" :class="{ 'selected': selectedOverviewTab === 'statistics-list' }">Statistics Usage</a>
        <a v-if="statement.QueryPlan != undefined && statement.QueryPlan.MissingIndexes !== undefined" @click="selectedOverviewTab='missing-indexes'" :class="{ 'selected': selectedOverviewTab === 'missing-indexes' }">Missing Indexes</a>
      </div>
    </div>
  </div>

  <div v-if="statement.QueryPlan !== undefined" class="queryplan">
    <div class="visualization">
      <show-plan-sunburst width="600" v-bind:queryPlan="statement.QueryPlan" :selectedNode="displayedOp" v-on:rel-op-selected="relOpSelected" v-on:rel-op-highlighted="relOpHighlighted"></show-plan-sunburst>
    </div>
    <div class="details">
      <div v-if="displayedOp !== undefined" class="opSummary">
        <operation-summary v-bind:statement="statement" v-bind:operation="displayedOp"></operation-summary>
      </div>
    </div>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import { BaseStmtInfo, RelOp, StmtSimple, ShowPlanXML } from '@/parser/showplan';

import ShowPlanSunburst from './ShowPlanSunburst.vue';
import HighlightSqlStatement from './HighlightSqlStatement.vue';
import OperationSummary from './OperationSummary.vue';
import SelectPlan from './SelectPlan.vue';
import StatementOverview from './StatementOverview.vue';
import MissingIndexes from './MissingIndexes.vue';
import StatisticsList from './StatisticsList.vue';

@Component({
  components: {
    ShowPlanSunburst, HighlightSqlStatement, OperationSummary, SelectPlan, MissingIndexes, StatementOverview, StatisticsList,
  },
  data() {
    return {
      selectedOp: undefined,
      highlightedOp: undefined,
    };
  },
})
export default class Statement extends Vue {
  @Prop() public statement!: BaseStmtInfo;
  @Prop() public showPlan!: ShowPlanXML;

  private selectedOp: RelOp | undefined;
  private highlightedOp: RelOp | undefined;
  private selectedOverviewTab: string = 'highlight-sql-statement';

  @Emit('showplan-statement-changed')
  public statementSelected(statementGuid: string) {
    //
  }

  public selectChanged(statementGuid: string) {
    this.statementSelected(statementGuid);
  }


  @Watch('statement')
  private OnStatementChanged(val: BaseStmtInfo, oldVal: BaseStmtInfo) {
    this.selectedOp = undefined;
  }

  private get displayedOp(): RelOp | undefined {
    if (this.highlightedOp !== undefined) {
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
  .queryplan {
    display: flex;

    .visualization {
      flex: 2;
      max-width:66%;
    }

    .details {
      flex: 1;
      max-width:33%;
    }
  }



  h1 {
    .stats {
      font-weight: normal;
      font-size: .8rem;

      span {
        margin-left: .5rem;
        border-right: 1px solid var(--grey);
        padding-right: .5rem;
      }

      span:last-child {
        border-right: none
      }
    }
  }
</style>

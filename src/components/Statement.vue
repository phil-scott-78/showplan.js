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
            <smooth-reflow>
                <component :is="selectedOverviewTab" :statement="statement"></component>
            </smooth-reflow>
            <div class="footer">
                <div class="buttons">
                    <a @click="selectedOverviewTab='highlight-sql-statement'" :class="{ 'selected': selectedOverviewTab === 'highlight-sql-statement' }">Query Text</a>
                    <a @click="selectedOverviewTab='statement-overview'" :class="{ 'selected': selectedOverviewTab === 'statement-overview' }">Query Properties</a>
                    <span v-if="statement.QueryPlan != undefined">
                        <a v-if="statement.QueryPlan.ParameterList !== undefined && statement.QueryPlan.ParameterList.length > 0" @click="selectedOverviewTab='query-parameters'" :class="{ 'selected': selectedOverviewTab === 'query-parameters' }">
                            Query Parameters
                        </a>
                        <a v-if="statement.QueryPlan.OptimizerStatsUsage !== undefined" @click="selectedOverviewTab='statistics-list'" :class="{ 'selected': selectedOverviewTab === 'statistics-list' }">
                            Statistics Usage
                        </a>
                        <a v-if="statement.QueryPlan.MissingIndexes !== undefined" @click="selectedOverviewTab='missing-indexes'" :class="{ 'selected': selectedOverviewTab === 'missing-indexes' }">
                            <font-awesome-icon style="color:var(--orange)" icon="exclamation-circle" />
                            Missing Indexes
                        </a>
                    </span>
                </div>
            </div>
        </div>

        <div v-if="statement.QueryPlan !== undefined" class="queryplan">
            <div class="visualization card">
                <component :is="selectVisualizationTab" width="600" :statement="statement" :selectedNode="displayedOp" @rel-op-selected="relOpSelected" @rel-op-highlighted="relOpHighlighted"></component>
                <div class="footer">
                    <div class="buttons">
                        <a @click="selectVisualizationTab='operator-flow'" :class="{ 'selected': selectVisualizationTab === 'operator-flow' }">Operator Flow</a>
                        <a @click="selectVisualizationTab='data-flow'" :class="{ 'selected': selectVisualizationTab === 'data-flow' }">Data Flow</a>
                        <a @click="selectVisualizationTab='cost-analysis'" :class="{ 'selected': selectVisualizationTab === 'cost-analysis' }">Cost Analysis</a>
                    </div>
                </div>
            </div>
            <div class="details">
                <div v-if="displayedOp !== undefined" class="opSummary">
                    <operation-summary :statement="statement" :operation="displayedOp"></operation-summary>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop, Watch, Emit,
} from 'vue-property-decorator';
import {
    BaseStmtInfo, RelOp, StmtSimple, ShowPlanXML,
} from '@/parser/showplan';

import SmoothReflow from './SmoothReflow.vue';
import CostAnalysis from './visualizations/CostAnalysis.vue';
import OperatorFlow from './visualizations/OperatorFlow.vue';
import DataFlow from './visualizations/DataFlow.vue';
import HighlightSqlStatement from './HighlightSqlStatement.vue';
import OperationSummary from './OperationSummary.vue';
import SelectPlan from './SelectPlan.vue';
import StatementOverview from './StatementOverview.vue';
import MissingIndexes from './MissingIndexes.vue';
import StatisticsList from './StatisticsList.vue';
import QueryParameters from './QueryParameters.vue';

@Component({
    components: {
        SmoothReflow, CostAnalysis, OperatorFlow, DataFlow, HighlightSqlStatement, OperationSummary, SelectPlan, MissingIndexes, StatementOverview, StatisticsList, QueryParameters,
    },
    data() {
        return {
            selectedOpId: undefined,
            highlightedOpId: undefined,
        };
    },
})
export default class Statement extends Vue {
  @Prop() public statement!: BaseStmtInfo;

  @Prop() public showPlan!: ShowPlanXML;

  private operationMap: Map<number, RelOp> = new Map<number, RelOp>();

  private selectedOpId: number | undefined;

  private highlightedOpId: number | undefined;

  private selectedOverviewTab: string = 'highlight-sql-statement';

  private selectVisualizationTab: string = 'operator-flow';

  @Emit('showplan-statement-changed')
  public selectChanged(statementGuid: string) {
      return statementGuid;
  }

  public mounted() {
      this.buidlMap(this.statement);
  }

  @Watch('statement')
  private OnStatementChanged(val: BaseStmtInfo) {
      this.buidlMap(val);
  }

  private buidlMap(val: BaseStmtInfo) {
      this.selectedOpId = undefined;
      this.operationMap = new Map<number, RelOp>();

      const statement = val as StmtSimple;
      if (statement.QueryPlan === undefined) {
          return;
      }

      const addChildren = (map: Map<number, RelOp>, op: RelOp) => {
          map.set(op.NodeId, op);
          op.Action.RelOp.forEach((childOp) => {
              addChildren(map, childOp);
          });
      };

      addChildren(this.operationMap, statement.QueryPlan.RelOp);
  }

  private get displayedOp(): RelOp | undefined {
      if (this.highlightedOpId !== undefined) {
          return this.operationMap.get(this.highlightedOpId);
      }

      if (this.selectedOpId === undefined) {
          return undefined;
      }

      return this.operationMap.get(this.selectedOpId);
  }

  private relOpSelected(op: number) {
      this.selectedOpId = op;
  }

  private relOpHighlighted(op: number) {
      this.highlightedOpId = op;
  }
}
</script>

<style lang="scss" scoped>
  .queryplan {
    display: flex;

    .visualization {
      flex: 2;
      max-width:66%;
      margin-right:1rem;
      height:100%;
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

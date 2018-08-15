<template>
<div>
  <h1>
    <span class="statementType">{{ statement.StatementType }}</span> <select-plan :show-plan="showPlan" @showplan-statement-changed="selectChanged"></select-plan>
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
    <highlight-sql-statement v-bind:statementText="statement.StatementText.trim()"></highlight-sql-statement>
  </div>

  <div v-if="statement.QueryPlan.MissingIndexes != null">
    <div class="message warning">
      <h4>Missing Indexes</h4>
      <ul v-for="(indexGroup, indexGroupIndex) in statement.QueryPlan.MissingIndexes.MissingIndexGroup" :key="indexGroupIndex">
        <li v-for="(index, indexIndex) in indexGroup.MissingIndex" :key="indexIndex">Impact: {{ indexGroup.Impact  | filterSigfig }}: <sql-string :sql="index.toCreateIndexString()"></sql-string></li>
      </ul>
    </div>
  </div>

  <div v-if="statement.QueryPlan != null" class="queryplan">
    <div class="visualization">
      <show-plan-sunburst width="600" v-bind:queryPlan="statement.QueryPlan" :selectedNode="displayedOp" v-on:rel-op-selected="relOpSelected" v-on:rel-op-highlighted="relOpHighlighted"></show-plan-sunburst>
    </div>
    <div class="details">
      <div v-if="displayedOp != null" class="opSummary">
        <operation-summary v-bind:statement="statement" v-bind:operation="displayedOp"></operation-summary>
      </div>
    </div>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import { BaseStmtInfo, RelOp, ShowPlanXML } from '@/parser/showplan';

import ShowPlanSunburst from './ShowPlanSunburst.vue';
import HighlightSqlStatement from './HighlightSqlStatement.vue';
import OperationSummary from './OperationSummary.vue';
import SelectPlan from './SelectPlan.vue';

@Component({
  components: {
    ShowPlanSunburst, HighlightSqlStatement, OperationSummary, SelectPlan,
  },
})
export default class Statement extends Vue {
  @Prop() public statement!: BaseStmtInfo;
  @Prop() public showPlan!: ShowPlanXML;

  private selectedOp: RelOp | null = null;
  private highlightedOp: RelOp | null = null;

  @Emit('showplan-statement-changed')
  public statementSelected(statementGuid: string) {
    //
  }

  public selectChanged(statementGuid: string) {
    this.statementSelected(statementGuid);
  }

  @Watch('statement')
  private OnStatementChanged(val: BaseStmtInfo, oldVal: BaseStmtInfo) {
    this.selectedOp = null;
  }

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

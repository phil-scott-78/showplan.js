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

  <div v-if="fullStatementText !== undefined">
    <highlight-sql-statement :statementText="fullStatementText"></highlight-sql-statement>
  </div>

  <div v-if="statement.QueryPlan.MissingIndexes !== undefined">
    <div class="message warning">
      <h4>Missing Indexes</h4>
      <ul v-for="(indexGroup, indexGroupIndex) in statement.QueryPlan.MissingIndexes.MissingIndexGroup" :key="indexGroupIndex">
        <li v-for="(index, indexIndex) in indexGroup.MissingIndex" :key="indexIndex">Impact: {{ indexGroup.Impact  | filterSigfig }}: <sql-string :sql="index.toCreateIndexString()"></sql-string></li>
      </ul>
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

@Component({
  components: {
    ShowPlanSunburst, HighlightSqlStatement, OperationSummary, SelectPlan,
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

  @Emit('showplan-statement-changed')
  public statementSelected(statementGuid: string) {
    //
  }

  public selectChanged(statementGuid: string) {
    this.statementSelected(statementGuid);
  }

  public get fullStatementText(): string | undefined {
    let variableDeclarations = '';

    if (this.statement.StatementText === undefined) {
      return undefined;
    }

    if (this.statement instanceof StmtSimple) {
      const statement = this.statement as StmtSimple;
      if (statement.QueryPlan === undefined) {
        return this.statement.StatementText;
      }

      if (statement.QueryPlan!.ParameterList !== undefined && statement.QueryPlan!.ParameterList!.length > 0) {
        for (const param of statement.QueryPlan!.ParameterList!) {
          if (param.ParameterRuntimeValue !== undefined) {
            if (param.ParameterDataType !== undefined) {
              variableDeclarations += `DECLARE ${param.Column} ${param.ParameterDataType}\n`;
            }
            variableDeclarations += `SET ${param.Column} = ${param.ParameterRuntimeValue}\n`;
          }
        }
      }

      if (variableDeclarations === '') {
        return this.statement.StatementText!.trim();
      }

      return ('// runtime parameter declarations \n' + variableDeclarations + '\n' + this.statement.StatementText).trim();
    }

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

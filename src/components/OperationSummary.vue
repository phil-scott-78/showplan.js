<template>
  <div class="opSummary card">
    <div class="content header">
      <div class="progress-circle" v-bind:class="progressPercent" style="float:right">
        <div class="progress-number">{{ operation.EstimateTotalCost / statement.StatementSubTreeCost | filterPercent }}</div>
      </div>
      <h3>{{ headingText }}</h3>
      <div class="meta" v-if="getSubHeadingText != null" v-bind:title="getSubHeadingText | stripBrackets">{{ getSubHeadingText | stripBrackets }}</div>
    </div>
    <sort-by v-if="instanceOf(operation.Action, ShowPlan.Sort)" v-bind:operation="operation"></sort-by>
    <index-scan v-if="instanceOf(operation.Action, ShowPlan.IndexScan)" v-bind:operation="operation"></index-scan>
    <div class="content">
      <ul class="stats">
        <li>Cost: <strong>{{ operation.EstimateTotalCost | filterSigfig}}</strong> (CPU: {{ operation.EstimateCPU | filterSigfig }}, IO: {{ operation.EstimateIO | filterSigfig }})</li>

        <li>Subtree: <strong>{{ operation.EstimatedTotalSubtreeCost | filterSigfig }}</strong></li>
      </ul>
    </div>
    <div class="content">
      <ul class="stats">
        <li>Est. Rows: <strong>{{ operation.EstimateRows | filterInteger }}</strong></li>
        <li>Row Size: <strong>{{ operation.AvgRowSize | filterBytes }}</strong></li>
      </ul>
    </div>
    <div class="content">
      <ul class="stats">
        <li>Est. Rebinds: <strong>{{ operation.EstimateRebinds | filterInteger }}</strong></li>
        <li>Est. Rewinds: <strong>{{ operation.EstimateRewinds | filterInteger }}</strong></li>
      </ul>
    </div>
    <div class="content">
      <h4>Output</h4>
      <ul class="small">
        <li v-for="(column, index) in operation.OutputList" v-bind:key="index">{{ column.Column }} </li>
      </ul>
    </div>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BaseStmtInfo, RelOp, ObjectType } from '@/parser/showplan';
import * as ShowPlan from '@/parser/showplan';

import SortBy from './operations/SortBy.vue';
import IndexScan from './operations/IndexScan.vue';

@Component({
  components: {
    SortBy, IndexScan,
  },
})
export default class OperationSummary extends Vue {
  @Prop() public statement!: BaseStmtInfo;
  @Prop() public operation!: RelOp;

  public get headingText(): string {
    switch (this.operation.PhysicalOp) {
      case 'Index Scan':
      case 'Index Seek':
        return this.operation.PhysicalOp + ' (NonClustered)';
      default:
        return this.operation.PhysicalOp;
    }
  }

  public get progressPercent(): string {
    if (this.statement == null || this.statement!.StatementSubTreeCost == null) {
     return 'progress-0';
    }

    let percent = (this.operation.EstimateTotalCost / this.statement!.StatementSubTreeCost!) * 100;
    if (percent < 10) {
      percent = Math.round(percent);
    } else {
      percent = Math.round(percent / 5) * 5;
    }

    return 'progress-' + percent;
  }

  public get getSubHeadingText(): string {
    switch (this.operation.PhysicalOp) {
      case 'Index Scan':
      case 'Index Seek':
      case 'Clustered Index Scan':
      case 'Clustered Index Seek':
        return this.getShortName((this.operation.Action as ShowPlan.IndexScan).Object[0]);
      default:
        break;
    }

    return this.operation.LogicalOp;
  }


  private getShortName(o: ObjectType) {
    const table = o.Table + '.' + o.Index;
    if (o.Alias == null) {
      return table;
    }

    return table + ' ' + o.Alias;
  }

  // forcing things to be exposed to hack in instanceof
  // probably a better way...
  private get ShowPlan(): any {
    return ShowPlan;
  }
  private instanceOf(o: any, type: any) {
    return o instanceof type;
  }
}

</script>

<style lang="scss" scoped>
  .opSummary {
    h3, h4 {
      margin:0;
    }


  }
</style>

<template>
  <div class="opSummary card">
    <div class="content header">
      <div class="progress-circle" v-bind:class="progressPercent" style="float:right">
        <div class="progress-number">{{ operation.EstimateTotalCost / statement.StatementSubTreeCost | filterPercent }}</div>
      </div>
      <h3>{{ headingText }}</h3>
      <div class="meta" v-if="getSubHeadingText != null" v-bind:title="getSubHeadingText | stripBrackets">{{ getSubHeadingText | stripBrackets }}</div>
    </div>
    <div v-if="selectedTab === 'overview'">

      <sort-by v-if="instanceOf(operation.Action, ShowPlan.Sort)" v-bind:operation="operation"></sort-by>
      <index-scan v-if="instanceOf(operation.Action, ShowPlan.IndexScan)" v-bind:operation="operation"></index-scan>
      <filter-op v-if="instanceOf(operation.Action, ShowPlan.Filter)" v-bind:operation="operation"></filter-op>
      <compute-scalar-op v-if="instanceOf(operation.Action, ShowPlan.ComputeScalar)" v-bind:operation="operation"></compute-scalar-op>

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
      <div class="content max-height">
        <h4>Output</h4>

        <div class="small" v-for="(key, index) in groupedOutput" v-bind:key="index">
          <span v-if="key.key !== ''">{{ key.key | stripBrackets }}</span><span v-else>Computed</span>
          <ul class="comma-list">
            <li v-for="(member, memberIndex) in key.members" v-bind:key="memberIndex">{{ member.Column }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else-if="selectedTab === 'advanced'">
      <div class="content">
        advanced
        </div>
    </div>
    <div v-else>
      <div class="content raw-data">
        <tree-view :data="shallowOperation"></tree-view>
      </div>
    </div>
    <div class="footer">
      <div class="buttons">
        <a href="#" v-on:click="selectedTab='overview'" v-bind:class="{ 'selected': selectedTab === 'overview' }">Overview</a><a href="#" v-on:click="selectedTab='advanced'" v-bind:class="{ 'selected': selectedTab === 'advanced' }">Advanced</a><a href="#" v-on:click="selectedTab = 'raw'" v-bind:class="{ 'selected': selectedTab === 'raw' }">Raw</a>
      </div>
    </div>
  </div>

</template>

<script lang='ts'>
import { Vue, Component, Prop} from 'vue-property-decorator';
import { BaseStmtInfo, RelOp, ObjectType } from '@/parser/showplan';
import * as ShowPlan from '@/parser/showplan';

import SortBy from './operations/SortByView.vue';
import IndexScan from './operations/IndexScanView.vue';
import FilterOp from './operations/FilterView.vue';
import ComputeScalarOp from './operations/ComputeScalarView.vue';


import { Group } from '@/parser/grouping';
import { ColumnReferenceParser } from '@/parser/column-reference-parser';
import TreeView from 'vue-json-tree';

@Component({
  components: {
    SortBy, IndexScan, FilterOp, ComputeScalarOp, TreeView,
  },
})
export default class OperationSummary extends Vue {
  @Prop() public statement!: BaseStmtInfo;
  @Prop() public operation!: RelOp;

  public selectedTab: string = 'overview';

  public get groupedOutput(): Array<Group<ShowPlan.ColumnReference>> {
    return ColumnReferenceParser.Group(this.operation.OutputList);
  }

  public get headingText(): string {
    switch (this.operation.PhysicalOp) {
      case 'Index Scan':
      case 'Index Seek':
        return this.operation.PhysicalOp + ' (NonClustered)';
      default:
        return this.operation.PhysicalOp;
    }
  }

  public get shallowOperation(): RelOp {
    const shallow = (JSON.parse(JSON.stringify(this.operation)));
    shallow.Action.RelOp = [];
    return shallow;
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

</style>

<style>
  .json-tree-root {
    background-color: inherit !important;
    padding:0 !important;
  }

  .json-tree {
    font-size: .75rem !important;
  }
</style>

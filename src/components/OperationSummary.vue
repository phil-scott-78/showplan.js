<template>
  <div class="opSummary card">
    <div class="content header">
      <div class="progress-circle" :class="progressPercent" style="float:right">
        <div class="progress-number">{{ operation.EstimateTotalCost / statement.StatementSubTreeCost | filterPercent }}</div>
      </div>
      <h3>{{ headingText }}</h3>
      <div class="meta" v-if="getSubHeadingText !== undefined" :title="getSubHeadingText | stripBrackets">{{ getSubHeadingText | stripBrackets }}</div>
    </div>
    <div v-if="selectedTab === 'overview'">
      <warnings v-if="operation.Warnings !== undefined" :warnings="operation.Warnings"></warnings>

      <component v-if="additionalInfoComponent !== undefined" :is="additionalInfoComponent" :operation="operation"></component>

      <div class="content">
        <ul class="stats">
          <li>Cost: <strong>{{ operation.EstimateTotalCost | filterSigfig}}</strong> (CPU: {{ operation.EstimateCPU | filterSigfig }}, IO: {{ operation.EstimateIO | filterSigfig }})</li>
          <li>Subtree: <strong>{{ operation.EstimatedTotalSubtreeCost | filterSigfig }}</strong></li>
        </ul>
      </div>
      <div v-if="runtimeCountersSummary !== undefined && runtimeCountersSummary.ActualRows !== undefined" class="content">
        <ul class="stats">
          <li>Actual Rows: <strong>{{ runtimeCountersSummary.ActualRows | filterInteger }}</strong></li>
          <li>Row Size: <strong>{{ operation.AvgRowSize | filterBytes }}</strong></li>
          <li>Actual Total Size: <strong>{{ runtimeCountersSummary.ActualRows * operation.AvgRowSize | filterBytes }}</strong></li>
        </ul>
      </div>
      <div class="content">
        <ul class="stats">
          <li>Est. Rows: <strong>{{ operation.EstimateRows | filterInteger }}</strong></li>
          <li>Row Size: <strong>{{ operation.AvgRowSize | filterBytes }}</strong></li>
          <li>Est. Total Size: <strong>{{ operation.EstimateRows * operation.AvgRowSize | filterBytes }}</strong></li>
        </ul>
      </div>
      <div class="content max-height">
        <h4>Output</h4>
        <div class="small" v-for="(key, index) in groupedOutput" :key="index">
          <span v-if="key.key !== ''"><sql-string :sql="key.key"></sql-string></span>
          <span v-else>Computed</span>
          <ul class="comma-list">
            <li v-for="(member, memberIndex) in key.members" :key="memberIndex"><sql-string :sql="member.Column" :expandedColumns="expandedColumns"></sql-string></li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else-if="selectedTab === 'advanced'">
      <div class="content">
        <ul class="stats">
          <li>Est. Rebinds: <strong>{{ operation.EstimateRebinds | filterInteger }}</strong></li>
          <li>Est. Rewinds: <strong>{{ operation.EstimateRewinds | filterInteger }}</strong></li>
        </ul>
      </div>
      <div v-if="runtimeCountersSummary !== undefined">
        <div v-if="runtimeCountersSummary.ActualRebinds !== undefined" class="content">
          <ul class="stats">
            <li>Actual Rebinds: <strong>{{ runtimeCountersSummary.ActualRebinds | filterInteger }}</strong></li>
            <li>Actual Rewinds: <strong>{{ runtimeCountersSummary.ActualRewinds | filterInteger }}</strong></li>
          </ul>
        </div>
        <div v-if="runtimeCountersSummary.ActualElapsedms !== undefined" class="content">
          <ul class="stats">
            <li>Elapsed: <strong>{{ runtimeCountersSummary.ActualElapsedms | filterInteger }}</strong>ms</li>
            <li v-if="runtimeCountersSummary.ActualCPUms !== undefined">CPU: <strong>{{ runtimeCountersSummary.ActualCPUms | filterInteger }}</strong>ms</li>
          </ul>
        </div>
        <div v-if="runtimeCountersSummary.ActualLogicalReads !== undefined" class="content">
          <h4>Reads</h4>
          <ul class="stats">
            <li v-if="runtimeCountersSummary.ActualLogicalReads !== undefined">Logical: <strong>{{ runtimeCountersSummary.ActualLogicalReads | filterInteger }}</strong></li>
            <li v-if="runtimeCountersSummary.ActualPhysicalReads !== undefined">Physical: <strong>{{ runtimeCountersSummary.ActualPhysicalReads | filterInteger }}</strong></li>
            <li v-if="runtimeCountersSummary.ActualReadAheads !== undefined">Read Aheads: <strong>{{ runtimeCountersSummary.ActualReadAheads | filterInteger }}</strong></li>
          </ul>
        </div>
        <div v-if="runtimeCountersSummary.ActualLobLogicalReads !== undefined" class="content">
          <h4>Large Object Reads</h4>
          <ul class="stats">
            <li v-if="runtimeCountersSummary.ActualLobLogicalReads !== undefined">Logical: <strong>{{ runtimeCountersSummary.ActualLobLogicalReads | filterInteger }}</strong></li>
            <li v-if="runtimeCountersSummary.ActualLobPhysicalReads !== undefined">Physical: <strong>{{ runtimeCountersSummary.ActualLobPhysicalReads | filterInteger }}</strong></li>
            <li v-if="runtimeCountersSummary.ActualLobReadAheads !== undefined">Read Aheads: <strong>{{ runtimeCountersSummary.ActualLobReadAheads | filterInteger }}</strong></li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="content raw-data">
        <tree-view :data="shallowOperation"></tree-view>
      </div>
    </div>
    <div class="footer">
      <div class="buttons">
        <a @click="selectedTab='overview'" :class="{ 'selected': selectedTab === 'overview' }">Overview</a>
        <a @click="selectedTab='advanced'" :class="{ 'selected': selectedTab === 'advanced' }">Advanced</a>
        <a @click="selectedTab = 'raw'" :class="{ 'selected': selectedTab === 'raw' }">Raw</a>
      </div>
    </div>
  </div>

</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as ShowPlan from '@/parser/showplan';

import TreeView from 'vue-json-tree';
import SortBy from './operations/SortByView.vue';
import IndexScan from './operations/IndexScanView.vue';
import FilterOp from './operations/FilterView.vue';
import ComputeScalarOp from './operations/ComputeScalarView.vue';
import StreamAggregateOp from './operations/StreamAggregateView.vue';
import HashOp from './operations/HashView.vue';
import BatchHashTableBuildOp from './operations/BatchHashTableBuildView.vue';
import ConcatOp from './operations/ConcatView.vue';
import TopOp from './operations/TopView.vue';
import NestedLoop from './operations/NestedLoopView.vue';
import UpdateOp from './operations/UpdateView.vue';
import InsertOp from './operations/InsertView.vue';
import MergeJoinOp from './operations/MergeJoinView.vue';
import AdaptiveJoinOp from './operations/AdaptiveJoinView.vue';

import Warnings from './operations/Warnings.vue';

import { Group } from '@/parser/grouping';
import ColumnReferenceParser from '@/parser/column-reference-parser';

@Component({
    components: {
        SortBy,
        IndexScan,
        FilterOp,
        ComputeScalarOp,
        StreamAggregateOp,
        HashOp,
        BatchHashTableBuildOp,
        ConcatOp,
        TopOp,
        NestedLoop,
        UpdateOp,
        InsertOp,
        MergeJoinOp,
        AdaptiveJoinOp,
        Warnings,
        TreeView,
    },
})
export default class OperationSummary extends Vue {
  @Prop() public statement!: ShowPlan.BaseStmtInfo;

  @Prop() public operation!: ShowPlan.RelOp;

  public selectedTab: string = 'overview';

  public get groupedOutput(): Group<ShowPlan.ColumnReference>[] {
      return ColumnReferenceParser.Group(this.operation.OutputList);
  }

  public get headingText(): string {
      switch (this.operation.PhysicalOp) {
          case 'Index Scan':
          case 'Index Seek':
              return `${this.operation.PhysicalOp} (NonClustered)`;
          default:
              return this.operation.PhysicalOp;
      }
  }

  public get additionalInfoComponent(): string | undefined {
      if (this.operation.Action instanceof ShowPlan.Sort) {
          return 'sort-by';
      } if (this.operation.Action instanceof ShowPlan.IndexScan) {
          return 'index-scan';
      } if (this.operation.Action instanceof ShowPlan.Filter) {
          return 'filter-op';
      } if (this.operation.Action instanceof ShowPlan.ComputeScalar) {
          return 'compute-scalar-op';
      } if (this.operation.Action instanceof ShowPlan.StreamAggregate) {
          return 'stream-aggregate-op';
      } if (this.operation.Action instanceof ShowPlan.Hash) {
          return 'hash-op';
      } if (this.operation.Action instanceof ShowPlan.BatchHashTableBuild) {
          return 'batch-hash-table-build-op';
      } if (this.operation.Action instanceof ShowPlan.Concat) {
          return 'concat-op';
      } if (this.operation.Action instanceof ShowPlan.Top) {
          return 'top-op';
      } if (this.operation.Action instanceof ShowPlan.NestedLoops) {
          return 'nested-loop';
      } if (this.operation.Action instanceof ShowPlan.Update) {
          return 'update-op';
      } if (this.operation.Action instanceof ShowPlan.CreateIndex) {
          return 'insert-op';
      } if (this.operation.Action instanceof ShowPlan.Merge) {
          return 'merge-join-op';
      } if (this.operation.Action instanceof ShowPlan.AdaptiveJoin) {
          return 'adaptive-join-op';
      }

      return undefined;
  }

  public get shallowOperation(): ShowPlan.RelOp {
      // clone the operation but remove the child relop collection
      // for displaying in the 'raw' display
      const shallow: ShowPlan.RelOp = JSON.parse(JSON.stringify(this.operation, (key, value) => {
          if (key === 'RelOp' || key === 'expandedComputedColumns') {
              return undefined;
          }

          return value;
      }));

      return shallow;
  }

  public get progressPercent(): string {
      if (this.statement === undefined || this.statement.StatementSubTreeCost === undefined) {
          return 'progress-0';
      }

      let percent = (this.operation.EstimateTotalCost / this.statement.StatementSubTreeCost) * 100;
      if (percent < 10) {
          percent = Math.round(percent);
      } else {
          percent = Math.round(percent / 5) * 5;
      }

      return `progress-${percent}`;
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

  private get expandedColumns(): ShowPlan.ExpandedComputedColumn[] {
      return this.operation.ExpandedComputedColumns;
  }

  public get runtimeCountersSummary(): ShowPlan.RunTimeInformationTypeRunTimeCountersPerThread | undefined {
      if (this.operation.RunTimeInformation === undefined || this.operation.RunTimeInformation.RunTimeCountersPerThread.length === 0) {
          return undefined;
      }

      const summary = this.operation.RunTimeInformation.GetRunTimeCountersSummary();
      if (summary === undefined) {
          return summary;
      }

      // in the absense of these values SSMS shows 0
      if (summary.ActualRebinds === undefined) {
          summary.ActualRebinds = 0;
      }

      if (summary.ActualRewinds === undefined) {
          summary.ActualRewinds = 0;
      }

      return summary;
  }

  private getShortName(o: ShowPlan.ObjectType) {
      const table = `${o.Table}.${o.Index}`;
      if (o.Alias === undefined) {
          return table;
      }

      return `${table} ${o.Alias}`;
  }
}
</script>

<style lang="scss" scoped>
  .card .json-tree-root {
    background-color: inherit !important;
    padding:0 !important;
    margin: 0;
  }

  .card .json-tree-sign {
    display: none;
  }

  .card .json-tree {
    font-size: .75rem !important;
  }
</style>

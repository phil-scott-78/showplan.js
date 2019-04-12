<template>
    <component
        :is="additionalInfoComponent"
        v-if="additionalInfoComponent !== undefined"
        :operation="operation"
    />
</template>
<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';

import * as ShowPlan from 'showplan-js';

import SortBy from '@/components/operation/operations/SortByView.vue';
import IndexScan from '@/components/operation/operations/IndexScanView.vue';
import FilterOp from '@/components/operation/operations/FilterView.vue';
import ComputeScalarOp from '@/components/operation/operations/ComputeScalarView.vue';
import StreamAggregateOp from '@/components/operation/operations/StreamAggregateView.vue';
import HashOp from '@/components/operation/operations/HashView.vue';
import BatchHashTableBuildOp from '@/components/operation/operations/BatchHashTableBuildView.vue';
import ConcatOp from '@/components/operation/operations/ConcatView.vue';
import TopOp from '@/components/operation/operations/TopView.vue';
import NestedLoop from '@/components/operation/operations/NestedLoopView.vue';
import UpdateOp from '@/components/operation/operations/UpdateView.vue';
import InsertOp from '@/components/operation/operations/InsertView.vue';
import MergeJoinOp from '@/components/operation/operations/MergeJoinView.vue';
import AdaptiveJoinOp from '@/components/operation/operations/AdaptiveJoinView.vue';
import ParallelismOp from '@/components/operation/operations/ParallelismView.vue';
import SegmentOp from '@/components/operation/operations/SegmentView.vue';
import TableValuedFunctionOp from '@/components/operation/operations/TableValuedFunctionView.vue';
import CollapseOp from '@/components/operation/operations/CollapseView.vue';
import SpoolOp from '@/components/operation/operations/SpoolView.vue';
import SplitOp from '@/components/operation/operations/SplitView.vue';
import RemoteOp from '@/components/operation/operations/RemoteView.vue';

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
        ParallelismOp,
        SegmentOp,
        TableValuedFunctionOp,
        CollapseOp,
        SpoolOp,
        SplitOp,
        RemoteOp,
    },
})
export default class AdditionalOperationComponent extends Vue {
    @Prop() public statement!: ShowPlan.BaseStmtInfo;

    @Prop() public operation!: ShowPlan.RelOp;

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
        } if (this.operation.Action instanceof ShowPlan.Parallelism) {
            return 'parallelism-op';
        } if (this.operation.Action instanceof ShowPlan.Segment) {
            return 'segment-op';
        } if (this.operation.Action instanceof ShowPlan.TableValuedFunction) {
            return 'table-valued-function-op';
        } if (this.operation.Action instanceof ShowPlan.Collapse) {
            return 'collapse-op';
        } if (this.operation.Action instanceof ShowPlan.Spool) {
            return 'spool-op';
        } if (this.operation.Action instanceof ShowPlan.Split) {
            return 'split-op';
        } if (this.operation.Action instanceof ShowPlan.Remote) {
            return 'remote-op';
        }

        return undefined;
    }
}
</script>

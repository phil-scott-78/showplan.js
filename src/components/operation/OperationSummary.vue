<template>
    <div class="opSummary card">
        <div class="content header">
            <div
                class="progress-circle"
                :class="progressPercent"
                style="float:right"
            >
                <div class="progress-number">
                    {{ operation.EstimateTotalCost / statement.StatementSubTreeCost | filterPercent }}
                </div>
            </div>
            <h3>{{ headingText }}</h3>
            <div
                v-if="getSubHeadingText !== undefined"
                class="meta"
                :title="getSubHeadingText | stripBrackets"
            >
                {{ getSubHeadingText | stripBrackets }}
            </div>
        </div>
        <div v-if="selectedTab === 'overview'">
            <warnings
                v-if="operation.Warnings !== undefined"
                :warnings="operation.Warnings"
            />

            <additional-operation-component
                :statement="statement"
                :operation="operation"
            />

            <div class="content">
                <ul class="stats">
                    <li>Cost: <strong>{{ operation.EstimateTotalCost | filterSigfig }}</strong> (CPU: {{ operation.EstimateCPU | filterSigfig }}, IO: {{ operation.EstimateIO | filterSigfig }})</li>
                    <li>Subtree: <strong>{{ operation.EstimatedTotalSubtreeCost | filterSigfig }}</strong></li>
                </ul>
            </div>
            <div
                v-if="runtimeCountersSummary !== undefined && runtimeCountersSummary.ActualRows !== undefined"
                class="content"
            >
                <div class="item">
                    <ul class="stats">
                        <li>Actual Rows: <strong>{{ runtimeCountersSummary.ActualRows | filterInteger }}</strong></li>
                        <li>Row Size: <strong>{{ operation.AvgRowSize | filterBytes }}</strong></li>
                    </ul>
                </div>
                <div class="item">
                    Actual Total Size: <strong>{{ runtimeCountersSummary.ActualRows * operation.AvgRowSize | filterBytes }}</strong>
                </div>
            </div>
            <div class="content">
                <div class="item">
                    <ul class="stats">
                        <li>Est. Rows: <strong>{{ operation.EstimateRows | filterInteger }}</strong></li>
                        <li>Row Size: <strong>{{ operation.AvgRowSize | filterBytes }}</strong></li>
                    </ul>
                </div>
                <div class="item">
                    Est. Total Size: <strong>{{ operation.EstimateRows * operation.AvgRowSize | filterBytes }}</strong>
                </div>
            </div>
            <div
                v-if="operation.Parallel && operation.RunTimeInformation !== undefined && operation.RunTimeInformation.RunTimeCountersPerThread.length > 1"
                class="content"
            >
                <h4>Run-time Parallel Stats</h4>
                <div class="item split">
                    <div class="child">
                        Actual Rows
                    </div>
                    <div class="child">
                        <counter-chart
                            :run-time-information="operation.RunTimeInformation.RunTimeCountersPerThread"
                            :property-func="(i) => i.ActualRows"
                            property-name="Actual Rows"
                        />
                    </div>
                </div>
                <div
                    v-if="operation.RunTimeInformation.RunTimeCountersPerThread[0].ActualElapsedms !== undefined"
                    class="item split"
                >
                    <div class="child">
                        Actual CPUms
                    </div>
                    <div class="child">
                        <counter-chart
                            :run-time-information="operation.RunTimeInformation.RunTimeCountersPerThread"
                            :property-func="(i) => i.ActualCPUms"
                            property-name="Actual CPUms"
                        />
                    </div>
                </div>
            </div>
            <div class="content max-height">
                <h4>Output</h4>
                <div
                    v-for="(key, index) in groupedOutput"
                    :key="index"
                    class="small"
                >
                    <span v-if="key.key !== ''"><sql-string :sql="key.key" /></span>
                    <span v-else>Computed</span>
                    <ul class="comma-list">
                        <li
                            v-for="(member, memberIndex) in key.members"
                            :key="memberIndex"
                        >
                            <sql-string
                                :sql="member.Column"
                                :expanded-columns="expandedColumns"
                            />
                        </li>
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
                <div
                    v-if="runtimeCountersSummary.ActualRebinds !== undefined"
                    class="content"
                >
                    <ul class="stats">
                        <li>Actual Rebinds: <strong>{{ runtimeCountersSummary.ActualRebinds | filterInteger }}</strong></li>
                        <li>Actual Rewinds: <strong>{{ runtimeCountersSummary.ActualRewinds | filterInteger }}</strong></li>
                    </ul>
                </div>
                <div
                    v-if="runtimeCountersSummary.ActualElapsedms !== undefined"
                    class="content"
                >
                    <ul class="stats">
                        <li>Elapsed: <strong>{{ runtimeCountersSummary.ActualElapsedms | filterInteger }}</strong>ms</li>
                        <li v-if="runtimeCountersSummary.ActualCPUms !== undefined">
                            CPU: <strong>{{ runtimeCountersSummary.ActualCPUms | filterInteger }}</strong>ms
                        </li>
                    </ul>
                </div>
                <div
                    v-if="runtimeCountersSummary.ActualLogicalReads !== undefined"
                    class="content"
                >
                    <h4>Reads</h4>
                    <ul class="stats">
                        <li v-if="runtimeCountersSummary.ActualLogicalReads !== undefined">
                            Logical: <strong>{{ runtimeCountersSummary.ActualLogicalReads | filterInteger }}</strong>
                        </li>
                        <li v-if="runtimeCountersSummary.ActualPhysicalReads !== undefined">
                            Physical: <strong>{{ runtimeCountersSummary.ActualPhysicalReads | filterInteger }}</strong>
                        </li>
                        <li v-if="runtimeCountersSummary.ActualReadAheads !== undefined">
                            Read Aheads: <strong>{{ runtimeCountersSummary.ActualReadAheads | filterInteger }}</strong>
                        </li>
                    </ul>
                </div>
                <div
                    v-if="runtimeCountersSummary.ActualLobLogicalReads !== undefined"
                    class="content"
                >
                    <h4>Large Object Reads</h4>
                    <ul class="stats">
                        <li v-if="runtimeCountersSummary.ActualLobLogicalReads !== undefined">
                            Logical: <strong>{{ runtimeCountersSummary.ActualLobLogicalReads | filterInteger }}</strong>
                        </li>
                        <li v-if="runtimeCountersSummary.ActualLobPhysicalReads !== undefined">
                            Physical: <strong>{{ runtimeCountersSummary.ActualLobPhysicalReads | filterInteger }}</strong>
                        </li>
                        <li v-if="runtimeCountersSummary.ActualLobReadAheads !== undefined">
                            Read Aheads: <strong>{{ runtimeCountersSummary.ActualLobReadAheads | filterInteger }}</strong>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div v-else>
            <raw-operation :operation="operation" />
        </div>
        <div class="footer">
            <div class="buttons">
                <a
                    :class="{ 'selected': selectedTab === 'overview' }"
                    @click="selectedTab='overview'"
                >Overview</a>
                <a
                    :class="{ 'selected': selectedTab === 'advanced' }"
                    @click="selectedTab='advanced'"
                >Advanced</a>
                <a
                    :class="{ 'selected': selectedTab === 'raw' }"
                    @click="selectedTab = 'raw'"
                >Raw</a>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as ShowPlan from 'showplan-js';

import { Group, Grouper } from '@/grouping';
import Warnings from '@/components/operation/operations/Warnings.vue';
import CounterChart from '@/components/operation/operations/CounterChart.vue';

import AdditionalOperationComponent from '@/components/operation/AdditionalOperationComponent.vue';
import RawOperation from '@/components/operation/RawOperation.vue';

@Component({
    components: {
        RawOperation,
        AdditionalOperationComponent,
        Warnings,
        CounterChart,
    },
})
export default class OperationSummary extends Vue {
    @Prop() public statement!: ShowPlan.BaseStmtInfo;

    @Prop() public operation!: ShowPlan.RelOp;

    public selectedTab: string = 'overview';

    public get groupedOutput(): Group<ShowPlan.ColumnReference>[] {
        return OperationSummary.Group(this.operation.OutputList);
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

    static Group(columns: ShowPlan.ColumnReference[]): Group<ShowPlan.ColumnReference>[] {
        // return groupBy(columns, (a) => a.Database + '.' + a.Schema + '.' + a.Table);
        return Grouper.groupBy<ShowPlan.ColumnReference>(columns, (a: ShowPlan.ColumnReference) => {
            if (a.Database !== undefined && a.Schema !== undefined && a.Table !== undefined) {
                let key = `${a.Database}.${a.Schema}.${a.Table}`;
                if (a.Alias !== undefined) {
                    key += ` as ${a.Alias}`;
                }

                return key;
            }

            return '';
        });
    }
}
</script>

<style lang="scss" scoped>

</style>

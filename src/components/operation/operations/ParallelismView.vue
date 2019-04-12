<template>
    <div>
        <div class="content">
            <ul
                v-if="parallelism.PartitioningType !== undefined"
                class="stats item"
            >
                <li>
                    Partitioning Type: <strong>{{ parallelism.PartitioningType }}</strong>
                </li>
            </ul>
            <ul class="stats item">
                <li>Incoming Threads: <strong>{{ incomingThreads }}</strong></li><li>Outgoing Threads: <strong>{{ outgoingThreads }}</strong></li>
            </ul>
        </div>
        <div
            v-if="parallelism.OrderBy !== undefined"
            class="content"
        >
            <h4>Order By</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in parallelism.OrderBy.OrderByColumn"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="parallelism.PartitionColumns !== undefined && parallelism.PartitionColumns.length > 0"
            class="content"
        >
            <h4>Partition Columns</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in parallelism.PartitionColumns"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="parallelism.HashKeys !== undefined && parallelism.HashKeys.length > 0"
            class="content"
        >
            <h4>Hash Keys</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in parallelism.HashKeys"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, Parallelism, ExpandedComputedColumn } from 'showplan-js';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class ParallelismView extends Vue {
    @Prop() public operation!: RelOp;

    private get parallelism(): Parallelism {
        return this.operation.Action as Parallelism;
    }

    private get incomingThreads(): number {
        const parallelChild = this.parallelism.RelOp.find(i => i.Parallel);
        if (parallelChild === undefined) {
            return 1;
        }

        if (parallelChild.RunTimeInformation === undefined) {
            return 1;
        }

        return parallelChild.RunTimeInformation.RunTimeCountersPerThread.length;
    }

    private get outgoingThreads(): number {
        if (this.operation.RunTimeInformation === undefined) {
            return 1;
        }

        return this.operation.RunTimeInformation.RunTimeCountersPerThread.length;
    }

    private get expandedChildColumns(): ExpandedComputedColumn[] {
        return this.operation.GetChildExpandedComputedColumns();
    }
}
</script>

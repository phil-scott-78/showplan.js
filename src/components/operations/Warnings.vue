<template>
    <div class="warnings-container">
        <div v-if="warnings.NoJoinPredicate === true" class="content warning">
            <h4>No Join Predicate</h4>
        </div>
        <div v-if="warnings.SpatialGuess === true" class="content warning">
            <h4>Spacial Guess</h4>
        </div>
        <div v-if="warnings.FullUpdateForOnlineIndexBuild === true" class="content warning">
            <h4>Full Update For Online Index Build</h4>
        </div>
        <div v-if="warnings.UnmatchedIndexes === true" class="content warning">
            <h4>Unmatched Indexes</h4>
        </div>
        <div v-if="warnings.ColumnsWithNoStatistics !== undefined && warnings.ColumnsWithNoStatistics.length > 0" class="content warning">
            <h4>Columns With No Statistics</h4>
            <ul class="small">
                <li v-for="(col, index) in warnings.ColumnsWithNoStatistics" :key="index">
                    <sql-string :sql="col.toString()"></sql-string>
                </li>
            </ul>
        </div>
        <div v-if="warnings.HashSpillDetails !== undefined && warnings.HashSpillDetails.length > 0" class="content warning">
            <h4>Hash Spills Warning</h4>
            <ul class="small">
                <li v-if="warnings.SpillToTempDb.length === 1">
                    <ul class="stats">
                        <li>Spill Level <strong>{{ warnings.SpillToTempDb[0].SpillLevel }}</strong></li>
                        <li>Spilled ThreadCount <strong>{{ warnings.SpillToTempDb[0].SpilledThreadCount }}</strong></li>
                    </ul>
                </li>
                <li>
                    <ul class="stats">
                        <li v-if="warnings.HashSpillDetails[0].GrantedMemoryKb !== undefined">Granted Memory <strong> {{ warnings.HashSpillDetails[0].GrantedMemoryKb | filterKiloBytes }} </strong></li>
                        <li v-if="warnings.HashSpillDetails[0].UsedMemoryKb !== undefined">Used Memory <strong> {{ warnings.HashSpillDetails[0].UsedMemoryKb | filterKiloBytes }} </strong></li>
                    </ul>
                </li>
                <li>
                    <ul class="stats">
                        <li v-if="warnings.HashSpillDetails[0].ReadsFromTempDb !== undefined">Reads from TempDB <strong> {{ warnings.HashSpillDetails[0].ReadsFromTempDb | filterInteger }} </strong></li>
                        <li v-if="warnings.HashSpillDetails[0].WritesToTempDb !== undefined">Writes to TempDB <strong> {{ warnings.HashSpillDetails[0].WritesToTempDb | filterInteger }} </strong></li>
                    </ul>
                </li>
            </ul>
        </div>
        <div v-if="warnings.SortSpillDetails !== undefined && warnings.SortSpillDetails.length > 0" class="content warning">
            <h4>Sort Spill Warning</h4>
            <p>Operator used TempDB to spill during operation</p>
            <ul class="small">
                <li v-if="warnings.SpillToTempDb.length === 1">
                    <ul class="stats">
                        <li>Spill Level <strong>{{ warnings.SpillToTempDb[0].SpillLevel }}</strong></li>
                        <li>Spilled ThreadCount <strong>{{ warnings.SpillToTempDb[0].SpilledThreadCount }}</strong></li>
                    </ul>
                </li>
                <li>
                    <ul class="stats">
                        <li v-if="warnings.SortSpillDetails[0].GrantedMemoryKb !== undefined">Granted Memory <strong> {{ warnings.SortSpillDetails[0].GrantedMemoryKb | filterKiloBytes }} </strong></li>
                        <li v-if="warnings.SortSpillDetails[0].UsedMemoryKb !== undefined">Used Memory <strong> {{ warnings.SortSpillDetails[0].UsedMemoryKb | filterKiloBytes }} </strong></li>
                    </ul>
                </li>
                <li>
                    <ul class="stats">
                        <li v-if="warnings.SortSpillDetails[0].ReadsFromTempDb !== undefined">Reads from TempDB <strong> {{ warnings.SortSpillDetails[0].ReadsFromTempDb | filterInteger }} </strong></li>
                        <li v-if="warnings.SortSpillDetails[0].WritesToTempDb !== undefined">Writes to TempDB <strong> {{ warnings.SortSpillDetails[0].WritesToTempDb | filterInteger }} </strong></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { Warnings } from '@/parser/showplan';

@Component({
})
export default class Warning extends Vue {
  @Prop() public warnings!: Warnings;
}
</script>

<style lang="scss" scoped>

</style>

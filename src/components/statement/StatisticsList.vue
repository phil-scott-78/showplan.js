<template>
    <div class="content">
        <table class="data">
            <thead>
                <tr><th>Statistics</th><th>Schema</th><th>Database</th><th>Sampling</th><th>Modification Count</th><th>Last Update</th></tr>
            </thead>
            <tbody>
                <tr
                    v-for="(stats, index) in statement.QueryPlan.OptimizerStatsUsage.StatisticsInfo"
                    :key="index"
                >
                    <td>{{ stats.Statistics }} </td>
                    <td>{{ stats.Schema }} </td>
                    <td>{{ stats.Database }} </td>
                    <td>{{ stats.SamplingPercent / 100 | filterPercent }}</td>
                    <td>{{ stats.ModificationCount }}</td>
                    <td><abbr :title="stats.LastUpdate">{{ formatDistance(stats.LastUpdate) }} ago</abbr> </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { BaseStmtInfo } from 'showplan-js';

import { formatDistance } from 'date-fns';

@Component({
})
export default class StatisticsList extends Vue {
  @Prop() public statement!: BaseStmtInfo;

  public formatDistance(date: Date): string {
      return formatDistance(date, Date.now());
  }
}
</script>

<style lang="scss" scoped>

</style>

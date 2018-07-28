<template>
  <el-select
    v-model="selectedStatement"
    placeholder="Select"
    class="query-plan"
    size="large"
    v-on:change="selectChanged"
    default-first-option
        >
    <el-option-group
      v-for="(batch, index) in showPlan.Batches"
      :key="index"
      :label="index | filterBatch">
      <el-option
        v-for="item in batch.Statements"
        :key="item.Guid"
        :label="item.StatementText.trim()"
        :value="item.Guid"
        >

        <div v-if="item.StatementSubTreeCost !== undefined">
          <span style="float: left;">{{ item.StatementText.trim().substring(0,100) }}</span>
          <span style="float: right; margin-left:2rem"><small>Cost: {{ item.StatementSubTreeCost }} ({{ item.CostPercentOfBatch() | filterPercentage }})</small></span>
        </div>
        <div v-else>
          {{ item.StatementText }}
        </div>

      </el-option>
    </el-option-group>
  </el-select>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';

import * as ShowPlan from '@/parser/showplan';
import * as numeral from 'numeral';

@Component({
  filters: {
    filterBatch(value: number) {
      return numeral(value + 1).format('0o') + ' batch';
    },
    filterPercentage(value: number) {
      return numeral(value).format('0.0%');
    },
  },
})
export default class SelectPlan extends Vue {

  @Prop() public showPlan!: ShowPlan.ShowPlanXML;
  public selectedStatement: string | null = null;

  @Emit('showplan-statement-changed')
  public statementSelected(statementGuid: string) {
    //
  }

  public selectChanged(statementGuid: string) {
    this.statementSelected(statementGuid);
  }

  @Watch('showPlan', { immediate: true, deep: false })
  public onShowPlanChange(val: ShowPlan.ShowPlanXML, oldVal: ShowPlan.ShowPlanXML) {
    let firstItem: string | null = null;
    for (const batch of val.Batches) {
      for (const statement of batch.Statements) {
        if (firstItem == null) {
          firstItem = statement.Guid;
        }

        if (statement.StatementType !== 'USE DATABASE') {
          this.selectedStatement = statement.Guid;
          this.statementSelected(this.selectedStatement);
          return;
        }
      }
    }

    return firstItem;
  }

}
</script>

<style lang="scss">
  .query-plan {width:100%;}
</style>

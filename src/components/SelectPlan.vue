<template>
  <select v-model="selectedStatement" v-on:change="selectChanged">
    <optgroup v-for="(batch, index) in showPlan.Batches" :label="index | filterBatch" v-bind:key="index">
      <option v-for="item in batch.Statements" :value="item.Guid" v-bind:key="item.Guid">
        {{ item.StatementText.trim().substring(0,100)  }}
      </option>
    </optgroup>
  </select>
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

  public selectChanged(e: Event) {
    //
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

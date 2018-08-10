<template>
  <div style="position:relative">
  <a @click="showDrop">Switch</a>
  <dropdown ref="drop">
    <div class="selectPlan">
      <div v-for="(batch, batchIndex) in showPlan.Batches" v-bind:key="batchIndex" class="batch">
        <h4>{{ batchIndex + 1 | ordinal }} Batch</h4>
        <ul>
          <li v-for="(statement) in batch.Statements" v-bind:key="statement.Guid" v-on:click="selectChanged(statement.Guid)">
              <div class="text">
                <sql-string :sql="statement.StatementText.trim().substring(0,100)"></sql-string>
              </div>
              <div class="stats">
                <span v-if="statement.QueryPlan != null" class='stats'><span v-if="statement.StatementSubTreeCost != null">Sub Tree Cost: <strong>{{ statement.StatementSubTreeCost }}</strong> ({{ statement.CostPercentOfBatch() | filterPercent }}) </span></span>
              </div>
          </li>
        </ul>
      </div>
    </div>
  </dropdown>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';

import Dropdown from 'v-dropdown';

import SqlString from '@/components/operations/SqlString.vue';

import * as ShowPlan from '@/parser/showplan';

@Component({
  components: { Dropdown, SqlString },
})
export default class SelectPlan extends Vue {
  @Prop() public showPlan!: ShowPlan.ShowPlanXML;
  public selectedStatement: string | null = null;

  public $refs!: {
    drop: any,
  };

  private show: boolean = false;

  @Emit('showplan-statement-changed')
  public statementSelected(statementGuid: string) {
    //
  }

  public showDrop(e: MouseEvent) {
    this.$refs.drop.$emit('show', true, e.target);
    this.$nextTick(() => {
      if (this.show) {
        this.$emit('show');
      }
    });
  }

  public selectChanged(statementGuid: string) {
    this.statementSelected(statementGuid);
    this.$refs.drop.$emit('show', false);
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

  .selectPlan {
    padding: 1rem;
    margin-bottom: .5rem;
    min-width: 640px;

    h4 {
       margin: 0 0 .5rem 0;
    }

    .batch {
      margin-bottom:.5rem;
    }

    .batch:last-child {margin-bottom:0;}
    .batch ul {
      margin: 0;
      padding:0;
      font-size:.8rem;


      li {
        display:flex;
        border-bottom: 1px solid rgba(34,36,38,.1);
        padding:.25rem 0;

        &:hover{
          background-color: rgba(34,36,38,.05);
          cursor: pointer;
        }

        div.text {
          flex:8;
        }

        div.stats {
          flex:4;
          text-align: right
        }
      }

      li:last-child {
        border: none;
      }

    }
  }


</style>

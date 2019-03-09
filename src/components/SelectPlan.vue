<template>
    <span v-if="showPlan.Batches[0].Statements.length > 1" style="margin-left:.5rem;position:relative;font-size:1.3rem;verticle-align:middle">
        <a class="icon" @click="showDrop"><font-awesome-icon icon="chevron-circle-down" title="Switch Plans"></font-awesome-icon></a>
        <dropdown ref="drop">
            <div class="selectPlan">
                <div v-for="(batch, batchIndex) in showPlan.Batches" :key="batchIndex" class="batch">
                    <h4 v-if="showPlan.Batches.length > 1">{{ batchIndex + 1 | ordinal }} Batch</h4>
                    <h4 v-else>Switch Plan</h4>
                    <ul>
                        <li v-for="(statement) in batch.Statements" :key="statement.Guid" @click="selectChanged(statement.Guid)">
                            <div class="text">
                                <sql-string v-if="statement.StatementText !== undefined" :sql="statement.StatementText.trim().substring(0,100)"></sql-string>
                                <span v-else>(unknown query statement text)</span>
                            </div>
                            <div class="stats">
                                <span v-if="statement.QueryPlan !== undefined" class='stats'>
                                    <span v-if="statement.StatementSubTreeCost !== undefined">Sub Tree Cost: <strong>{{ statement.StatementSubTreeCost }}</strong> ({{ statement.CostPercentOfBatch() | filterPercent }})
                                    </span>
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </dropdown>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';

import Dropdown from '@/components/Dropdown.vue';

import SqlString from '@/components/operations/SqlString.vue';

import * as ShowPlan from '@/parser/showplan';

@Component({
    components: { Dropdown, SqlString },
})
export default class SelectPlan extends Vue {
  @Prop() public showPlan!: ShowPlan.ShowPlanXML;

  public selectedStatement: string | undefined;

  public $refs!: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      drop: any;
  };

  private show: boolean = false;

  public showDrop(e: MouseEvent) {
      const { target } = e;
      this.$refs.drop.$emit('show', target);
      this.$nextTick(() => {
          if (this.show) {
              this.$emit('show', target);
          }
      });
  }

  @Emit('showplan-statement-changed')
  public selectChanged(statementGuid: string): string {
      this.$refs.drop.$emit('show', false);
      return statementGuid;
  }
/*
  @Watch('showPlan', { immediate: true, deep: false })
  public onShowPlanChange(val: ShowPlan.ShowPlanXML, oldVal: ShowPlan.ShowPlanXML) {
      let firstItem: string | undefined;
      for (const batch of val.Batches) {
          for (const statement of batch.Statements) {
              if (firstItem === undefined) {
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
  */
}
</script>

<style lang="scss">
  a.icon {
    cursor: pointer;
  }

  .query-plan {width:100%;}

  .v-dropdown-container {
    background-color: var(--alt-background) !important;
    border-color: var(--alt-border) !important;
  }

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
          background-color: var(--background);;
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

<template>
<div>
  <h1>
    <span class="statementType">{{ statement.StatementType }}</span>
    <span v-if="statement.QueryPlan != null" class='stats'>
      <span v-if="statement.StatementSubTreeCost != null">Sub Tree Cost: <strong>{{ statement.StatementSubTreeCost }}</strong></span>
      <span v-if="statement.StatementEstRows != null">Estimated Number of Rows : <strong>{{ statement.StatementEstRows }}</strong></span>
      <span>Degree of Parallelism:
          <strong v-if="statement.QueryPlan.DegreeOfParallelism != null">{{ statement.statement.QueryPlan.DegreeOfParallelism }}</strong>
          <strong v-else>1</strong>
      </span>
      <span v-if="statement.QueryPlan.CachedPlanSize != null">Cached Plan Size: <strong>{{ statement.QueryPlan.CachedPlanSize | filterKilobytes }}</strong></span>
    </span>
  </h1>
  <pre><code>
    {{ statement.StatementText }}
  </code></pre>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BaseStmtInfo } from '@/parser/showplan';
import * as numeral from 'numeral';

@Component({
  props: {
    statement: BaseStmtInfo,
  },
  filters: {
    filterKilobytes(value: number) {
      return numeral(value * 1024).format('0.0 ib').replace('KiB', 'KB');
    },
  }
})
export default class Statement extends Vue {
}
</script>

<style lang="scss" scoped>
  h1 {

    .stats {
      font-weight: normal;
      font-size: .8rem;
      color: #555;
      float:right;
      display: block;

      span {
        margin-left: .5rem;
        border-right: 1px solid #ccc;
        padding-right: .5rem;
      }

      span:last-child {
        border-right: none
      }
    }
  }

  pre {
    border: 1px solid #ccc;
    background: #eee;
    padding:.25rem;
  }


</style>

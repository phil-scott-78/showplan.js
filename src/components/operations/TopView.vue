<template>
  <div class="content">
    <ul class="stats" v-if="topString !== null">
      <li v-if="top.TopExpression !== null"><sql-string :sql="topString"></sql-string></li>
      <li v-if="top.RowCount">RowCount</li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, Top } from '@/parser/showplan';
import SqlString from './SqlString.vue';

@Component({
  components: { SqlString },
})
export default class TopView extends Vue {
  @Prop() public operation!: RelOp;

  private get top(): Top {
    return this.operation.Action as Top;
  }

  private get topString(): string | null {
    if (this.top.TopExpression === null) {
      return null;
    }

    let out = 'TOP ' + this.top.TopExpression!.ScalarOperator.ScalarString;
    if (this.top.IsPercent) {
      out = out + ' PERCENT';
    }

    return out;
  }
}
</script>

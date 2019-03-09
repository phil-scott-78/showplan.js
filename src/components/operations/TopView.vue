<template>
    <div class="content">
        <ul
            v-if="topString !== undefined"
            class="stats"
        >
            <li v-if="top.TopExpression !== undefined">
                <sql-string :sql="topString" />
            </li>
            <li v-if="top.RowCount">
                RowCount
            </li>
        </ul>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
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

  private get topString(): string | undefined {
      if (this.top.TopExpression === undefined) {
          return undefined;
      }

      let out = `TOP ${this.top.TopExpression.ScalarOperator.ScalarString}`;
      if (this.top.IsPercent) {
          out = `${out} PERCENT`;
      }

      return out;
  }
}
</script>

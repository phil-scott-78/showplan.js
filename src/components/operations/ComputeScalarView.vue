<template>
  <div class="content">
    <h4>Scalar Operations</h4>
    <ul class="small">
      <li v-for="(op, index) in computeScalar.DefinedValues" :key="index"><span v-if="op.ColumnReference != null && op.ColumnReference.length == 1">SET {{ op.ColumnReference[0].toString() }} = </span><span v-html="formatSql(op.ScalarOperator.ScalarString)"></span> </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, ComputeScalar } from '@/parser/showplan';
import { SqlFormatter } from '@/components/formatter';

@Component({})
export default class ComputeScalarView extends Vue {
  @Prop() public operation!: RelOp;

  private get computeScalar(): ComputeScalar {
    return this.operation.Action as ComputeScalar;
  }

  private formatSql(input: string): string {
    return new SqlFormatter().formatSql(input.replaceAll('[', '').replaceAll(']', ''));
  }
}
</script>

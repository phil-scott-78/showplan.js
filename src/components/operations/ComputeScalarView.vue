<template>
  <defined-values :definedValues="computeScalar.DefinedValues" :expandedColumns="expandedColumns"></defined-values>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, ComputeScalar, ExpandedComputedColumn } from '@/parser/showplan';

import DefinedValues from './DefinedValues.vue';

@Component({
    components: { DefinedValues },
})
export default class ComputeScalarView extends Vue {
  @Prop() public operation!: RelOp;

  private get computeScalar(): ComputeScalar {
      return this.operation.Action as ComputeScalar;
  }

  private get expandedColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

<template>
    <defined-values
        :defined-values="computeScalar.DefinedValues"
        :expanded-columns="expandedColumns"
    />
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

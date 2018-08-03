<template>
  <defined-values :definedValues="computeScalar.DefinedValues"></defined-values>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, ComputeScalar } from '@/parser/showplan';

import DefinedValues from './DefinedValues.vue';

@Component({
  components: { DefinedValues },
})
export default class ComputeScalarView extends Vue {
  @Prop() public operation!: RelOp;

  private get computeScalar(): ComputeScalar {
    return this.operation.Action as ComputeScalar;
  }
}
</script>

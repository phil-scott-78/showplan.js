<template>
  <div>
    <defined-values v-if="batchHashTableBuild.DefinedValues !== undefined && batchHashTableBuild.DefinedValues.length > 0" :definedValues="batchHashTableBuild.DefinedValues"></defined-values>
    <div v-if="batchHashTableBuild.BitmapCreator !== undefined" class="content">
      <div>Bitmap Creator: <strong>{{ batchHashTableBuild.BitmapCreator }}</strong> </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop, Watch,
} from 'vue-property-decorator';
import { RelOp, BatchHashTableBuild } from '@/parser/showplan';

import DefinedValues from './DefinedValues.vue';
import SqlString from './SqlString.vue';

@Component({
    components: { DefinedValues, SqlString },
})
export default class BatchHashTableBuildView extends Vue {
  @Prop() public operation!: RelOp;

  private get batchHashTableBuild(): BatchHashTableBuild {
      return this.operation.Action as BatchHashTableBuild;
  }
}
</script>

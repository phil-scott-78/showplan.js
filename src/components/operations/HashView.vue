<template>
    <div>
        <div v-if="hash.HashKeysBuild !== undefined && hash.HashKeysBuild.length > 0" class="content">
            <h4>Hash Keys Build</h4>
            <ul class="small">
                <li v-for="(column, index) in hash.HashKeysBuild" :key="index"><sql-string :sql="column.toString()" :expandedColumns="expandedChildColumns"></sql-string></li>
            </ul>
        </div>
        <div v-if="hash.BuildResidual !== undefined" class="content">
            <h4>Build Residual</h4>
            <div class="small"><sql-string :sql="hash.BuildResidual.ScalarOperator.ScalarString" :expandedColumns="expandedChildColumns"></sql-string></div>
        </div>
        <div class="content" v-if="hash.HashKeysProbe !== undefined && hash.HashKeysProbe.length > 0">
            <h4>Hash Keys Probe</h4>
            <ul class="small">
                <li v-for="(column, index) in hash.HashKeysProbe" :key="index"><sql-string :sql="column.toString()" :expandedColumns="expandedChildColumns"></sql-string></li>
            </ul>
        </div>
        <div v-if="hash.ProbeResidual !== undefined" class="content">
            <h4>Probe Residual</h4>
            <div class="small"><sql-string :sql="hash.ProbeResidual.ScalarOperator.ScalarString" :expandedColumns="expandedChildColumns"></sql-string></div>
        </div>
        <div v-if="hash.BitmapCreator !== undefined" class="content">
            Bitmap Creator: <strong>{{ hash.BitmapCreator }} </strong>
        </div>
        <defined-values v-if="hash.DefinedValues !== undefined && hash.DefinedValues.length > 0" :definedValues="hash.DefinedValues" :expandedColumns="expandedChildColumns"></defined-values>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, Hash, ExpandedComputedColumn } from '@/parser/showplan';

import DefinedValues from './DefinedValues.vue';
import SqlString from './SqlString.vue';

@Component({
    components: { DefinedValues, SqlString },
})
export default class HashView extends Vue {
  @Prop() public operation!: RelOp;

  private get hash(): Hash {
      return this.operation.Action as Hash;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

<template>
<div>
  <div v-if="createIndex.Object !== undefined">
    <div v-for="(object, index) in createIndex.Object" :key="index" class="content">
      <h4><sql-string :sql="object.getFullTableName()"></sql-string></h4>
      <ul class="stats">
        <li>Index: <sql-string :sql="object.Index"></sql-string></li>
        <li>{{ object.IndexKind }}</li>
      </ul>
    </div>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, CreateIndex, ExpandedComputedColumn } from '@/parser/showplan';
import SqlString from './SqlString.vue';

@Component({
  components: { SqlString },
})
export default class FilterView extends Vue {
  @Prop() public operation!: RelOp;

  private get createIndex(): CreateIndex {
    return this.operation.Action as CreateIndex;
  }
}
</script>

<template>
<div>
  <div v-if="update.Object !== undefined">
    <div v-for="(object, index) in update.Object" :key="index" class="content">
      <h4>{{ object.IndexKind }} Update</h4>
      <ul class="small">
        <li><sql-string :sql="object.Index"></sql-string></li>
      </ul>
    </div>
  </div>
  <div v-if="update.SetPredicate !== undefined" class="content">
    <h4>Set Predicate</h4>
    <list-or-div v-bind:data="update.SetPredicate">
      <template slot-scope="{ item }">
        <sql-string :sql="'SET ' +  item.ScalarOperator.ScalarString"></sql-string>
      </template>
    </list-or-div>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, Update } from '@/parser/showplan';

import SqlString from './SqlString.vue';
import ListOrDiv from '../ListOrDiv.vue';

@Component({
    components: { ListOrDiv, SqlString },
})
export default class UpdateView extends Vue {
  @Prop() public operation!: RelOp;

  private get update(): Update {
    return this.operation.Action as Update;
  }
}
</script>

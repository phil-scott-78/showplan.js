<template>
  <div class="content">
    <table class="data" >
      <thead>
        <tr><th>Impact</th><th>Index</th></tr>
      </thead>
      <tbody>
        <tr v-for="(indexGroup, indexGroupIndex) in statement.QueryPlan.MissingIndexes.MissingIndexGroup" :key="indexGroupIndex">
          <td>{{ indexGroup.Impact  | filterSigfig }}</td>
          <td>
            <list-or-div :data="indexGroup.MissingIndex" list-class="" div-class="">
              <template slot-scope="{ item }">
                <code><sql-string :sql="item.toCreateIndexString()"></sql-string></code>
              </template>
            </list-or-div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { BaseStmtInfo } from '@/parser/showplan';

import ListOrDiv from './ListOrDiv.vue';

@Component({
    components: { ListOrDiv },
})
export default class MissingIndexes extends Vue {
  @Prop() public statement!: BaseStmtInfo;
}
</script>

<style lang="scss" scoped>

</style>

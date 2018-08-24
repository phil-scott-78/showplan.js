<template>
<div>
  <div v-if="indexScan.Predicate !== undefined" class="content">
    <h4>Predicate</h4>
    <list-or-div v-bind:data="indexScan.Predicate">
      <template slot-scope="{ item }">
        <sql-string :sql="item.ScalarOperator.ScalarString"></sql-string>
      </template>
    </list-or-div>
  </div>
  <div v-if="indexScan.SeekPredicates !== undefined && indexScan.SeekPredicates.SeekPredicateNew !== undefined" class="content">
    <h4>Seek Predicates</h4>
    <list-or-div v-if="indexScan.SeekPredicates.SeekPredicateNew !== undefined" v-bind:data="indexScan.SeekPredicates.SeekPredicateNew">
      <template slot-scope="{ item }">
        <list-or-div v-bind:data="item.SeekKeys">
          <template slot-scope="keyItem">
            <list-or-div v-bind:data="keyItem.item.toStrings()">
              <template slot-scope="keyString">
                {{ keyString.item.key }} - <sql-string :sql="keyString.item.value"></sql-string>
              </template>
            </list-or-div>
          </template>
        </list-or-div>
      </template>
    </list-or-div>
  </div>
  <div v-if="indexScan.SeekPredicates !== undefined && indexScan.SeekPredicates.SeekPredicate !== undefined" class="content">
    <h4>Seek Predicates</h4>
    <list-or-div v-if="indexScan.SeekPredicates.SeekPredicate !== undefined" v-bind:data="indexScan.SeekPredicates.SeekPredicate">
      <template slot-scope="{ item }">
        <list-or-div v-bind:data="item.toStrings()">
          <template slot-scope="keyString">
            {{ keyString.item.key }} - <sql-string :sql="keyString.item.value"></sql-string>
          </template>
        </list-or-div>
      </template>
    </list-or-div>
  </div>
  <div class="content">
    <ul class="stats">
      <li>Ordered: <strong>{{ indexScan.Ordered }}</strong></li>
    </ul>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, IndexScan as indexScan } from '@/parser/showplan';

import SqlString from './SqlString.vue';
import ListOrDiv from '../ListOrDiv.vue';

@Component({
    components: { ListOrDiv, SqlString },
})
export default class IndexScanView extends Vue {
  @Prop() public operation!: RelOp;

  private get indexScan(): indexScan {
    return this.operation.Action as indexScan;
  }
}
</script>

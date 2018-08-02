<template>
<div>
  <div v-if="indexScan.Predicate != null" class="content">
    <h4>Predicate</h4>
    <list-or-div v-bind:data="indexScan.Predicate">
      <template slot-scope="{ item }">
        <span v-html="format(item.ScalarOperator.ScalarString)"></span>
      </template>
    </list-or-div>
  </div>
  <div v-if="indexScan.SeekPredicates != null && indexScan.SeekPredicates.SeekPredicate != null" class="content">
    <h4>Seek Predicates</h4>
    <list-or-div v-bind:data="indexScan.SeekPredicates.SeekPredicate">
      <template slot-scope="{ item }">
        {{ item.toString() }}
      </template>
    </list-or-div>
  </div>
  <div v-if="indexScan.SeekPredicates != null && indexScan.SeekPredicates.SeekPredicateNew != null" class="content">
    <h4>Seek Predicates</h4>
    <list-or-div v-bind:data="indexScan.SeekPredicates.SeekPredicateNew">
      <template slot-scope="{ item }">
      <list-or-div v-bind:data="item.SeekKeys">
        <template slot-scope="{ item }">
            <span v-html="format(item.toString())"></span>
          </template>
      </list-or-div>
      </template>
    </list-or-div>
  </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { RelOp, IndexScan as indexScan } from '@/parser/showplan';
import { SqlFormatter } from '@/components/formatter';

import ListOrDiv from '../ListOrDiv.vue';

@Component({
    components: { ListOrDiv },
})
export default class IndexScan extends Vue {
  @Prop() public operation!: RelOp;

  private get indexScan(): indexScan {
    return this.operation.Action as indexScan;
  }

  private format(input: string): string {
    let out = input.split('\n').join('\n<br />');
    // some outputs don't have a space after a comma so add a zero width one
    out = out.replaceAll(',', ',\u200B');
    out = out.replaceAll('[', '');
    out = out.replaceAll(']', '');
    // add zero width space after . to keep long identifier from not wrapping
    out = out.replaceAll(',', '.\u200B');
    out = new SqlFormatter().formatSql(out);
    return out;
  }
}
</script>

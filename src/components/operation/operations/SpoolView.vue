<template>
    <div>
        <div
            v-if="spool.PrimaryNodeId !== undefined || spool.Stack !== undefined"
            class="content"
        >
            <ul class="stats">
                <li v-if="spool.PrimaryNodeId !== undefined">
                    Primary Node Id: <strong>{{ spool.PrimaryNodeId }} </strong>
                </li>
                <li v-if="spool.Stack !== undefined">
                    Stack: <strong>{{ spool.Stack }}</strong>
                </li>
            </ul>
        </div>
        <div
            v-if="spool.SeekPredicateNew !== undefined"
            class="content"
        >
            <h4>Seek Predicates</h4>
            <list-or-div :data="spool.SeekPredicateNew.SeekKeys">
                <template slot-scope="keyItem">
                    <list-or-div :data="keyItem.item.toStrings()">
                        <template slot-scope="keyString">
                            {{ keyString.item.key }} - <sql-string
                                :sql="keyString.item.value"
                                :expanded-columns="expandedChildColumns"
                            />
                        </template>
                    </list-or-div>
                </template>
            </list-or-div>
        </div>
        <div
            v-if="spool.SeekPredicate !== undefined"
            class="content"
        >
            <h4>Seek Predicates</h4>
            <list-or-div
                :data="spool.SeekPredicate"
            >
                <template slot-scope="{ item }">
                    <list-or-div :data="item.toStrings()">
                        <template slot-scope="keyString">
                            {{ keyString.item.key }} - <sql-string
                                :sql="keyString.item.value"
                                :expanded-columns="expandedChildColumns"
                            />
                        </template>
                    </list-or-div>
                </template>
            </list-or-div>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, Spool, ExpandedComputedColumn } from 'showplan-js';
import SqlString from './SqlString.vue';
import ListOrDiv from '../../helpers/ListOrDiv.vue';

@Component({
    components: { SqlString, ListOrDiv },
})
export default class SpoolView extends Vue {
  @Prop() public operation!: RelOp;

  private get spool(): Spool {
      return this.operation.Action as Spool;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

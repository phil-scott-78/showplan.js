<template>
    <div>
        <div
            v-if="tableValuedFunction.Object !== undefined"
            class="content"
        >
            <h4>Function</h4>
            <ul class="small">
                <li>
                    <sql-string
                        :sql="tableValuedFunction.Object.getFullTableName()"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="tableValuedFunction.ParameterList !== undefined && tableValuedFunction.ParameterList.ScalarOperator.length > 0"
            class="content"
        >
            <h4>Parameters</h4>
            <ul class="small">
                <li
                    v-for="(param, key) in tableValuedFunction.ParameterList.ScalarOperator"
                    :key="key"
                >
                    <sql-string
                        :sql="param.ScalarString"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="tableValuedFunction.Predicate !== undefined"
            class="content"
        >
            <h4>Predicate</h4>
            <ul class="small">
                <li>
                    <sql-string
                        :sql="tableValuedFunction.Predicate.ScalarOperator.ScalarString"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, TableValuedFunction, ExpandedComputedColumn } from '@/parser/showplan';

import SqlString from './SqlString.vue';
import ListOrDiv from '../../helpers/ListOrDiv.vue';

@Component({
    components: { ListOrDiv, SqlString },
})
export default class TableValuedFunctionView extends Vue {
  @Prop() public operation!: RelOp;

  private get tableValuedFunction(): TableValuedFunction {
      return this.operation.Action as TableValuedFunction;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

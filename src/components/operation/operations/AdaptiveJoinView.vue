<template>
    <div>
        <div
            v-if="operation.AdaptiveThresholdRows !== undefined"
            class="content"
        >
            <h4>Adaptive Join</h4>
            <ul class="small">
                <li>Threshold Rows: <strong>{{ operation.AdaptiveThresholdRows }} </strong></li>
                <li>Estimated Join Type: <strong> {{ operation.EstimatedJoinType }} </strong></li>
                <li v-if="operation.RunTimeInformation !== undefined">
                    Actual Join Type: <strong>{{ operation.RunTimeInformation.RunTimeCountersPerThread[0].ActualJoinType }}</strong>
                </li>
            </ul>
        </div>
        <div
            v-if="adaptiveJoin.HashKeysBuild !== undefined && adaptiveJoin.HashKeysBuild.length > 0"
            class="content"
        >
            <h4>Hash Keys Build</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in adaptiveJoin.HashKeysBuild"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="adaptiveJoin.BuildResidual !== undefined"
            class="content"
        >
            <h4>Build Residual</h4>
            <div class="small">
                <sql-string
                    :sql="adaptiveJoin.BuildResidual.ScalarOperator.ScalarString"
                    :expanded-columns="expandedChildColumns"
                />
            </div>
        </div>
        <div
            v-if="adaptiveJoin.HashKeysProbe !== undefined && adaptiveJoin.HashKeysProbe.length > 0"
            class="content"
        >
            <h4>Hash Keys Probe</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in adaptiveJoin.HashKeysProbe"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="adaptiveJoin.ProbeResidual !== undefined"
            class="content"
        >
            <h4>Probe Residual</h4>
            <div class="small">
                <sql-string
                    :sql="adaptiveJoin.ProbeResidual.ScalarOperator.ScalarString"
                    :expanded-columns="expandedChildColumns"
                />
            </div>
        </div>
        <div
            v-if="adaptiveJoin.PassThru !== undefined"
            class="content"
        >
            <h4>PassThru</h4>
            <div>
                <sql-string
                    :sql="adaptiveJoin.PassThru.ScalarOperator.ScalarString"
                    :expanded-columns="expandedChildColumns"
                />
            </div>
        </div>
        <div
            v-if="adaptiveJoin.OuterReferences !== undefined && adaptiveJoin.OuterReferences.length > 0"
            class="content"
        >
            <h4>Outer References</h4>
            <ul class="small">
                <li
                    v-for="(column, index) in adaptiveJoin.OuterReferences"
                    :key="index"
                >
                    <sql-string
                        :sql="column.toString()"
                        :expanded-columns="expandedChildColumns"
                    />
                </li>
            </ul>
        </div>
        <div
            v-if="adaptiveJoin.BitmapCreator !== undefined"
            class="content"
        >
            Bitmap Creator: <strong>{{ adaptiveJoin.BitmapCreator }} </strong>
        </div>
        <!--
        not sure how these apply
        <defined-values v-if="adaptiveJoin.DefinedValues !== undefined && adaptiveJoin.DefinedValues.length > 0" :definedValues="adaptiveJoin.DefinedValues" :expandedColumns="expandedChildColumns"></defined-values>
      -->
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, AdaptiveJoin, ExpandedComputedColumn } from 'showplan-js';

import DefinedValues from './DefinedValues.vue';
import SqlString from './SqlString.vue';

@Component({
    components: { DefinedValues, SqlString },
})
export default class AdaptiveJoinView extends Vue {
  @Prop() public operation!: RelOp;

  private get adaptiveJoin(): AdaptiveJoin {
      return this.operation.Action as AdaptiveJoin;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

<template>
    <div>
        <div
            v-if="statement.StatementOptmLevel !== undefined"
            class="content"
        >
            <ul class="stats">
                <li>Optimization Level: <strong>{{ statement.StatementOptmLevel }}</strong></li>
                <li v-if="statement.StatementOptmEarlyAbortReason !== undefined">
                    Early Abort Reason: <strong>{{ statement.StatementOptmEarlyAbortReason.replace(/([A-Z])/g, ' $1') }}</strong>
                </li>
            </ul>
        </div>
        <div
            v-if="statement.CardinalityEstimationModelVersion !== undefined"
            class="content"
        >
            <ul class="stats">
                <li>
                    Cardinality Estimation Model Version:
                    <strong v-if="statement.CardinalityEstimationModelVersion == 70">SQL Server 7</strong>
                    <strong v-else-if="statement.CardinalityEstimationModelVersion == 140">SQL Server 14</strong>
                    <strong v-else>{{ statement.CardinalityEstimationModelVersion }}</strong>
                </li>
            </ul>
        </div>
        <div
            v-if="statement.QueryPlan !== undefined && statement.CompileTime !== undefined"
            class="content"
        >
            <ul class="stats">
                <li v-if="statement.QueryPlan !== undefined && statement.CompileTime !== undefined">
                    Compile Time: <strong>{{ statement.CompileTime }}ms </strong>
                </li>
                <li v-if="statement.QueryPlan !== undefined && statement.CompileMemory !== undefined">
                    Compile Memory: <strong>{{ statement.CompileMemory }} </strong>
                </li>
                <li v-if="statement.QueryPlan !== undefined && statement.CompileCPU !== undefined">
                    Compile CPU: <strong>{{ statement.CompileCPU }} </strong>
                </li>
            </ul>
        </div>

        <div
            v-if="statement.QueryPlanHash !== undefined || statement.QueryHash !== undefined"
            class="content"
        >
            <ul class="stats">
                <li v-if="statement.QueryPlanHash !== undefined">
                    Query Plan Hash: <code>{{ statement.QueryPlanHash }}</code>
                </li>
                <li v-if="statement.QueryHash !== undefined">
                    Query Hash: <code>{{ statement.QueryHash }}</code>
                </li>
            </ul>
        </div>

        <div
            v-if="statement.StatementSetOptions !== undefined"
            class="content options"
        >
            <bool-pill :value="statement.StatementSetOptions.ANSI_NULLS">
                ANSI_NULLS
            </bool-pill>
            <bool-pill :value="statement.StatementSetOptions.ANSI_PADDING">
                ANSI_PADDING
            </bool-pill>
            <bool-pill :value="statement.StatementSetOptions.ANSI_WARNINGS">
                ANSI_WARNINGS
            </bool-pill>
            <bool-pill :value="statement.StatementSetOptions.ARITHABORT">
                ARITHABORT
            </bool-pill>
            <bool-pill :value="statement.StatementSetOptions.CONCAT_NULL_YIELDS_NULL">
                CONCAT_NULL_YIELDS_NULL
            </bool-pill>
            <bool-pill :value="statement.StatementSetOptions.NUMERIC_ROUNDABORT">
                NUMERIC_ROUNDABORT
            </bool-pill>
            <bool-pill :value="statement.StatementSetOptions.QUOTED_IDENTIFIER">
                QUOTED_IDENTIFIER
            </bool-pill>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { BaseStmtInfo } from 'showplan-js';
import BoolPill from '@/components/helpers/BoolPill.vue';

@Component({
    components: { BoolPill },
})
export default class StatementOverview extends Vue {
  @Prop() public statement!: BaseStmtInfo;
}
</script>

<style lang="scss" scoped>
</style>

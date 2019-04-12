<template>
    <div class="content">
        <table class="data">
            <thead>
                <tr><th>Column</th><th>Data Type</th><th>Runtime Value</th><th>Compiled Value</th></tr>
            </thead>
            <tbody>
                <tr
                    v-for="(param, index) in statement.QueryPlan.ParameterList"
                    :key="index"
                >
                    <td>{{ param.Column }} </td>
                    <td>{{ param.ParameterDataType }} </td>
                    <td>{{ param.ParameterRuntimeValue }}</td>
                    <td>{{ param.ParameterCompiledValue }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { BaseStmtInfo } from 'showplan-js';

@Component({
})
export default class QueryParameters extends Vue {
  @Prop() public statement!: BaseStmtInfo;
}
</script>

<style lang="scss" scoped>

</style>

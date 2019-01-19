<template>
  <div class="chart-wrapper">
    <svg ref="chart" width="100%" height="600px">

    </svg>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import * as ShowPlan from '@/parser/showplan';
import { Colors, GetOperationType, GetOperationColor } from '@/components/visualizations/VizColors';
import { ParentRelOp, ParentRelOpAction } from './FakeParent';
import { zoom } from 'd3-zoom';
import * as d3 from 'd3-selection';

@Component({
})
export default class DataFlow extends Vue {

  public $refs!: {
    chart: Element,
    chartG: Element,
  };

  private get queryPlan(): ShowPlan.QueryPlan {
    return this.statement!.QueryPlan!;
  }

  @Prop() public statement!: ShowPlan.StmtSimple;
  @Prop({ default: 500 }) public width!: number;
  @Prop({ default: undefined }) public selectedNode!: ShowPlan.RelOp | undefined;

  @Emit('rel-op-selected')
  public statementSelected(op: number) {
    //
  }

  @Emit('rel-op-highlighted')
  public statementHighlighted(op: number | undefined) {
    //
  }

  private get viewBox(): string {
    return `0 0 1 1`;
  }

  private handleZoom() {
    const svg = d3.select(this.$refs.chartG);
    svg.attr('transform', d3.event.transform);
  }
}
</script>

<style lang="scss" scoped>
  .data-flow-link {
    stroke-opacity: .4;
    fill:none;
  }
</style>

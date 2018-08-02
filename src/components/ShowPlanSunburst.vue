<template>
    <svg :width="width" :height="width">
    <g>
      <g :transform="'translate(' + width / 2 + ',' + width  /2 + ')'">
        <a xlink:href="#"  v-for="(line, index) in lines" v-bind:key="index" :title="line.operation.LogicalOp" v-on:mouseout="hover(null)" v-on:mouseover="hover(line.operation)" v-on:click="operationClicked(line.operation)">
          <path :d="line.path" v-bind:fill="colors[getOperationType(line.operation.LogicalOp)]" />
        </a>
      </g>
    </g>
  </svg>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';

import * as ShowPlan from '@/parser/showplan';
import { hierarchy, partition, HierarchyRectangularNode } from 'd3-hierarchy';
import { arc } from 'd3-shape';

@Component({
})
export default class ShowPlanSunburst extends Vue {
  @Prop() public queryPlan!: ShowPlan.QueryPlan;
  @Prop({ default: 500 }) public width!: number;

  private get radius(): number  {
    return this.width / 2;
  }

  private get lines(): ChartData[]  {
    return this.root().descendants()
      .map((i) => new ChartData(this.arc(i)!, i.data));
  }

  private arc = arc<HierarchyRectangularNode<ShowPlan.RelOp>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(this.radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  private colors: { [id: string]: string; } = {
    operation: '#5687d1',
    data: '#7b615c',
    join: '#de783b',
    language: '#6ab975',
    other: '#a173d1',
    end: '#0c0909',
  };

  @Emit('rel-op-selected')
  public statementSelected(op: ShowPlan.RelOp) {
    //
  }

  @Emit('rel-op-highlighted')
  public statementHighlighted(op: ShowPlan.RelOp | null) {
    //
  }

  private hover(op: ShowPlan.RelOp | null) {
    this.statementHighlighted(op);
  }

  private operationClicked(op: ShowPlan.RelOp) {
    this.statementSelected(op);
  }

  private getOperationType(logicalOp: string) {
    switch (logicalOp) {
      case 'Clustered Index Scan':
      case 'Clustered Index Seek':
      case 'Index Seek':
      case 'Index Scan':
      case 'Table Scan':
          return 'data';
      case 'Cross Join':
      case 'Inner Join':
      case 'Left Anti Semi Join':
      case 'Left Outer Join':
      case 'Left Semi Join':
      case 'Right Anti Semi Join':
      case 'Right Outer Join':
      case 'Right Semi Join':
      case 'Merge':
          return 'join';
      default:
          return 'operation';
    }
  }

  private root(): HierarchyRectangularNode<ShowPlan.RelOp> {
    const vm = this;
    const partitionFunc = partition<ShowPlan.RelOp>()
      .size([2 * Math.PI, this.radius]);

    const hierarchyNodes = hierarchy<ShowPlan.RelOp>(vm.queryPlan.RelOp, (d) => d.Action.RelOp)
      .sum((i) => i.EstimateCPU + i.EstimateIO);

    return partitionFunc(hierarchyNodes);
  }
}

class ChartData {
  public path: string;
  public operation: ShowPlan.RelOp;

  constructor(path: string, operation: ShowPlan.RelOp) {
    this.path = path;
    this.operation = operation;
  }
}
</script>

<style lang="scss">

</style>

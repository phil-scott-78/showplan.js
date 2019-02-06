<template>
  <div class="chart-wrapper">
    <svg ref="chart" width="100%" height="600px">
      <g transform="translate(400,25)">
      <g ref="chartG">
        <g class="connector-link" v-for="(link, index) in links" :key="'link' + index" :stroke="getStrokeColor(link)" fill="none" :stroke-width="getLineStrokeWidth(link)" stroke-linecap="round" >
          <path :d="linkPath(link)"></path>
        </g>
        <g v-for="(node, index) in nodes" :key="'node' + index" >
          <g :transform="nodeTransform(node)" @mouseover="hover(node)" @mouseout="hover(undefined)" @click="operationClicked(node)">
            <g>
              <g fill="var(--foreground)" text-anchor="middle">
                <rect class="background-rect" y="0" x="-90" :stroke="getNodeColor(node)" width="180" height="3.5em" rx="5" ry="5" :fill="getBackgroundRectFill(node)" :stroke-opacity="getBackgroundRectStrokeOpacity(node)"></rect>
                <g style="font-size:.7rem">
                  <text dy="1.5em" >
                    {{ (node.data.NodeId === -1) ? statement.StatementType : node.data.PhysicalOp }}
                  </text>
                  <text x="75" dy="1.5em" text-anchor="right" :style="node.data.EstimateTotalCost / statement.StatementSubTreeCost < .25 ? 'fill:var(--foreground)' : 'fill:var(--red)'" v-if="node.data.NodeId !== -1">
                    {{ node.data.EstimateTotalCost / statement.StatementSubTreeCost | filterPercent }}
                  </text>
                </g>
                <g style="font-size:.6rem" opacity=".5" >
                  <text v-if="node.data.NodeId !== -1 && node.data.SecondaryDesc != node.data.PhysicalOp"
                    dy="3em"
                  >
                    {{ node.data.SecondaryDesc }}
                  </text>
                  <text v-if="node.data.NodeId !== -1 &&  node.data.ThirdLevelDesc !== undefined"
                    dy="4em"
                  >
                    {{ node.data.ThirdLevelDesc }}
                  </text>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      </g>
    </svg>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import * as ShowPlan from '@/parser/showplan';
import { hierarchy, tree, cluster, HierarchyPointNode, HierarchyPointLink } from 'd3-hierarchy';
import { linkRadial, linkHorizontal, pointRadial, linkVertical } from 'd3-shape';
import { scalePow, scaleLog, scaleLinear } from 'd3-scale';
import { min, max } from 'd3-array';
import { Colors, GetOperationType, GetOperationColor } from '@/components/visualizations/VizColors';
import { ParentRelOp, ParentRelOpAction } from './FakeParent';
import { zoom } from 'd3-zoom';
import * as d3 from 'd3-selection';

@Component({
})
export default class OperatorFlow extends Vue {

  public $refs!: {
    chart: Element,
    chartG: Element,
  };

  private get queryPlan(): ShowPlan.QueryPlan {
    return this.statement!.QueryPlan!;
  }

  private get highlightedNode(): HierarchyPointNode<ShowPlan.RelOp> | undefined {
    if (this.selectedNode === undefined) {
      return undefined;
    }

    return this.root.descendants().filter((i) => i.data.NodeId === this.selectedNode!.NodeId)[0];
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
    return `0 -25 ${this.width / 2} ${this.width}`;
  }

  private get radius(): number  {
    return this.width / 2;
  }

  private get root(): HierarchyPointNode<ShowPlan.RelOp> {
    const noop: ShowPlan.RelOp = new ParentRelOp();
    noop.Action.RelOp[0] = this.queryPlan.RelOp;
    noop.NodeId = -1;

    return tree<ShowPlan.RelOp>()
      .size([this.radius, this.radius])
      .nodeSize([this.radius * .6, 110])
      .separation((a, b) => 1.1)
      (hierarchy(noop, (children) => children.Action.RelOp));
  }

  private getNodeColor(node: HierarchyPointNode<ShowPlan.RelOp>): string {
    return GetOperationColor(node.data.PhysicalOp);
  }

  private getLineStrokeOpacity(link: HierarchyPointLink<ShowPlan.RelOp>): number {
    const node = link.target;
    return 1;
  }

  private getLineStrokeWidth(link: HierarchyPointLink<ShowPlan.RelOp>) {
    return this.rowWidthScale(link.target.data.EstimateTotalCost);
  }

  private getStrokeColor(link: HierarchyPointLink<ShowPlan.RelOp>): string {
    const notSelectedColor = 'var(--alt-border)';

    if (this.highlightedNode === undefined) {
      return notSelectedColor;
    }

    const selectedColor = GetOperationColor(link.target.data.PhysicalOp);

    for (const childNode of this.highlightedNode.descendants()) {
      if (link.target.data.NodeId === childNode.data.NodeId) {
        return selectedColor;
      }
    }

    for (const childNode of this.highlightedNode.ancestors()) {
      if (link.target.data.NodeId === childNode.data.NodeId) {
        return selectedColor;
      }
    }

    return notSelectedColor;
  }

  private getBackgroundRectStrokeOpacity(node: HierarchyPointNode<ShowPlan.RelOp>) {
    if (this.highlightedNode === undefined) {
      return .2;
    }

    if (node.data.NodeId === this.highlightedNode.data.NodeId) {
      return 1;
    }

    for (const childNode of this.highlightedNode.descendants()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return .4;
      }
    }

    for (const childNode of this.highlightedNode.ancestors()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return 1;
      }
    }

    return .2
  }

  private getBackgroundRectFill(node: HierarchyPointNode<ShowPlan.RelOp>) {
    if (this.highlightedNode === undefined) {
      return 'var(--background)';
    }

    if (node.data.NodeId === this.highlightedNode!.data.NodeId) {
      return 'var(--alt-background)';
    }

    return 'var(--background)';
  }

  private getNodeSize(node: HierarchyPointNode<ShowPlan.RelOp>) {
    if (node.data.NodeId === -1) {
      return 10;
    }

    return this.costCircleScale(node.data.EstimateTotalCost);
  }

  private get costCircleScale() {
    return scaleLinear()
      .domain([0, this.queryPlan.RelOp.EstimatedTotalSubtreeCost])
      .rangeRound([2, 20]);
  }

  private get rowWidthScale() {
    const minRows = min(this.nodes, (n) => n.data.EstimateRows)!;
    const maxRows = max(this.nodes, (n) => n.data.EstimateRows)!;

    return scaleLinear()
      .domain([minRows, maxRows])
      .rangeRound([1, 20]);
  }

  private get links(): Array<HierarchyPointLink<ShowPlan.RelOp>> {
    return this.root.links();
  }

  private get nodes(): Array<HierarchyPointNode<ShowPlan.RelOp>> {
    return this.root.descendants().reverse();
  }

  private nodeTransform(node: HierarchyPointNode<ShowPlan.RelOp>) {
    return `translate(${node.x}, ${node.y})`;
  }

  private linkPath(link: HierarchyPointLink<ShowPlan.RelOp>): string {
    return linkVertical()(
      {
        source: [link.source.x, link.source.y + 40],
        target: [link.target.x, link.target.y]
      })!;

  }

  private mounted() {
    const vm = this;
    const svg = d3.select(this.$refs.chart);
    svg.call(
        zoom()
          .scaleExtent([.5, 10])
          .on('zoom', function() { vm.handleZoom(); }));
  }

  private handleZoom() {
    const svg = d3.select(this.$refs.chartG);
    svg.attr('transform', d3.event.transform);
  }

  private hover(op: HierarchyPointNode<ShowPlan.RelOp> | undefined) {
    if (op === undefined) {
      this.statementHighlighted(undefined);
      return;
    }

    if (op.data.NodeId === -1) {
      return;
    }

    this.statementHighlighted(op!.data.NodeId);
  }

  private operationClicked(op: HierarchyPointNode<ShowPlan.RelOp>) {
    if (op !== undefined && op.data.NodeId === -1) {
      return;
    }

    this.statementSelected(op.data.NodeId);
  }
}
</script>

<style lang="scss" scoped>
  .chart-wrapper .connector-link {
    transition:  stroke .5s ease;
  }

  .chart-wrapper .background-rect {
    transition: stroke-opacity .5s ease, background-color .5s ease;
  }
</style>

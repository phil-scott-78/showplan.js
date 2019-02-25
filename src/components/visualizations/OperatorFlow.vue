<template>
  <div class="wrapper">
    <div class="zoom-buttons">
      <button v-on:click="scale -= .1"><font-awesome-icon :icon="['fa', 'search-minus']" /></button>
      <button v-on:click="scale += .1"><font-awesome-icon :icon="['fa', 'search-plus']" /></button>
    </div>
    <div ref="chartWrapper" class="chart-wrapper">
      <svg ref="chart" :style="chartStyle" >
        <g ref="chartG" :transform="chartTransform">
          <g class="connector-link" v-for="(link, index) in links" :key="'link' + index" :stroke="getStrokeColor(link)" fill="none" :stroke-width="getLineStrokeWidth(link)" stroke-linecap="round" >
            <path :d="linkPath(link)"></path>
          </g>
          <g v-for="(node, index) in nodes" :key="'node' + index" >
            <g :transform="nodeTransform(node)" @mouseover="hover(node)" @mouseout="hover(undefined)" @click="operationClicked(node)">
              <g>
                <g fill="var(--foreground)" text-anchor="middle">
                  <rect class="background-rect" y="0" :x="-1 * nodeWidth / 2" :stroke="getNodeColor(node)" :width="nodeWidth" :height="nodeHeight" rx="5" ry="5" :fill="getBackgroundRectFill(node)" :fill-opacity="getBackgroundRectFillOpacity(node)" :stroke-opacity="getBackgroundRectStrokeOpacity(node)"></rect>
                  <g style="font-size:.7rem">
                    <text v-if="node.data.NodeId === -1" dy="1.6em" style="font-weight:500;font-size:1.2rem">
                      {{ statement.StatementType }}
                    </text>
                    <g v-else>
                      <text dy="1.5em" >
                        {{ (node.data.NodeId === -1) ? statement.StatementType : node.data.PhysicalOp }}
                      </text>
                      <text x="75" dy="1.5em" text-anchor="right" :style="node.data.EstimateTotalCost / statement.StatementSubTreeCost < .25 ? 'fill:var(--foreground)' : 'fill:var(--red)'" v-if="node.data.NodeId !== -1">
                        {{ node.data.EstimateTotalCost / statement.StatementSubTreeCost | filterPercent }}
                      </text>
                    </g>
                  </g>
                  <g v-if="node.data.NodeId !== -1" style="font-size:.6rem" opacity=".5" >
                    <text v-if=" node.data.SecondaryDesc != node.data.PhysicalOp"
                      dy="3em"
                    >
                      {{ node.data.SecondaryDesc | maxLength}}
                    </text>
                    <text v-if="node.data.ThirdLevelDesc !== undefined"
                      dy="4em"
                    >
                      {{ node.data.ThirdLevelDesc | maxLength }}
                    </text>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
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
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import * as d3 from 'd3-selection';

@Component({
})
export default class OperatorFlow extends Vue {

  public $refs!: {
    chart: Element,
    chartG: Element,
    chartWrapper: Element,
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
  @Prop({ default: undefined }) public selectedNode!: ShowPlan.RelOp | undefined;

  private nodeWidth: number = 180;
  private nodeHeight: number = 50;
  private scale = 1;

  @Emit('rel-op-selected')
  public statementSelected(op: number) {
    //
  }

  @Emit('rel-op-highlighted')
  public statementHighlighted(op: number | undefined) {
    //
  }

  private get root(): HierarchyPointNode<ShowPlan.RelOp> {
    const noop: ShowPlan.RelOp = new ParentRelOp();
    noop.Action.RelOp[0] = this.queryPlan.RelOp;
    noop.NodeId = -1;

    return tree<ShowPlan.RelOp>()
      .nodeSize([this.nodeWidth, this.nodeHeight * 2])
      .separation((a, b) => 1.25)
      (hierarchy(noop, (children) => children.Action.RelOp));
  }

  @Watch('root')
  private rootWatch() {
    this.updateScrollPos();
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

    return .2;
  }

  private getBackgroundRectFill(node: HierarchyPointNode<ShowPlan.RelOp>) {
    if (this.highlightedNode === undefined) {
      return 'var(--background)';
    }

    if (node.data.NodeId === -1) {
      return 'var(--grey)';
    }

    if (node.data.NodeId === this.highlightedNode!.data.NodeId) {
      return GetOperationColor(node.data.PhysicalOp);
    }

    return 'var(--background)';
  }

  private getBackgroundRectFillOpacity(node: HierarchyPointNode<ShowPlan.RelOp>): number {
    if (node.data.NodeId === -1) {
      return 1;
    }

    if (this.highlightedNode === undefined) {
      return 1;
    }

    if (node.data.NodeId === this.highlightedNode!.data.NodeId) {
      return .3;
    }

    return 1;
  }

  private getNodeSize(node: HierarchyPointNode<ShowPlan.RelOp>) {
    if (node.data.NodeId === -1) {
      return 10;
    }

    return this.costCircleScale(node.data.EstimateTotalCost);
  }

  private get chartWidth(): number {
    const minX = min(this.nodes, (d) => d.x)!;
    const maxX = max(this.nodes, (d) => d.x)!;

    return maxX - minX + this.nodeWidth * 2;
  }

  private get chartHeight(): number {
    const minY = min(this.nodes, (d) => d.y)!;
    const maxY = max(this.nodes, (d) => d.y)!;

    return maxY - minY + this.nodeHeight * 2;
  }

  private get chartStyle() {
    return {
      'min-height': this.chartHeight * this.scale,
      'min-width': this.chartWidth * this.scale,
      'width': '100%',
      'height': '100%',
    };
  }

  private get rootRectOffsetX(): number {
    const x = min(this.nodes, (d) => d.x)! * -1 + this.nodeWidth;
    return x;
  }

  private get chartTransform() {
    return `translate(${this.rootRectOffsetX * this.scale}, ${this.nodeHeight * .5}) scale(${this.scale})`;
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

  private mounted() {
    this.updateScrollPos();
  }

  private updateScrollPos() {
    Vue.nextTick().then(() => {
      this.$refs.chartWrapper.scrollLeft = this.rootRectOffsetX - this.nodeWidth * 2;
    });
  }

  private nodeTransform(node: HierarchyPointNode<ShowPlan.RelOp>) {
    return `translate(${node.x}, ${node.y})`;
  }

  private linkPath(link: HierarchyPointLink<ShowPlan.RelOp>): string {
    return linkVertical()(
      {
        source: [link.source.x, link.source.y + this.nodeHeight],
        target: [link.target.x, link.target.y],
      })!;
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
  .chart-wrapper {
    overflow: scroll;
    width: 100%;
    height: 600px;

    .connector-link {
      transition:  stroke .3s ease;
    }
    .background-rect {
      transition: stroke-opacity .3s ease, background-color .3s ease;
    }
  }

  .wrapper {
    position: relative;


    .zoom-buttons {
      z-index: 1000;

      position: absolute;
      top: 25px;
      left: 25px;

      button {
        background-color: inherit;
        border: 1px solid var(--border);
        color: var(--foreground);
        padding: .5rem;
        font-size:1rem;
        cursor: pointer;

        &:first-child {
          border-top-left-radius: 15px;
          border-bottom-left-radius: 15px;
        }

        &:last-child {
          border-top-right-radius: 15px;
          border-bottom-right-radius: 15px;
        }

        &:hover{
          background-color: var(--alt-background);
        }
      }
    }
  }

</style>

<template>
  <div class="wrapper">
    <div class="zoom-buttons">
      <zoom-buttons @zoom-in="zoom(.1)" @zoom-out="zoom(-.1)"></zoom-buttons>
    </div>
    <div v-dragscroll ref="chartWrapper" class="chart-wrapper" >
      <svg ref="chart" class="chart" :style="chartStyle">
        <g ref="chartG" :transform="chartTransform">
          <g class="connector-link" v-for="(link, index) in links" :key="'link' + index" :stroke="getStrokeColor(link)" fill="none" :stroke-width="getLineStrokeWidth(link)" stroke-linecap="round" >
            <path :d="linkPath(link)"></path>
          </g>
          <g v-for="(node, index) in nodes" :key="'node' + index" >
            <g :transform="nodeTransform(node)" @mouseover="hover(node)" @mouseout="hover(undefined)" @click="operationClicked(node)">
              <g>
                <g fill="var(--foreground)" text-anchor="middle" >
                  <rect class="background-rect" y="1.6em" :x="-1 * nodeWidth / 2" :width="nodeWidth" :height="nodeHeight" rx="5" ry="5" stroke="var(--alt-border)"  fill="var(--alt-background)" :opacity="getBackgroundRectOpacity(node)"></rect>
                  <text dy="3em" style="font-size:.7rem">
                    {{ (node.data.NodeId === -1) ? statement.StatementType : node.data.PhysicalOp }}
                  </text>
                  <g style="font-size:.6rem" opacity=".5" >
                    <text v-if="node.data.NodeId !== -1 && node.data.SecondaryDesc != node.data.PhysicalOp" dy="5em">
                      {{ node.data.SecondaryDesc | maxLength }}
                    </text>
                    <text v-if="node.data.NodeId !== -1 &&  node.data.ThirdLevelDesc !== undefined" dy="6em">
                      {{ node.data.ThirdLevelDesc | maxLength }}
                    </text>
                  </g>
                </g>
              </g>
              <circle :r="getNodeSize(node)" :fill="getNodeColor(node)" ></circle>
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
import ZoomButtons from './ZoomButtons.vue';
import { hierarchy, cluster, HierarchyPointNode, HierarchyPointLink } from 'd3-hierarchy';
import { linkRadial, linkHorizontal, pointRadial, linkVertical } from 'd3-shape';
import { scalePow, scaleLog, scaleLinear } from 'd3-scale';
import { min, max } from 'd3-array';
import * as TWEEN from '@tweenjs/tween.js';
import { Colors, GetOperationType, GetOperationColor, GetStateValue, GetStateValueOptions  } from '@/components/visualizations/VizColors';
import { ParentRelOp, ParentRelOpAction } from './FakeParent';

@Component({
    components: { ZoomButtons },
})
export default class DataFlow extends Vue {

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

  private nodeWidth: number = 140;
  private nodeHeight: number = 50;
  private scale = 1;
  private tweenedTransform = { scale: 1 };

  @Watch('scale')
  private scaleWatch(newValue:number, oldValue: number) {
    let frameHandler: any;


    function animate (currentTime: any) {
      if (TWEEN.update(currentTime)) {
        frameHandler =requestAnimationFrame(animate);
      }
    };

    const tween = new TWEEN.Tween(this.tweenedTransform)
      .to({ scale: newValue }, 75)
      .onComplete(() => {
        cancelAnimationFrame(frameHandler)
      })
      .start();

    frameHandler = requestAnimationFrame(animate);
  }

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

    return cluster<ShowPlan.RelOp>()
      .nodeSize([this.nodeHeight * 3, this.nodeWidth])
      .separation((a, b) => 1)
      (hierarchy(noop, (children) => children.Action.RelOp));
  }

  private get links(): Array<HierarchyPointLink<ShowPlan.RelOp>> {
    return this.root.links();
  }

  private get nodes(): Array<HierarchyPointNode<ShowPlan.RelOp>> {
    return this.root.descendants().reverse();
  }

  // svg elements
  private nodeTransform(node: HierarchyPointNode<ShowPlan.RelOp>) {
    return `translate(${-1 * node.y}, ${node.x})`;
  }

  private linkPath(link: HierarchyPointLink<ShowPlan.RelOp>): string {
    return linkHorizontal<HierarchyPointLink<ShowPlan.RelOp>, HierarchyPointNode<ShowPlan.RelOp>>()
      .x((i) => -1 * i.y)
      .y((i) => i.x)
      (link)!;
  }

  // node styling
  private getNodeColor(node: HierarchyPointNode<ShowPlan.RelOp>): string {
    return GetOperationColor(node.data.PhysicalOp);
  }

  private getLineStrokeWidth(link: HierarchyPointLink<ShowPlan.RelOp>): number {
    return this.rowWidthScale(link.target.data.EstimateRows);
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

  private getBackgroundRectOpacity(node: HierarchyPointNode<ShowPlan.RelOp>) {
    if (this.highlightedNode === undefined) {
      return 0;
    }

    if (node.data.NodeId === this.highlightedNode!.data.NodeId) {
      return .9;
    }

    return 0;
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
      .domain([1, maxRows])
      .rangeRound([1, 20]);
  }

  private GetOperationColor(op: ShowPlan.PhysicalOp) {
    return GetOperationColor(op);
  }

  // chart sizing and styling
  private get chartWidth(): number {
    const minX = min(this.nodes, (d) => d.y)!;
    const maxX = max(this.nodes, (d) => d.y)!;

    return maxX - minX + this.nodeWidth * 2;
  }

  private get chartHeight(): number {
    // invers the x and y
    const minY = min(this.nodes, (d) => d.x)!;
    const maxY = max(this.nodes, (d) => d.x)!;

    return maxY - minY + this.nodeHeight * 4;
  }

  private get chartStyle() {
    return {
      'min-height': this.chartHeight * this.tweenedTransform.scale,
      'min-width': this.chartWidth * this.tweenedTransform.scale,
      'width': '100%',
      'height': '100%',
    };
  }

  private get chartTransform() {
    // don't forget we are turning their x/y axis on the side
    const offsetY = min(this.nodes, (n) => n.x)! * -1 + this.nodeHeight;
    const offsetX = max(this.nodes, (n) => n.y)! + this.nodeWidth / 2;
    return `translate(${offsetX * this.tweenedTransform.scale}, ${offsetY * this.tweenedTransform.scale}) scale(${this.tweenedTransform.scale})`;
  }

  // events
  private zoom(amount: number) {
    this.scale = Math.min(Math.max(this.tweenedTransform.scale + amount, .25), 2);
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

    .chart {
      margin-top: 2rem;
    }

    .connector-link {
      transition:  stroke .3s ease;
    }

    .background-rect {
      transition:  opacity .3s ease;
    }
  }

  .wrapper {
    position: relative;

    .zoom-buttons {
      z-index: 1000;

      position: absolute;
      top: 0;
      left: 0;
    }
  }
</style>

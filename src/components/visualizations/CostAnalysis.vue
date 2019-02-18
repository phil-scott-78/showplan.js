<template>
  <div class="chart-wrapper">
    <svg :width="width" :height="width" :viewBox="viewBox">
      <g>
        <g>
          <g class="slice" v-for="(line, index) in lines" :key="index" :title="line.data.LogicalOp" v-on:mouseout="hover(undefined)" v-on:mouseover="hover(line)" v-on:click="operationClicked(line)">
            <path :d="arc(line)" class="main-arc" :stroke="getStroke(line)" :stroke-opacity="getStrokeOpacity(line)" :fill-opacity="getOpacity(line)" :fill="getFill(line)"></path>
            <path :d="middleArc(line)" class="hidden-arc" :id="'hiddenTextArc' + index + statement.QueryHash"></path>
            <polygon v-if="line.data.Warnings !== undefined" :transform="getIconLocation(line)"  fill="var(--orange)" stroke="var(--alt-background)" points="0,-5 -5,5 5,5"></polygon>
            <text v-if="line.data.NodeId == -1" text-anchor="middle" fill="var(--foreground)" alignment-baseline="middle" style="font-weight:normal;font-size:1.5rem">{{ statement.StatementType }}</text>
            <text v-else-if="textFits(line)" class="operationName" dominant-baseline="middle" :fill="getLabelColor(line)" :style="{ fontSize: (y(line.y1) - y(line.y0)) / 2 + 'px' }" >
              <textPath startOffset="50%" :href="'#hiddenTextArc' + index + statement.QueryHash">
                {{ line.data.LogicalOp }}
              </textPath>
            </text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>


<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';

import * as ShowPlan from '@/parser/showplan';
import { hierarchy, partition, HierarchyRectangularNode } from 'd3-hierarchy';
import { arc } from 'd3-shape';
import { path } from 'd3-path';
import { scaleLinear, scaleSqrt, scaleLog, scalePow } from 'd3-scale';
import { normalize } from 'path';
import { ParentRelOp } from '@/components/visualizations/FakeParent';
import { GetOperationColor } from '@/components/visualizations/VizColors';

@Component({
})
export default class CostAnalysis extends Vue {

  private get queryPlan(): ShowPlan.QueryPlan {
    return this.statement!.QueryPlan!;
  }

  private get highlightedNode(): HierarchyRectangularNode<ShowPlan.RelOp> | undefined {
    if (this.selectedNode === undefined) {
      return undefined;
    }

    return this.root().descendants().filter((i) => i.data.NodeId === this.selectedNode!.NodeId)[0];
  }

  private get viewBox(): string {
    return `${-this.width / 2} ${-this.width / 2} ${this.width} ${this.width}`;
  }

  private get radius(): number  {
    return this.width / 2;
  }

  private get lines(): Array<HierarchyRectangularNode<ShowPlan.RelOp>> {
    return this.root().descendants();
  }
  @Prop() public statement!: ShowPlan.StmtSimple;
  @Prop({ default: 500 }) public width!: number;
  @Prop({ default: undefined }) public selectedNode!: ShowPlan.RelOp | undefined;

  private x = scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

  private y = scaleSqrt()
    .range([0, this.radius]);

  private arc = arc<HierarchyRectangularNode<ShowPlan.RelOp>>()
    .startAngle((d) => this.x(d.x0))
    .endAngle((d) => this.x(d.x1))
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(this.radius / 2)
    .innerRadius((d) => Math.max(0, this.y(d.y0)))
    .outerRadius((d) => Math.max(0, this.y(d.y1) - 1));

  @Emit('rel-op-selected')
  public statementSelected(op: number) {
    //
  }

  @Emit('rel-op-highlighted')
  public statementHighlighted(op: number | undefined) {
    //
  }

  private textFits = (d: HierarchyRectangularNode<ShowPlan.RelOp>) => {
    if ((this.y(d.y1) - this.y(d.y0)) / 2 < 6) {
      return false;
    }

    const CHAR_SPACE = 7;

    const deltaAngle = this.x(d.x1) - this.x(d.x0);
    const r = Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    return d.data.LogicalOp.length * CHAR_SPACE < perimeter;
  }

  private middleArc = (d: HierarchyRectangularNode<ShowPlan.RelOp>) => {
    const halfPi = Math.PI / 2;
    const angles = [this.x(d.x0) - halfPi, this.x(d.x1) - halfPi];
    const r = Math.max(0, (this.y(d.y0) + this.y(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) { angles.reverse(); }

    const pathBuilder = path();
    pathBuilder.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return pathBuilder.toString();
  }

  private getOpacity(node: HierarchyRectangularNode<ShowPlan.RelOp>): number {
    if (this.highlightedNode === undefined) {
      return .5;
    }

    if (this.highlightedNode.data.NodeId === node.data.NodeId) {
      return .8;
    }

    for (const childNode of this.highlightedNode.descendants()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return .5;
      }
    }

    for (const childNode of this.highlightedNode.ancestors()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return .25;
      }
    }

    return .1;
  }

  private getStroke(node: HierarchyRectangularNode<ShowPlan.RelOp>): string {
    if (this.highlightedNode === undefined) {
      return 'var(--background)'; // this.colors[this.getOperationType(node.data.PhysicalOp)];
    }

    for (const childNode of this.highlightedNode.descendants()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return 'var(--background)';
      }
    }

    for (const childNode of this.highlightedNode.ancestors()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return 'var(--background)';
      }
    }

    return GetOperationColor(node.data.PhysicalOp);
  }

  private getStrokeOpacity(node: HierarchyRectangularNode<ShowPlan.RelOp>): number {
    if (this.highlightedNode === undefined) {
      return 1; // this.colors[this.getOperationType(node.data.PhysicalOp)];
    }

    for (const childNode of this.highlightedNode.descendants()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return 1;
      }
    }

    for (const childNode of this.highlightedNode.ancestors()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return 11;
      }
    }

    return .5;
  }

  private getLabelColor(node: HierarchyRectangularNode<ShowPlan.RelOp>): string {
    const whiteLabel = 'var(--foreground)';

    if (this.highlightedNode === undefined) {
      return whiteLabel;
    }

    for (const childNode of this.highlightedNode.descendants()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return whiteLabel;
      }
    }

    for (const childNode of this.highlightedNode.ancestors()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return whiteLabel;
      }
    }

    return GetOperationColor(node.data.PhysicalOp);
  }

  private getFill(node: HierarchyRectangularNode<ShowPlan.RelOp>): string {
    return GetOperationColor(node.data.PhysicalOp);
  }

  private getIconLocation(node: HierarchyRectangularNode<ShowPlan.RelOp>): string {
    const centroid = this.arc.centroid(node);
    const angle = (node.x0 + node.x1) / Math.PI * 90;
    return `translate(${centroid[0]}, ${centroid[1]}) rotate(${angle})`;
  }

  private hover(op: HierarchyRectangularNode<ShowPlan.RelOp> | undefined) {
    if (op === undefined) {
      this.statementHighlighted(undefined);
      return;
    }

    if (op.data.NodeId === -1) {
      return;
    }

    this.statementHighlighted(op!.data.NodeId);
  }

  private operationClicked(op: HierarchyRectangularNode<ShowPlan.RelOp>) {
    if (op !== undefined && op.data.NodeId === -1) {
      return;
    }

    this.statementSelected(op.data.NodeId);
  }

  private root(): HierarchyRectangularNode<ShowPlan.RelOp> {
    const vm = this;
    const partitionFunc = partition<ShowPlan.RelOp>();


    // fudge a minimum size so that everything at least shows up as a sliver
    const minSize = this.queryPlan!.RelOp.EstimatedTotalSubtreeCost / 180;

    const noop: ShowPlan.RelOp = new ParentRelOp();
    noop.Action.RelOp[0] = vm.queryPlan.RelOp;
    noop.NodeId = -1;

    const hierarchyNodes = hierarchy<ShowPlan.RelOp>(noop, (d) => d.Action.RelOp)
      .sum((i) => {
        if (i.Action.RelOp.length) {
          return i.EstimateTotalCost;
        }

        // if we don't have any child nodes let's get a minimum size to at least
        // make sure the end nodes are visible
        return Math.max(i.EstimateTotalCost, minSize);
      });

    return partitionFunc(hierarchyNodes);
  }
}

</script>

<style lang="scss">
  svg {
    filter: drop-shadow(2px 2px 2px rgba(34,36,38,.15));

    path {
      cursor: pointer;

      &.hidden-arc {
        fill:none;
      }

      &.main-arc {
        transition:  fill-opacity .5s ease, stroke .5s ease;
      }
    }

    text.operationName {
      text-anchor: middle;
      text-shadow: rgba(0,0,0,.1) 1px 1px 1px;
      font-weight: 100;
    }
  }

</style>

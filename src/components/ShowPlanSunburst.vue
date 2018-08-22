<template>
    <svg :width="width" :height="width">
    <g>
      <g :transform="'translate(' + width / 2 + ',' + width  /2 + ')'">
        <a v-for="(line, index) in lines" v-bind:key="index" :title="line.data.LogicalOp" v-on:mouseout="hover(null)" v-on:mouseover="hover(line)" v-on:click="operationClicked(line)">
          <path :d="arc(line)" :stroke="getStroke(line)" :opacity="getOpacity(line)" v-bind:fill="colors[getOperationType(line.data.LogicalOp)]" />
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
import { normalize } from 'path';

@Component({
})
export default class ShowPlanSunburst extends Vue {
  @Prop() public queryPlan!: ShowPlan.QueryPlan;
  @Prop({ default: 500 }) public width!: number;
  @Prop({ default: null }) public selectedNode!: ShowPlan.RelOp | null;

  private get highlightedNode(): HierarchyRectangularNode<ShowPlan.RelOp> | null {
    if (this.selectedNode == null) {
      return null;
    }

    return this.root().descendants().filter((i) => i.data.NodeId === this.selectedNode!.NodeId)[0];
  }

  private get radius(): number  {
    return this.width / 2;
  }

  private get lines(): Array<HierarchyRectangularNode<ShowPlan.RelOp>> {
    return this.root().descendants();
  }

  private arc = arc<HierarchyRectangularNode<ShowPlan.RelOp>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(this.radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  private colors: { [id: string]: string; } = {
    operation: 'var(--green)',
    data: 'var(--red)',
    join: 'var(--blue)',
    language: 'var(--orange)',
    other: 'var(--purple)',
    end: 'var(--grey)',
    generic: 'var(--grey)',
    root: 'var(--background)',
  };

  @Emit('rel-op-selected')
  public statementSelected(op: ShowPlan.RelOp) {
    //
  }

  @Emit('rel-op-highlighted')
  public statementHighlighted(op: ShowPlan.RelOp | null) {
    //
  }

  private getOpacity(node: HierarchyRectangularNode<ShowPlan.RelOp>): number {
    if (this.highlightedNode == null) {
      return 1;
    }

    for (const childNode of this.highlightedNode.descendants()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return 1;
      }
    }

/*
    for (const parentNodes of this.highlightedNode.ancestors()) {
      if (node.data.NodeId === parentNodes.data.NodeId) {
        return .9;
      }
    }
*/

    return .7;
  }

  private getStroke(node: HierarchyRectangularNode<ShowPlan.RelOp>): string {
    return 'var(--background)';
  }

  private hover(op: HierarchyRectangularNode<ShowPlan.RelOp> | null) {
    if (op == null) {
      this.statementHighlighted(null);
      return;
    }

    if (op.data.NodeId === -1) {
      return;
    }

    this.statementHighlighted(op!.data);
  }

  private operationClicked(op: HierarchyRectangularNode<ShowPlan.RelOp>) {
    if (op != null && op.data.NodeId === -1) {
      return;
    }

    this.statementSelected(op.data);
  }

  private getOperationType(logicalOp: string) {
    switch (logicalOp) {
      case 'Generic':
        return 'generic';
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
      case 'Root':
        return 'root';
      case 'Repartition Streams':
      case 'Gather Streams':
      case 'Distribute Streams':
        return 'other';
      default:
          return 'operation';
    }
  }

  private root(): HierarchyRectangularNode<ShowPlan.RelOp> {
    const vm = this;
    const partitionFunc = partition<ShowPlan.RelOp>()
      .size([2 * Math.PI, this.radius]);


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

class ParentRelOp extends ShowPlan.RelOp {
  constructor() {
    super(new ParentRelOpAction(), 0, 0, 0, 0, 0, 0, 0, 'Root', 0, false, 'Root', []);
    this.NodeId = -1;
  }
}

class ParentRelOpAction extends ShowPlan.RelOpAction {
}
</script>

<style lang="scss">
  svg {
    filter: drop-shadow(2px 2px 2px rgba(34,36,38,.15));
  }

  svg path {
    transition: opacity .15s ease;
  }
</style>

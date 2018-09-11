<template>
  <div class="chart-wrapper">
    <svg :width="width" :height="width">
      <g>
        <g :transform="'translate(' + width / 2 + ',' + width  /2 + ')'">
          <g v-for="(line, index) in lines" v-bind:key="index" :title="line.data.LogicalOp" v-on:mouseout="hover(undefined)" v-on:mouseover="hover(line)" v-on:click="operationClicked(line)">
            <path :d="arc(line)" :stroke="getStroke(line)" :fill-opacity="getOpacity(line)" :fill="getFill(line)"></path>
            <polygon v-if="line.data.Warnings !== undefined" :transform="getIconLocation(line)"  fill="var(--orange)" stroke="var(--alt-background)" points="0,-5 -5,5 5,5"></polygon>
            <text v-if="line.data.NodeId == -1" text-anchor="middle" fill="var(--foreground)" alignment-baseline="middle" style="font-weight:normal;font-size:1.5rem">{{ statement.StatementType }}</text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';

import * as ShowPlan from '../parser/showplan';
import { hierarchy, partition, HierarchyRectangularNode } from 'd3-hierarchy';
import { arc } from 'd3-shape';
import { normalize } from 'path';

@Component({
})
export default class ShowPlanSunburst extends Vue {
  @Prop() public statement!: ShowPlan.StmtSimple;
  @Prop({ default: 500 }) public width!: number;
  @Prop({ default: undefined }) public selectedNode!: ShowPlan.RelOp | undefined;

  private get queryPlan(): ShowPlan.QueryPlan {
    return this.statement!.QueryPlan!;
  }

  private get highlightedNode(): HierarchyRectangularNode<ShowPlan.RelOp> | undefined {
    if (this.selectedNode === undefined) {
      return undefined;
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
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1);

  private colors: { [id: string]: string; } = {
    'performance': 'var(--green)',
    'reading-data': 'var(--blue)',
    'combining-data': 'var(--orange)',
    'modifying-data': 'var(--red)',
    'manipulating-data': 'var(--purple)',
    'grouping-data': 'var(--light-blue)',
    'remote': 'var(--brown)',
    'operation': 'var(--grey)',
    'root': 'var(--alt-background)',
  };

  @Emit('rel-op-selected')
  public statementSelected(op: ShowPlan.RelOp) {
    //
  }

  @Emit('rel-op-highlighted')
  public statementHighlighted(op: ShowPlan.RelOp | undefined) {
    //
  }

  private getOpacity(node: HierarchyRectangularNode<ShowPlan.RelOp>): number {
    if (this.highlightedNode === undefined) {
      return .9;
    }

    for (const childNode of this.highlightedNode.descendants()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return 1;
      }
    }

    for (const childNode of this.highlightedNode.ancestors()) {
      if (node.data.NodeId === childNode.data.NodeId) {
        return .6;
      }
    }

    return .05;
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

    return this.colors[this.getOperationType(node.data.PhysicalOp)];

  }

  private getFill(node: HierarchyRectangularNode<ShowPlan.RelOp>): string {
    return this.colors[this.getOperationType(node.data.PhysicalOp)];
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

    this.statementHighlighted(op!.data);
  }

  private operationClicked(op: HierarchyRectangularNode<ShowPlan.RelOp>) {
    if (op !== undefined && op.data.NodeId === -1) {
      return;
    }

    this.statementSelected(op.data);
  }

  private getOperationType(physicalOp: ShowPlan.PhysicalOp): operationType {
    switch (physicalOp) {
      case 'Constant Scan':
      case 'Clustered Index Scan':
      case 'Clustered Index Seek':
      case 'Index Seek':
      case 'Index Scan':
      case 'Table Scan':
      case 'RID Lookup':
      case 'Key Lookup':
      case 'Columnstore Index Scan':
      case 'Log Row Scan':
      case 'Deleted Scan':
      case 'Inserted Scan':
        return 'reading-data';
      case 'Nested Loops':
      case 'Merge Join':
      case 'Hash Match':
      case 'Adaptive Join':
      case 'Sequence':
      case 'Concatenation':
      case 'Switch':
        return 'combining-data';
      case 'Sort':
      case 'Stream Aggregate':
      case 'Window Aggregate':
      case 'Segment':
        return 'grouping-data';
      case 'Compute Scalar':
      case 'Filter':
      case 'Top':
      case 'Sequence Project':
        return 'manipulating-data';
      case 'Table Spool':
      case 'Row Count Spool':
      case 'Index Spool':
      case 'Window Spool':
      case 'Bitmap':
      case 'Parallelism':
      case 'Parameter Table Scan':
        return 'performance';
      case 'Table Delete':
      case 'Table Insert':
      case 'Table Merge':
      case 'Table Update':
      case 'Index Delete':
      case 'Index Insert':
      case 'Index Update':
      case 'Columnstore Index Delete':
      case 'Columnstore Index Insert':
      case 'Columnstore Index Merge':
      case 'Columnstore Index Update':
      case 'Clustered Index Delete':
      case 'Clustered Index Insert':
      case 'Clustered Index Merge':
      case 'Clustered Index Update':
      case 'Clustered Update':
      case 'Assert':
      case 'Split':
      case 'Collapse':
        return 'modifying-data';
      case 'Remote Delete':
      case 'Remote Index Scan':
      case 'Remote Index Seek':
      case 'Remote Insert':
      case 'Remote Query':
      case 'Remote Scan':
      case 'Remote Update':
        return 'remote';
      case 'Root':
        return 'root';
      default:
        return 'operation';
    }
  }

  private root(): HierarchyRectangularNode<ShowPlan.RelOp> {
    const vm = this;
    const partitionFunc = partition<ShowPlan.RelOp>()
      .size([2 * Math.PI, this.radius * this.radius]);


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

type operationType =
  | 'reading-data'
  | 'manipulating-data'
  | 'modifying-data'
  | 'combining-data'
  | 'grouping-data'
  | 'remote'
  | 'operation'
  | 'performance'
  | 'root';

</script>

<style lang="scss">
  svg {
    filter: drop-shadow(2px 2px 2px rgba(34,36,38,.15));
  }

  svg path {
    transition: all .5s ease;
    cursor: pointer;
  }
</style>

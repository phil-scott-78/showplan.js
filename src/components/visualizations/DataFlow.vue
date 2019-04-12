<template>
    <div class="wrapper">
        <div class="zoom-buttons">
            <zoom-buttons
                @zoom-in="zoom(.1)"
                @zoom-out="zoom(-.1)"
            />
        </div>
        <div
            ref="chartWrapper"
            v-dragscroll
            class="chart-wrapper"
        >
            <svg
                ref="chart"
                class="chart"
                :style="chartStyle"
            >
                <g
                    ref="chartG"
                    :transform="chartTransform"
                >
                    <g
                        v-for="(link, index) in links"
                        :key="'link' + index"
                        class="connector-link"
                        :stroke="getStrokeColor(link)"
                        fill="none"
                        :stroke-width="getLineStrokeWidth(link)"
                        stroke-linecap="round"
                    >
                        <path :d="linkPath(link)" />
                    </g>
                    <g
                        v-for="(node, index) in nodes"
                        :key="'node' + index"
                    >
                        <g
                            :transform="nodeTransform(node)"
                            @mouseover="hover(node)"
                            @mouseout="hover(undefined)"
                            @click="operationClicked(node)"
                        >
                            <g>
                                <g
                                    fill="var(--foreground)"
                                    text-anchor="middle"
                                >
                                    <rect
                                        class="background-rect"
                                        y="1.6em"
                                        :x="-1 * nodeWidth / 2"
                                        :width="nodeWidth"
                                        :height="nodeHeight"
                                        rx="5"
                                        ry="5"
                                        stroke="var(--alt-border)"
                                        fill="var(--alt-background)"
                                        :opacity="getBackgroundRectOpacity(node)"
                                    />
                                    <text
                                        dy="3em"
                                        style="font-size:.7rem"
                                    >
                                        {{ (node.data.NodeId === -1) ? statement.StatementType : node.data.PhysicalOp }}
                                    </text>
                                    <g
                                        style="font-size:.6rem"
                                        opacity=".8"
                                    >
                                        <text
                                            v-if="node.data.NodeId !== -1 && node.data.SecondaryDesc != node.data.PhysicalOp"
                                            dy="5em"
                                        >
                                            {{ node.data.SecondaryDesc | maxLength }}
                                        </text>
                                        <text
                                            v-if="node.data.NodeId !== -1 && node.data.ThirdLevelDesc !== undefined"
                                            dy="6em"
                                        >
                                            {{ node.data.ThirdLevelDesc | maxLength }}
                                        </text>
                                    </g>
                                </g>
                            </g>
                            <circle
                                :r="getNodeSize(node)"
                                :fill="getNodeColor(node)"
                            />
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop, Watch, Emit,
} from 'vue-property-decorator';
import * as ShowPlan from 'showplan-js';
import {
    hierarchy, cluster, HierarchyPointNode, HierarchyPointLink,
} from 'd3-hierarchy';
import {
    linkHorizontal,
} from 'd3-shape';
import { scaleLinear, scalePow } from 'd3-scale';
import { min, max } from 'd3-array';
import * as TWEEN from '@tweenjs/tween.js';
import ZoomButtons from './ZoomButtons.vue';
import { GetOperationColor } from '@/components/visualizations/VizColors';
import { ParentRelOp } from './FakeParent';

@Component({
    components: { ZoomButtons },
})
export default class DataFlow extends Vue {
    public $refs!: {
        chart: Element;
        chartG: Element;
        chartWrapper: Element;
    };

    private get queryPlan(): ShowPlan.QueryPlan {
        if (this.statement === undefined || this.statement.QueryPlan === undefined) {
            throw new Error('expected a stement with a queryplan but found none');
        }

        return this.statement.QueryPlan;
    }

    private get highlightedNode(): HierarchyPointNode<ShowPlan.RelOp> | undefined {
        if (this.selectedNode === undefined) {
            return undefined;
        }

        const nodeId = this.selectedNode.NodeId;
        return this.root.descendants()
            .filter(i => i.data.NodeId === nodeId)[0];
    }

    @Prop() public statement!: ShowPlan.StmtSimple;

    @Prop({ default: undefined }) public selectedNode!: ShowPlan.RelOp | undefined;

    private nodeWidth: number = 140;

    private nodeHeight: number = 50;

    private scale = 1;

    private tweenedTransform = { scale: 1 };

    private displayEstimated = false;


    @Emit('rel-op-selected')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public statementSelected(op: number) {
        //
    }

    @Emit('rel-op-highlighted')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public statementHighlighted(op: number | undefined) {
        //
    }

    @Watch('scale')
    private scaleWatch(newValue: number) {
        let frameHandler: number;

        function animate(currentTime: number) {
            if (TWEEN.update(currentTime)) {
                frameHandler = requestAnimationFrame(animate);
            }
        }

        new TWEEN.Tween(this.tweenedTransform)
            .to({ scale: newValue }, 75)
            .onComplete(() => {
                cancelAnimationFrame(frameHandler);
            })
            .start();

        frameHandler = requestAnimationFrame(animate);
    }

    private get root(): HierarchyPointNode<ShowPlan.RelOp> {
        const noop: ShowPlan.RelOp = new ParentRelOp();
        noop.Action.RelOp[0] = this.queryPlan.RelOp;
        noop.NodeId = -1;

        return cluster<ShowPlan.RelOp>()
            .nodeSize([this.nodeHeight * 3, this.nodeWidth])
            .separation(() => 1)(hierarchy(noop, children => children.Action.RelOp));
    }

    private get links(): HierarchyPointLink<ShowPlan.RelOp>[] {
        return this.root.links();
    }

    private get nodes(): HierarchyPointNode<ShowPlan.RelOp>[] {
        return this.root.descendants().reverse();
    }

    private get rowCountForDisplayFunc(): (op: ShowPlan.RelOp) => number {
        if (this.displayEstimated) {
            return (op: ShowPlan.RelOp) => op.EstimateRows;
        }

        return (op: ShowPlan.RelOp) => {
            if (op.RunTimeInformation === undefined) {
                return op.EstimateRows;
            }

            return op.RunTimeInformation.GetRunTimeCountersSummary()!.ActualRows;
        };
    }

    // svg elements
    private nodeTransform(node: HierarchyPointNode<ShowPlan.RelOp>) {
        return `translate(${-1 * node.y}, ${node.x})`;
    }

    private linkPath(link: HierarchyPointLink<ShowPlan.RelOp>): string {
        return linkHorizontal<HierarchyPointLink<ShowPlan.RelOp>, HierarchyPointNode<ShowPlan.RelOp>>()
            .x(i => -1 * i.y)
            .y(i => i.x)(link) as string;
    }

    // node styling
    private getNodeColor(node: HierarchyPointNode<ShowPlan.RelOp>): string {
        return GetOperationColor(node.data.PhysicalOp);
    }

    private getLineStrokeWidth(link: HierarchyPointLink<ShowPlan.RelOp>): number {
        return this.rowWidthScale(this.rowCountForDisplayFunc(link.target.data));
    }

    private getStrokeColor(link: HierarchyPointLink<ShowPlan.RelOp>): string {
        const notSelectedColor = 'var(--alt-border)';

        if (this.highlightedNode === undefined) {
            return notSelectedColor;
        }

        const selectedColor = GetOperationColor(link.target.data.PhysicalOp);

        if (this.highlightedNode.descendants().some(childNode => link.target.data.NodeId === childNode.data.NodeId)) {
            return selectedColor;
        }

        if (this.highlightedNode.ancestors().some(childNode => link.target.data.NodeId === childNode.data.NodeId)) {
            return selectedColor;
        }

        return notSelectedColor;
    }

    private getBackgroundRectOpacity(node: HierarchyPointNode<ShowPlan.RelOp>) {
        if (this.highlightedNode === undefined) {
            return 0;
        }

        if (node.data.NodeId === this.highlightedNode.data.NodeId) {
            return 0.9;
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
        let maxRows = max(this.nodes, n => this.rowCountForDisplayFunc(n.data));
        let minRows = max(this.nodes, n => this.rowCountForDisplayFunc(n.data));

        if (maxRows === undefined) {
            maxRows = 20;
        }

        if (minRows === undefined) {
            minRows = 1;
        }

        // let's tweak some things so that smaller reads aren't super thick
        if (maxRows < 1000) {
            maxRows *= 2;
        }

        return scalePow()
            .exponent(0.5)
            .domain([0, maxRows])
            .rangeRound([1, 20]);
    }

    private GetOperationColor(op: ShowPlan.PhysicalOp) {
        return GetOperationColor(op);
    }

    // chart sizing and styling
    private get chartWidth(): number {
        const minX = min(this.nodes, d => d.y);
        const maxX = max(this.nodes, d => d.y);

        if (minX === undefined || maxX === undefined) {
            throw new Error('could not find chart width');
        }

        return maxX - minX + this.nodeWidth * 2;
    }

    private get chartHeight(): number {
        // invers the x and y
        const minY = min(this.nodes, d => d.x);
        const maxY = max(this.nodes, d => d.x);

        if (minY === undefined || maxY === undefined) {
            throw new Error('could not find chart width');
        }

        return maxY - minY + this.nodeHeight * 4;
    }

    private get chartStyle() {
        return {
            'min-height': this.chartHeight * this.tweenedTransform.scale,
            'min-width': this.chartWidth * this.tweenedTransform.scale,
            width: '100%',
            height: '100%',
        };
    }

    private get chartTransform() {
        // don't forget we are turning their x/y axis on the side
        const minY = min(this.nodes, d => d.x);
        const maxX = max(this.nodes, d => d.y);

        if (minY === undefined || maxX === undefined) {
            throw new Error('could not find chart size');
        }

        const offsetY = minY * -1 + this.nodeHeight;
        const offsetX = maxX + this.nodeWidth / 2;
        return `translate(${offsetX * this.tweenedTransform.scale}, ${offsetY * this.tweenedTransform.scale}) scale(${this.tweenedTransform.scale})`;
    }

    // events
    private zoom(amount: number) {
        this.scale = Math.min(Math.max(this.tweenedTransform.scale + amount, 0.25), 2);
    }

    private hover(op: HierarchyPointNode<ShowPlan.RelOp> | undefined) {
        if (op === undefined) {
            this.statementHighlighted(undefined);
            return;
        }

        if (op.data.NodeId === -1) {
            return;
        }

        this.statementHighlighted(op.data.NodeId);
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

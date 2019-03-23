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
                                        class="background-rect-no-opacity"
                                        :x="-1 * nodeWidth / 2"
                                        y="0"
                                        rx="5"
                                        ry="5"
                                        :width="nodeWidth"
                                        :height="nodeHeight"
                                        fill="var(--background)"
                                    />
                                    <rect
                                        class="background-rect"
                                        :x="-1 * nodeWidth / 2"
                                        y="0"
                                        rx="5"
                                        ry="5"
                                        :width="nodeWidth"
                                        :height="nodeHeight"
                                        :stroke="getNodeColor(node)"
                                        :fill="getBackgroundRectFill(node)"
                                        :fill-opacity="getBackgroundRectFillOpacity(node)"
                                        :stroke-opacity="getBackgroundRectStrokeOpacity(node)"
                                    />

                                    <g style="font-size:.7rem">
                                        <text
                                            v-if="node.data.NodeId === -1"
                                            dy="1.6em"
                                            style="font-weight:500;font-size:1.2rem"
                                        >
                                            {{ statement.StatementType }}
                                        </text>
                                        <g v-else>
                                            <text dy="1.5em">
                                                {{ (node.data.NodeId === -1) ? statement.StatementType : node.data.PhysicalOp }}
                                            </text>
                                            <text
                                                v-if="node.data.NodeId !== -1"
                                                x="75"
                                                dy="1.5em"
                                                text-anchor="right"
                                                :style="node.data.EstimateTotalCost / statement.StatementSubTreeCost < .25 ? 'fill:var(--foreground)' : 'fill:var(--red)'"
                                            >
                                                {{ node.data.EstimateTotalCost / statement.StatementSubTreeCost | filterPercent }}
                                            </text>
                                        </g>
                                    </g>
                                    <g
                                        v-if="node.data.NodeId !== -1"
                                        style="font-size:.6rem"
                                        opacity=".8"
                                    >
                                        <text
                                            v-if=" node.data.SecondaryDesc != node.data.PhysicalOp"
                                            dy="3em"
                                        >
                                            {{ node.data.SecondaryDesc | maxLength }}
                                        </text>
                                        <text
                                            v-if="node.data.ThirdLevelDesc !== undefined"
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
import {
    Vue, Component, Prop, Watch, Emit,
} from 'vue-property-decorator';
import * as ShowPlan from '@/parser/showplan';
import {
    hierarchy, tree, HierarchyPointNode, HierarchyPointLink,
} from 'd3-hierarchy';
import { linkVertical } from 'd3-shape';
import { scaleLinear, scalePow } from 'd3-scale';
import { min, max } from 'd3-array';
import * as TWEEN from '@tweenjs/tween.js';
import ZoomButtons from './ZoomButtons.vue';
import {
    GetOperationColor, GetStateValue, GetStateValueOptions,
} from '@/components/visualizations/VizColors';
import { ParentRelOp } from './FakeParent';

@Component({
    components: { ZoomButtons },
})
export default class OperatorFlow extends Vue {
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
        return this.root.descendants().filter(i => i.data.NodeId === nodeId)[0];
    }

    @Prop() public statement!: ShowPlan.StmtSimple;

    @Prop({ default: undefined }) public selectedNode!: ShowPlan.RelOp | undefined;

    private nodeWidth: number = 180;

    private nodeHeight: number = 50;

    private chartCenter: number = 350;

    private scale = 1;

    private tweenedTransform = { scale: 1 };

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

    private get root(): HierarchyPointNode<ShowPlan.RelOp> {
        const noop: ShowPlan.RelOp = new ParentRelOp();
        noop.Action.RelOp[0] = this.queryPlan.RelOp;
        noop.NodeId = -1;

        return tree<ShowPlan.RelOp>()
            .nodeSize([this.nodeWidth, this.nodeHeight * 2])
            .separation(() => 1.25)(hierarchy(noop, children => children.Action.RelOp));
    }

    @Watch('root')
    private rootWatch() {
        // if the visualization changes we'll want to update
        // the scrollbar to point to the new root
        this.updateScrollPos();
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

    private get links(): HierarchyPointLink<ShowPlan.RelOp>[] {
        return this.root.links();
    }

    private get nodes(): HierarchyPointNode<ShowPlan.RelOp>[] {
        return this.root.descendants().reverse();
    }

    private nodeTransform(node: HierarchyPointNode<ShowPlan.RelOp>) {
        return `translate(${node.x}, ${node.y})`;
    }

    private linkPath(link: HierarchyPointLink<ShowPlan.RelOp>): string {
        return linkVertical()(
            {
                source: [link.source.x, link.source.y + this.nodeHeight],
                target: [link.target.x, link.target.y],
            },
        ) as string;
    }

    // node styling
    private getNodeColor(node: HierarchyPointNode<ShowPlan.RelOp>): string {
        return GetOperationColor(node.data.PhysicalOp);
    }

    private getLineStrokeOpacity(): number {
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
        const options: GetStateValueOptions<string> = {
            parentValue: selectedColor,
            childValue: selectedColor,
            defaultValue: notSelectedColor,
        };

        return GetStateValue(
            link.target.data.NodeId,
            this.highlightedNode.data.NodeId,
            this.highlightedNode.ancestors().map(d => d.data.NodeId),
            this.highlightedNode.descendants().map(d => d.data.NodeId),
            options,
        );
    }

    private getBackgroundRectStrokeOpacity(node: HierarchyPointNode<ShowPlan.RelOp>) {
        const options: GetStateValueOptions<number> = {
            parentValue: 1,
            childValue: 0.4,
            defaultValue: 0.2,
            selectedValue: 1,
        };

        if (this.highlightedNode === undefined) {
            return options.defaultValue;
        }

        return GetStateValue(
            node.data.NodeId,
            this.highlightedNode.data.NodeId,
            this.highlightedNode.ancestors().map(d => d.data.NodeId),
            this.highlightedNode.descendants().map(d => d.data.NodeId),
            options,
        );
    }

    private getBackgroundRectFill(node: HierarchyPointNode<ShowPlan.RelOp>) {
        if (node.data.NodeId === -1) {
            return 'var(--grey)';
        }

        if (this.highlightedNode === undefined) {
            return 'var(--background)';
        }

        if (node.data.NodeId === this.highlightedNode.data.NodeId) {
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

        if (node.data.NodeId === this.highlightedNode.data.NodeId) {
            return 0.3;
        }

        return 1;
    }

    private getNodeSize(node: HierarchyPointNode<ShowPlan.RelOp>) {
        if (node.data.NodeId === -1) {
            return 10;
        }

        return this.costCircleScale(node.data.EstimateTotalCost);
    }

    // chart sizing and styling
    private scaled(original: number): number {
        return original * this.tweenedTransform.scale;
    }

    private inverseScaled(original: number): number {
        return original / this.tweenedTransform.scale;
    }

    private get chartWidth(): number {
        const minX = min(this.nodes, d => d.x);
        const maxX = max(this.nodes, d => d.x);

        if (minX === undefined || maxX === undefined) {
            throw new Error('could not find chart width');
        }

        const offset = this.scaled(this.rootRectOffsetX);
        let nudge = 0;
        if (offset < this.chartCenter) {
            nudge = this.inverseScaled(this.chartCenter);
        }

        return maxX - minX + this.scaled(this.nodeWidth * 2) + nudge;
    }

    private get chartHeight(): number {
        const minY = min(this.nodes, d => d.y);
        const maxY = max(this.nodes, d => d.y);

        if (minY === undefined || maxY === undefined) {
            throw new Error('could not find chart height');
        }

        return maxY - minY + this.scaled(this.nodeHeight * 2);
    }

    private get chartStyle() {
        return {
            'min-height': this.scaled(this.chartHeight),
            'min-width': this.scaled(this.chartWidth),
            width: '100%',
            height: '100%',
        };
    }

    private get rootRectOffsetX(): number {
        const minX = min(this.nodes, d => d.x);
        if (minX === undefined) {
            throw new Error('Could not find chart dimensions');
        }

        const x = minX * -1 + this.nodeWidth;
        return x;
    }

    private get chartTransform() {
        let offset: number;
        offset = this.scaled(this.rootRectOffsetX);
        if (offset < this.chartCenter) {
            offset = this.chartCenter;
        }

        return `translate(${offset}, ${this.scaled(this.nodeHeight * 0.5)}) scale(${this.tweenedTransform.scale})`;
    }

    private get costCircleScale() {
        return scaleLinear()
            .domain([0, this.queryPlan.RelOp.EstimatedTotalSubtreeCost])
            .rangeRound([2, 20]);
    }

    private get rowWidthScale() {
        let minCost = min(this.nodes, n => n.data.EstimatedTotalSubtreeCost);
        let maxCost = max(this.nodes, n => n.data.EstimatedTotalSubtreeCost);

        if (minCost === undefined) minCost = 0;
        if (maxCost === undefined) maxCost = 20;
        if (maxCost < 10) maxCost *= 2;

        return scalePow()
            .exponent(0.5)
            .domain([0, maxCost])
            .rangeRound([1, 20]);
    }

    // events
    private mounted() {
        this.updateScrollPos();
        this.chartCenter = this.$refs.chartWrapper.clientWidth / 2;
        window.addEventListener('resize', this.handleResize);
    }

    private beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    }

    private handleResize() {
        this.chartCenter = this.$refs.chartWrapper.clientWidth / 2;
    }

    private zoom(amount: number) {
        this.scale = Math.min(Math.max(this.scale + amount, 0.25), 2);
    }

    private updateScrollPos() {
        const vm = this;
        Vue.nextTick().then(() => {
            vm.$refs.chartWrapper.scrollLeft = this.rootRectOffsetX - this.nodeWidth * 2;
        });
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
      top: 0;
      left: 0;
    }
  }

</style>

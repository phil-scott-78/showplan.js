<template>
    <svg
        preserveAspectRatio="none "
        width="100%"
        height="1em"
        viewBox="0 0 100 20"
    >
        <g
            v-for="(thread) in sorted"
            :key="thread.Thread"
        >
            <rect
                :width="xScale.bandwidth()"
                :height="yScale(getValue(thread), 1)"
                :x="xScale(thread.Thread)"
                :y="20 - yScale(getValue(thread))"
                fill="var(--green)"
            >
                <title>Thread {{ thread.Thread }} - {{ getValue(thread) | filterInteger }} {{ propertyName }}</title>
            </rect>
        </g>
    </svg>
</template>

<script lang='ts'>
import { RunTimeInformationTypeRunTimeCountersPerThread } from '@/parser/showplan';
import {
    Vue,
    Component,
    Prop,
} from 'vue-property-decorator';
import { scaleLinear, scaleBand } from 'd3-scale';
import { min, max } from 'd3-array';

@Component({
})
export default class CounterChart extends Vue {
    @Prop() runTimeInformation!: RunTimeInformationTypeRunTimeCountersPerThread[];

    @Prop() propertyFunc!: (value: RunTimeInformationTypeRunTimeCountersPerThread) => number;

    @Prop() propertyName!: string;

    private get sorted(): RunTimeInformationTypeRunTimeCountersPerThread[] {
        return this.runTimeInformation.concat().sort((a, b) => a.Thread - b.Thread);
    }

    private get xScale() {
        return scaleBand()
            .domain(this.runTimeInformation.map(i => i.Thread.toString()))
            .range([0, 100])
            .paddingInner(0.1);
    }

    private getValue(input: RunTimeInformationTypeRunTimeCountersPerThread): number {
        return this.propertyFunc(input);
    }

    private get yScale() {
        let maxRows = max(this.runTimeInformation, i => this.propertyFunc(i));
        let minRows = min(this.runTimeInformation, i => this.propertyFunc(i));

        if (maxRows === undefined) {
            maxRows = 10;
        }

        if (minRows === undefined) {
            minRows = 0;
        }

        if (minRows !== 0) {
            minRows *= 0.8;
        }

        return scaleLinear()
            .domain([minRows, maxRows])
            .range([1, 20]);
    }
}
</script>

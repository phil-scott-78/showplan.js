<template>
    <div
        v-if="data.length === 1"
        :class="divClass"
    >
        <slot :item="data[0]" />
    </div>

    <ul
        v-else
        :class="listClass"
    >
        <li
            v-for="(d, index) in data"
            :key="index"
        >
            <slot :item="d" />
        </li>
    </ul>
</template>


<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';

@Component({
})
export default class ListOrDiv extends Vue {
  // eslint-disable-next-line
  @Prop() public data!: any[];

  @Prop({ default: 'small' }) public listClass!: string;

  @Prop({ default: 'small' }) public divClass!: string;
}
</script>

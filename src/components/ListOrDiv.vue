<template>

  <div v-if="data.length === 1" v-bind:class="divClass">
    <slot v-bind:item="data[0]"></slot>
  </div>

  <ul v-else v-bind:class="listClass">
    <li v-for="(d, index) in data" v-bind:key="index">
      <slot v-bind:item="d"></slot>
    </li>
  </ul>
</template>


<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
})
export default class ListOrDiv extends Vue {
  @Prop() public data!: any[];
  @Prop({default: 'small'}) public listClass!: string;
  @Prop({default: 'small'}) public divClass!: string;
}
</script>

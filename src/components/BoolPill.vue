<template>
  <span v-if="value !== undefined" class="pill" :class="{ 'on': value === true }"><slot></slot></span>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop, Watch,
} from 'vue-property-decorator';

@Component({
})
export default class BoolPill extends Vue {
  @Prop() public value?: boolean;
}
</script>

<style lang="scss" scoped>

</style>

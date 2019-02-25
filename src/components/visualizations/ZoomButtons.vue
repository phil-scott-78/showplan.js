<template>
  <div>
    <button v-on:click="zoomOut"><font-awesome-icon :icon="['fa', 'search-minus']" /></button>
    <button v-on:click="zoomIn"><font-awesome-icon :icon="['fa', 'search-plus']" /></button>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';

@Component({
})
export default class ZoomButtons extends Vue {
  @Emit('zoom-out')
  private zoomOut() {
    //
  }

  @Emit('zoom-in')
  private zoomIn() {
    //
  }
}
</script>

<style lang="scss" scoped>
  button {
    background-color: inherit;
    border: 1px solid var(--border);
    color: var(--foreground);
    opacity: .5;
    padding: .5rem 1rem;
    font-size:1rem;
    cursor: pointer;
    transition: opacity .3s ease, background-color .3s ease;

    &:first-child {
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;
    }

    &:last-child {
      border-top-right-radius: 15px;
      border-bottom-right-radius: 15px;
    }

    &:hover{
      background-color: var(--alt-background);
      opacity: 1;
    }
  }
</style>

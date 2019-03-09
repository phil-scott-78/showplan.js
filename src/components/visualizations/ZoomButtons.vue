<template>
    <div>
        <button @click="zoomOut">
            <font-awesome-icon :icon="['fa', 'search-minus']" />
        </button>
        <button @click="zoomIn">
            <font-awesome-icon :icon="['fa', 'search-plus']" />
        </button>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Emit,
} from 'vue-property-decorator';

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
    background-color: var(--alt-background);
    border-left: none;
    border-top: none;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    color: var(--foreground);
    opacity: .5;
    padding: .5rem 1rem;
    font-size:1rem;
    cursor: pointer;
    transition: opacity .3s ease, background-color .3s ease;

    &:last-child {
      border-bottom-right-radius: 8px;
    }

    &:hover{
      background-color: var(--alt-background);
      opacity: 1;
    }
  }
</style>

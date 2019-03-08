<template>
  <component :is="tag">
    <slot/>
  </component>
</template>

<script>
import smoothReflow from 'vue-smooth-reflow';

export default {
    name: 'SmoothReflow',
    mixins: [smoothReflow],
    props: {
        tag: {
            type: String,
            default: 'div',
        },
        options: Object,
    },
    mounted() {
        if (this.options === undefined) {
            this.$smoothReflow({
                transition: 'height .10s ease',
            });
        } else {
            this.$smoothReflow(this.options);
        }
    },
};
</script>

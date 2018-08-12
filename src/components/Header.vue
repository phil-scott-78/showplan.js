<template>
  <div class="menu">
    <div class="header item">
      SQL Server SHOWPLAN
    </div>
    <div class="actions">
      <a href="https://github.com/phil-scott-78/showplan.js" class="item"><font-awesome-icon :icon="['fab', 'github']" /></a>
      <a @click="planChanged(null)" class="item">New Plan</a>
    </div>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import { ShowPlanXML } from '@/parser/showplan';


@Component({
})
export default class Header extends Vue {
  public NewPlanClick() {
    this.planChanged(null);
  }

  @Emit('plan-changed') public planChanged(plan: ShowPlanXML | null) {
    //
  }
}
</script>

<style scoped lang="scss">
  .menu {
    display: flex;
    margin-bottom: 1rem;
    border: 1px solid var(--alt-border);
    box-shadow:0 1px 2px 0 rgba(34,36,38,.15);
    border-radius: .28571429rem;
    background-color: var(--alt-background);
  }

  .item {
    padding: .92857143em 1.14285714em;
    position: relative;
    display:inline-block;
  }

  .header {
    flex:1;
    font-weight:bold;
  }

  .actions {
    flex:3;
    text-align: right;

    a {color: inherit;}

    .item {
      border-left: 1px solid var(--alt-border);
      transition: background-color.25s ease;
    }

    .item:hover {
      cursor: pointer;
      background-color: var(--background);;
      color: var(--foreground);;
    }
  }
</style>

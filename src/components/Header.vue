<template>
  <div class="menu">
    <div class="header item">
      SQL Server SHOWPLAN
    </div>
    <div class="actions">

      <a href="https://github.com/phil-scott-78/showplan.js" class="item"><font-awesome-icon :icon="['fab', 'github']" /></a>
      <button v-if="currentPlan === undefined" @click="loadSample" class="item">Load Sample</button>
      <button v-else @click="planChanged(undefined)" class="item">New Plan</button>
    </div>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator';
import { ShowPlanXML } from '@/parser/showplan';

@Component({
})
export default class Header extends Vue {
  @Prop() public currentPlan!: ShowPlanXML | undefined;

  public loadSample() {
    const request = new XMLHttpRequest();
    request.onload = (ev) => {
      if (request.status === 200) {
        this.planChanged(request.responseText);
      }
    };
    request.open('GET', 'users-with-post-count-and-comment-count.sqlplan');
    request.send();
  }

  @Emit('plan-changed') public planChanged(plan: string | undefined) {
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

    button {
      border: none;
      background-color: var(--alt-background);
      color: var(--foreground);
    }

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

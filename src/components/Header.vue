<template>
  <div class="menu">
    <div class="header item">
      SQL Server SHOWPLAN
    </div>
    <div class="actions">
      <a @click="planChanged(null)" class="item">New Plan</a>
      </div>
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
    border: 1px solid rgba(34,36,38,.15);
    box-shadow:0 1px 2px 0 rgba(34,36,38,.15);
    border-radius: .28571429rem;
  }

  .item {
    padding: .92857143em 1.14285714em;
    display:inline-flex;
  }

  .header {
    flex:1;
    font-weight:bold;
  }

  .actions {
    flex:3;
    text-align: right;

    .item {
      border-left: 1px solid rgba(34,36,38,.15);
    }

    .item:hover {
      cursor: pointer;
      background: rgba(0,0,0,.03);
      color: rgba(0,0,0,.95);
    }
  }
</style>

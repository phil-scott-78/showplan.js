<template>
  <div id="app">
    <header-menu @plan-changed="planXmlChanged" :currentPlan="showPlan"></header-menu>
    <component v-bind:is="currentComponent" :statement="currentStatement" :showPlan="showPlan" @showplan-changed="planXmlChanged" @showplan-statement-changed="statementChanged"></component>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import FileUploadDrop from '@/components/FileUploadDrop.vue';
  import HeaderMenu from '@/components/Header.vue';
  import * as ShowPlan from '@/parser/showplan';

  @Component({
    components: { HeaderMenu, FileUploadDrop, Statement: () => import('@/components/Statement.vue')},
  })
  export default class App extends Vue {
    public showPlan: ShowPlan.ShowPlanXML | null = null;
    public selectedStatementGuid: string | null = null;

    public get currentComponent(): string {
      if (this.showPlan == null) {
        return 'file-upload-drop';
      }

      return 'statement';
    }

    public get currentStatement(): ShowPlan.BaseStmtInfo | null {
      if (this.showPlan == null) {
        return null;
      }

      if (this.selectedStatementGuid != null) {
        return this.showPlan.GetStatementByGuid(this.selectedStatementGuid);
      }

      return null;
    }

    public showPlanChanged(showPlan: ShowPlan.ShowPlanXML | null) {
      this.showPlan = showPlan;

      if (showPlan == null) {
        return;
      }

      // select a logical first item
      let firstItem: string | null = null;
      for (const batch of this.showPlan!.Batches) {
        for (const statement of batch.Statements) {
          if (firstItem == null) {
            firstItem = statement.Guid;
          }

          if (statement.StatementType !== 'USE DATABASE') {
            this.selectedStatementGuid = statement.Guid;
          }
        }
      }
    }

    public statementChanged(statementGuid: string) {
      this.selectedStatementGuid = statementGuid;
    }

    public planXmlChanged(plan: string | null) {
      if (plan === null) {
        this.showPlan = null;
        return;
      }

      const vm = this;
      import('@/parser/showplan-parser').then((showPlanParser) => {
        const parser = new showPlanParser.ShowPlanParser();
        this.showPlanChanged(parser.Parse(plan!));
      });
    }
  }
</script>

<style lang="scss" scoped>
  #app {
    position: relative;
    min-width:800px;
    max-width:1200px;
    left: 0px;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  h1.title {
    margin:0;
  }

  div.grid-content {
    min-height: 40px;
    vertical-align: baseline;
  }
</style>

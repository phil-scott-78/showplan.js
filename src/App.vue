<template>
  <div id="app" :class="theme">
    <div id="container">
      <header-menu @plan-changed="planXmlChanged" :currentPlan="showPlan"></header-menu>
      <div class="message warning" v-if="errorMessage !== undefined">{{ errorMessage }}</div>
      <component v-bind:is="currentComponent" :statement="currentStatement" :showPlan="showPlan" @showplan-changed="planXmlChanged" @showplan-statement-changed="statementChanged"></component>
      <p class="footer">Everything is ran in browser so no files will be uploaded. I can't afford the storage space anyways</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import FileUploadDrop from '@/components/FileUploadDrop.vue';
import HeaderMenu from '@/components/Header.vue';
import * as ShowPlan from '@/parser/showplan';

@Component({
  components: { HeaderMenu, FileUploadDrop, Statement: () => import('@/components/Statement.vue')},
  data() {
    return {
      showPlan: undefined,
      selectedStatementGuid: undefined,
      errorMessage: undefined,
    };
  },
})
export default class App extends Vue {
  public showPlan: ShowPlan.ShowPlanXML | undefined;
  public selectedStatementGuid: string | undefined;
  public theme: string = 'theme--dark';

  private errorMessage: string | undefined;

  public get currentComponent(): string {
    if (this.showPlan === undefined) {
      return 'file-upload-drop';
    }

    return 'statement';
  }

  public get currentStatement(): ShowPlan.BaseStmtInfo | undefined {
    if (this.showPlan === undefined) {
      return undefined;
    }

    if (this.selectedStatementGuid !== undefined) {
      return this.showPlan.GetStatementByGuid(this.selectedStatementGuid);
    }

    return undefined;
  }

  public showPlanChanged(showPlan: ShowPlan.ShowPlanXML | undefined) {
    this.showPlan = showPlan;

    if (showPlan === undefined) {
      return;
    }

    // select a logical first item
    let firstItem: string | undefined;
    for (const batch of this.showPlan!.Batches) {
      for (const statement of batch.Statements) {
        if (firstItem === undefined) {
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

  public planXmlChanged(plan: string | undefined) {
    this.errorMessage = undefined;

    if (plan === undefined) {
      this.showPlan = undefined;
      return;
    }

    const vm = this;
    import('@/parser/showplan-parser').then((showPlanParser) => {
      try {
        const parser = new showPlanParser.ShowPlanParser();
        this.showPlanChanged(parser.Parse(plan!));
      } catch (e) {
        this.errorMessage = e.message;
      }

    });
  }
}
</script>

<style lang="scss" scoped>
  #app {
    padding: 1rem;
    min-height: 100vh;
  }

  #container {
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

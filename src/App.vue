<template>
  <div id="app">
    <div v-if="showPlan === null">
        <file-upload-drop v-on:showplan-changed="showPlanChanged" ></file-upload-drop>
    </div>
    <div v-else>
      <div v-if="currentStatement !== null">
        <statement v-bind:statement="currentStatement"></statement>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import FileUploadDrop from '@/components/FileUploadDrop.vue';
  import SelectPlan from '@/components/SelectPlan.vue';
  import Statement from '@/components/Statement.vue';
  import * as ShowPlan from '@/parser/showplan';

  @Component({
    components: { FileUploadDrop, SelectPlan, Statement },
  })
  export default class App extends Vue {
    public showPlan: ShowPlan.ShowPlanXML | null = null;
    public currentStatementGuid: string | null = null;

    public get currentStatement(): ShowPlan.BaseStmtInfo | null {
      if (this.showPlan === null || this.currentStatementGuid === null) {
        return null;
      }

      return this.showPlan.GetStatementByGuid(this.currentStatementGuid);
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
            this.currentStatementGuid = statement.Guid;
          }
        }
      }
    }

    public statementChanged(statementGuid: string) {
      this.currentStatementGuid = statementGuid;
    }

    public newPlan() {
      this.showPlan = null;
    }
  }
</script>

<style lang="scss">
  .upload-demo {
    .el-upload, .el-upload-dragger {
      width:100%;
    }
  }
</style>

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

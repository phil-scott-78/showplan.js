<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-menu class="el-menu-demo" mode="horizontal">
          <el-menu-item index="1">Processing Center</el-menu-item>
          <el-submenu index="2">
            <template slot="title">Workspace</template>
            <el-menu-item index="2-1">item one</el-menu-item>
            <el-menu-item index="2-2">item two</el-menu-item>
            <el-menu-item index="2-3">item three</el-menu-item>
            <el-submenu index="2-4">
              <template slot="title">item four</template>
              <el-menu-item index="2-4-1">item one</el-menu-item>
              <el-menu-item index="2-4-2">item two</el-menu-item>
              <el-menu-item index="2-4-3">item three</el-menu-item>
            </el-submenu>
          </el-submenu>
          <el-menu-item index="3" disabled>Info</el-menu-item>
          <el-menu-item index="4"><a href="https://www.ele.me" target="_blank">Orders</a></el-menu-item>
        </el-menu>

      </el-header>
      <el-main>
        <div v-if="showPlan === null">
            <file-upload-drop v-on:showplan-changed="showPlanChanged" ></file-upload-drop>
        </div>
        <div v-else>
          <div>
            <select-plan v-bind:showPlan="showPlan" v-on:showplan-statement-changed="statementChanged"></select-plan>
          </div>

          <div v-if="currentStatement !== null">
            <h1>{{ currentStatement.StatementType }}</h1>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import FileUploadDrop from '@/components/FileUploadDrop.vue';
  import SelectPlan from '@/components/SelectPlan.vue';
  import * as ShowPlan from '@/parser/showplan';

  @Component({
    components: { FileUploadDrop, SelectPlan }
  })
  export default class App extends Vue {
    showPlan: ShowPlan.ShowPlanXML | null = null;
    currentStatementGuid: string | null = null;

    get currentStatement(): ShowPlan.BaseStmtInfo | null {
      if (this.showPlan === null || this.currentStatementGuid === null) {
        return null;
      }

      return this.showPlan.GetStatementByGuid(this.currentStatementGuid);
    }

    showPlanChanged(showPlan: ShowPlan.ShowPlanXML) {
      this.showPlan = showPlan;
    }

    statementChanged(statementGuid: string) {
      this.currentStatementGuid = statementGuid;
    }
  }
</script>

<style lang="scss">
  #app {
    position: relative;
    width: 900px !important;
    left: 0px;
    margin-left: auto !important;
    margin-right: auto !important;
  }
</style>

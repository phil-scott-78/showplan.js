<template>
  <div id="app" :class="theme">
    <div id="container">
      <header-menu @plan-changed="planXmlChanged" @toggle-theme="toggleTheme" :darkMode="darkMode" :currentPlan="showPlan"></header-menu>
      <div class="message warning" v-if="errorMessage !== undefined">{{ errorMessage }}</div>
      <component :is="currentComponent" :statement="currentStatement" :showPlan="showPlan" @showplan-changed="planXmlChanged" @showplan-statement-changed="statementChanged"></component>
      <p class="footer">Everything is ran in browser so no files will be uploaded. I can't afford the storage space anyways</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import FileUploadDrop from '@/components/FileUploadDrop.vue';
import HeaderMenu from '@/components/Header.vue';
import * as ShowPlan from '@/parser/showplan';

@Component({
    components: { HeaderMenu, FileUploadDrop, Statement: () => import('@/components/Statement.vue') },
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


    public get theme(): string {
    // vscode will set the theme themselves
    // via the body tag
        if (process.env.VUE_APP_EMBED) {
            return '';
        }

        if (this.darkMode) {
            return 'theme--dark';
        }

        return 'theme--light';
    }

    private darkMode: boolean = true;

    private errorMessage: string | undefined;

    public get currentComponent(): string {
        if (this.showPlan === undefined) {
            return 'file-upload-drop';
        }

        return 'statement';
    }

    public toggleTheme() {
        this.darkMode = !this.darkMode;
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

        showPlan.Batches.forEach((batch) => {
            batch.Statements.forEach((statement) => {
                if (firstItem === undefined) {
                    firstItem = statement.Guid;
                }

                if (statement.StatementType !== 'USE DATABASE') {
                    this.selectedStatementGuid = statement.Guid;
                }
            });
        });
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

        import('@/parser/showplan-parser').then((showPlanParser) => {
            try {
                const parser = new showPlanParser.ShowPlanParser();
                this.showPlanChanged(parser.Parse(plan));
            } catch (e) {
                this.errorMessage = e.message;
            }
        });
    }

    public mounted() {
        if (process.env.VUE_APP_EMBED) {
            // if we are running within VS Code they'll dynamically add
            // aquireVsCodeApi. Since it isn't valid until then we'll need
            // to invoke it dynamically.
            // eslint-disable-next-line no-new-func
            const vsCodeFunction = Function(`
        if (typeof acquireVsCodeApi == 'function') {
          return acquireVsCodeApi();
        } else {
          return undefined;
        }
        `);
            const vscode = vsCodeFunction();
            if (vscode !== undefined) {
                // we need to send a message to VS Code to tell it we are
                // ready to go and everything is loaded up so send us
                // the xml payload
                vscode.postMessage({ command: 'mounted' });
                this.$nextTick(() => {
                    window.addEventListener('message', (event) => {
                        const xml = event.data;
                        this.planXmlChanged(xml);
                    });
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
  #app {
    padding: 1rem;
    min-height: 100vh;
    min-width: 800px;
    transition: background-color .3s ease, color .3s ease;
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

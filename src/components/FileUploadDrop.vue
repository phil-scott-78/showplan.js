<template>
    <div class="container">
        <!--UPLOAD-->
        <form
            class="upload-form"
            enctype="multipart/form-data"
            novalidate
        >
            <div
                v-if="showPasteTextBox === false"
                class="dropbox"
            >
                <div>
                    <font-awesome-icon
                        icon="cloud-upload-alt"
                        size="6x"
                    />
                </div>
                <h4>Click or Drop .SQLPLAN</h4>
                <input
                    type="file"
                    class="input-file"
                    @change="filesChange($event.target.files);"
                >
            </div>
            <div
                v-else
                class="dropbox"
            >
                <textarea
                    id="planTextBox"
                    ref="planTextBox"
                    placeholder="Paste your plan"
                    rows="10"
                    name="planTextBox"
                    autofocus
                    @paste="onPaste"
                />
            </div>
            <p
                v-if="showPasteTextBox === false"
                style="text-align:center"
            >
                Or <a @click="togglePaste(true)">paste</a> a plan
            </p>
            <p
                v-else
                style="text-align:center"
            >
                Or <a @click="togglePaste(false)">upload</a> a plan
            </p>
        </form>
    </div>
</template>

<script lang="ts">
import {
    Component, Vue, Emit,
} from 'vue-property-decorator';

@Component({
    components: { },
})
export default class FileUploadDrop extends Vue {
    private showPasteTextBox: boolean = false;

    public filesChange(fileList: FileList) {
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            this.emitShowPlanChanged(text);
        };

        reader.readAsText(fileList[0]);
    }

    public togglePaste(showPaste: boolean) {
        this.showPasteTextBox = showPaste;
    }

    public onPaste(e: ClipboardEvent) {
        const clipboardContents = e.clipboardData.getData('text');
        if (clipboardContents === undefined) {
            return;
        }

        this.emitShowPlanChanged(clipboardContents);
    }

    @Emit('showplan-changed')
    public emitShowPlanChanged(showPlan: string): string {
        return showPlan;
    }
}
</script>

<style lang="scss" scoped>
  .dropbox {
    outline: 2px dashed var(--grey); /* the dash box */
    color: var(--foreground);
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
    display:flex;
    align-items: center;
    justify-content: center;
    transition:background-color .25s ease;
    flex-direction: column;

    svg {
      color: var(--blue);
      filter: drop-shadow(2px 2px 2px rgba(34,36,38,.9));
    }

    textarea {
      height: 80%;
      width: 80%;
      padding: .5rem;
      background-color: var(--alt-background);
      // border: 1px solid var(--alt-border);
      outline-color: var(--alt-border);
      font-family: 'Consolas', 'Courier New', Courier, monospace;

      &:focus {
        outline-color: var(--border);
      }
    }
  }

  .input-file {
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    cursor: pointer;
  }

  .dropbox:hover {
    background-color: rgba(0,0,0,.03);
  }

  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }

  a {
    cursor: pointer;
    background-color: var(--alt-background);
    padding: 0px 6px 2px 6px;
    margin: 0 4px;
    border: 1px solid var(--alt-border);
    border-radius:3px;
    transition: all .3s ease;
    &:hover {
      background-color: var(--background);
      border: 1px solid var(--border);
    }
  }


</style>

<template>
<div class="container">
  <!--UPLOAD-->
  <form enctype="multipart/form-data" novalidate>
    <div class="dropbox">
      <div>
        <font-awesome-icon icon="cloud-upload-alt" size="6x"></font-awesome-icon>
      </div>
      <h4>Click or Drop .SQLPLAN</h4>
      <input type="file" @change="filesChange($event.target.files);" class="input-file">
      <textarea id="planTextBox" ref="planTextBox" name="planTextBox" style="opacity:0;position:fixed;left:-1000px" autofocus @paste="onPaste"></textarea>
    </div>
  </form>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import * as ShowPlan from '@/parser/showplan';

@Component({
  components: { },
})
export default class FileUploadDrop extends Vue {

  public $refs!: {
    planTextBox: HTMLFormElement,
  };

  public filesChange(fileList: FileList) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = reader.result as string;
      this.setPlan(text);
    };

    reader.readAsText(fileList[0]);
  }

  public onPaste(e: ClipboardEvent) {
    const clipboardContents = e.clipboardData.getData('text');
    if (clipboardContents == null) {
      return;
    }

    this.setPlan(clipboardContents);
  }

  @Emit('showplan-changed')
  public emitShowPlanChanged(showPlan: ShowPlan.ShowPlanXML) {
    //
  }

  public mounted() {
    this.$refs.planTextBox.focus();
  }

  private setPlan(planXml: string) {
    const vm = this;
    import('@/parser/showplan-parser').then((showPlanParser) => {
      const parser = new showPlanParser.ShowPlanParser();
      const showPlan = parser.Parse(planXml);
      vm.emitShowPlanChanged(showPlan);
    });
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
</style>

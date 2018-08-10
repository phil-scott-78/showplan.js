<template>
<div class="container">
  <!--UPLOAD-->
  <form enctype="multipart/form-data" novalidate>
    <div class="dropbox">
      <div>
        <font-awesome-icon icon="cloud-upload-alt" size="6x"></font-awesome-icon>
      </div>
      <div>Click or Drop .SQLPLAN</div>
      <input type="file" @change="filesChange($event.target.files);" class="input-file">
    </div>
  </form>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import * as ShowPlan from '@/parser/showplan';
import { ShowPlanParser } from '@/parser/showplan-parser';

@Component({
  components: { },
})
export default class FileUploadDrop extends Vue {

  public filesChange(fileList: FileList) {
    const parser = new ShowPlanParser();
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = reader.result;
      const showPlan = parser.Parse(text);
      this.emitShowPlanChanged(showPlan);
    };

    reader.readAsText(fileList[0]);
  }

  @Emit('showplan-changed')
  public emitShowPlanChanged(showPlan: ShowPlan.ShowPlanXML) {
    //
  }

}
</script>

<style lang="scss" scoped>
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    color: dimgray;
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

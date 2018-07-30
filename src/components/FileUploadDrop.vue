<template>
<div class="container">
  <!--UPLOAD-->
  <form enctype="multipart/form-data" novalidate>
    <div class="dropbox">
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
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
  }

  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }

  .dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }

  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }
</style>

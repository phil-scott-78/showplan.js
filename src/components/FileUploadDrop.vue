<template>
  <el-upload
    class="upload-demo"
    action="http://www.example.com"
    :auto-upload="false"
    drag
    :on-change="handleOnChanged"
    >
  <i class="el-icon-upload"></i>
    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
    <div class="el-upload__tip" slot="tip">jpg/png files with a size less than 500kb</div>
  </el-upload>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { ElUploadInternalFileDetail } from 'element-ui/types/upload';

import * as ShowPlan from '@/parser/showplan';
import { ShowPlanParser } from '@/parser/showplan-parser';

@Component
export default class FileUploadDrop extends Vue{
  public handleOnChanged(file: ElUploadInternalFileDetail , fileList: FileList) {
    const parser = new ShowPlanParser();
    var reader = new FileReader();
    reader.onload = (e) => {
      var text = reader.result;
      const showPlan = parser.Parse(text);
      this.emitShowPlanChanged(showPlan);
    }

    reader.readAsText(file.raw);
  }

  @Emit('showplan-changed')
  emitShowPlanChanged(showPlan: ShowPlan.ShowPlanXML){}

}
</script>

<style lang="scss" scoped>
</style>

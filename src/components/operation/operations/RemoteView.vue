<template>
    <div>
        <div class="content">
            <h4>Remote</h4>
            <div
                v-if="remote.RemoteObject !== undefined"
                class="item"
            >
                Object: <strong>{{ remote.RemoteObject }}</strong>
            </div>
            <div
                v-if="remote.RemoteSource !== undefined"
                class="item"
            >
                Source: <strong>{{ remote.RemoteSource }}</strong>
            </div>
            <div
                v-if="remote.RemoteDestination !== undefined"
                class="item"
            >
                Destination: <strong>{{ remote.RemoteDestination }}</strong>
            </div>
        </div>
        <div
            v-if="remote.RemoteQuery !== undefined"
            class="content max-height"
        >
            <h4>Remote Query</h4>
            <div>
                <sql-string :sql="remote.RemoteQuery" />
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import { RelOp, Remote, ExpandedComputedColumn } from 'showplan-js';
import SqlString from './SqlString.vue';

@Component({
    components: { SqlString },
})
export default class RemoteView extends Vue {
  @Prop() public operation!: RelOp;

  private get remote(): Remote {
      return this.operation.Action as Remote;
  }

  private get expandedChildColumns(): ExpandedComputedColumn[] {
      return this.operation.GetChildExpandedComputedColumns();
  }
}
</script>

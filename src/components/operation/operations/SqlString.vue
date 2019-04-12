<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-html="formatSql(sql)" />
</template>

<script lang='ts'>
import {
    Vue, Component, Prop,
} from 'vue-property-decorator';
import SqlFormatter from '@/components/formatter';

import '@/string-extensions';
import { ExpandedComputedColumn } from 'showplan-js';

@Component({
})
export default class SqlString extends Vue {
    @Prop() public sql!: string;

    @Prop() public expandedColumns!: ExpandedComputedColumn[];

    private formatSql(input: string): string {
        let sql = input.replaceAll('[.]', '^^BRACKETDOTBRACKET^^'); // if someone was referencing their local db as [.] we want to leave that
        sql = sql.replaceAll('[', '');
        sql = sql.replaceAll(']', '');
        sql = sql.replaceAll('..', '[.].');
        sql = sql.replaceAll('^^BRACKETDOTBRACKET^^', '[.]');
        sql = sql.replaceAll(',', ',\u200B');
        sql = sql.replaceAll('.', '.\u200B');
        sql = sql.replaceAll(',', ', ');
        sql = sql.replaceAll('\n', ' '); // todo - make this an option to either replace with a space or a <br />
        // todo add whitespace around operators e.g. Id<5 becomes Id < 5
        let formatted = SqlFormatter.formatSql(sql);

        if (this.expandedColumns !== undefined) {
            this.expandedColumns.forEach((column) => {
                formatted = formatted.replaceAll(column.Column, `<abbr data-title="${column.Value}">${column.Column}</abbr>`);
            });
        }

        return formatted;
    }
}
</script>

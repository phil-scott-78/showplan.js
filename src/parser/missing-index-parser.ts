import * as ShowPlan from './showplan';
import QueryHelper from './query-helper';
import Convert from './convert';

class MissingIndexParser {
    public static ParseMissingIndexes(element: Element): ShowPlan.MissingIndexes {
        const missingIndexGroupElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'MissingIndexGroup');
        const missingIndexGroups = missingIndexGroupElements.map(i => this.ParseMissingIndexGroup(i));

        return new ShowPlan.MissingIndexes(missingIndexGroups);
    }

    private static ParseMissingIndexGroup(element: Element): ShowPlan.MissingIndexGroup {
        const impact = Convert.GetFloat(element, 'Impact');
        const missingIndexElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'MissingIndex');
        const missingIndexes = missingIndexElements.map(i => this.ParseMissingIndex(i));

        return new ShowPlan.MissingIndexGroup(impact, missingIndexes);
    }

    private static ParseMissingIndex(element: Element): ShowPlan.MissingIndex {
        const database = Convert.GetString(element, 'Database');
        const schema = Convert.GetString(element, 'Schema');
        const table = Convert.GetString(element, 'Table');

        const columnGroupElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ColumnGroup');
        const columnGroups = columnGroupElements.map(i => this.ParseColumnGroup(i));

        return new ShowPlan.MissingIndex(database, schema, table, columnGroups);
    }

    private static ParseColumnGroup(element: Element): ShowPlan.ColumnGroup {
        const usage = Convert.GetString(element, 'Usage') as ShowPlan.ColumnGroupTypeUsage;
        const columnElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'Column');
        const columns = columnElements.map(i => this.ParseColumn(i));

        return new ShowPlan.ColumnGroup(usage, columns);
    }

    private static ParseColumn(element: Element): ShowPlan.Column {
        const name = Convert.GetString(element, 'Name');
        const columnId = Convert.GetInt(element, 'ColumnId');

        return new ShowPlan.Column(columnId, name);
    }
}

export default MissingIndexParser;

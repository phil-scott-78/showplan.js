import * as ShowPlan from './showplan';
import Convert from './convert';
import QueryHelper from './query-helper';
import { Grouper, Group } from './grouping';

class ColumnReferenceParser {
    public static Parse(element: Element): ShowPlan.ColumnReference {
        const column = Convert.GetString(element, 'Column');
        const columnReference = new ShowPlan.ColumnReference(column);

        columnReference.Server = Convert.GetStringOrUndefined(element, 'Server');
        columnReference.Database = Convert.GetStringOrUndefined(element, 'Database');
        columnReference.Schema = Convert.GetStringOrUndefined(element, 'Schema');
        columnReference.Table = Convert.GetStringOrUndefined(element, 'Table');
        columnReference.Alias = Convert.GetStringOrUndefined(element, 'Alias');
        columnReference.ComputedColumn = Convert.GetBooleanOrUndefined(element, 'ComputedColumn');
        columnReference.ParameterDataType = Convert.GetStringOrUndefined(element, 'ParameterDataType');
        columnReference.ParameterCompiledValue = Convert.GetStringOrUndefined(element, 'ParameterCompiledValue');
        columnReference.ParameterRuntimeValue = Convert.GetStringOrUndefined(element, 'ParameterRuntimeValue');

        // todo set InternalInfo and ScalarOperator

        return columnReference;
    }

    public static GetAllFromElement(parentElement: Element, elementName: string): ShowPlan.ColumnReference[] {
        const containerElement = QueryHelper.GetImmediateChildNodesByTagName(parentElement, elementName);
        if (containerElement.length !== 1) {
            return [];
        }

        const columnReferenceElements = QueryHelper.GetImmediateChildNodesByTagName(containerElement[0], 'ColumnReference');
        return columnReferenceElements.map(i => this.Parse(i));
    }

    public static Group(columns: ShowPlan.ColumnReference[]): Group<ShowPlan.ColumnReference>[] {
    // return groupBy(columns, (a) => a.Database + '.' + a.Schema + '.' + a.Table);
        return Grouper.groupBy<ShowPlan.ColumnReference>(columns, (a: ShowPlan.ColumnReference) => {
            if (a.Database !== undefined && a.Schema !== undefined && a.Table !== undefined) {
                let key = `${a.Database}.${a.Schema}.${a.Table}`;
                if (a.Alias !== undefined) {
                    key += ` as ${a.Alias}`;
                }

                return key;
            }

            return '';
        });
    }
}

export default ColumnReferenceParser;

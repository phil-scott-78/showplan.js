import * as ShowPlan from './showplan';
import { Convert } from './convert';
import { QueryHelper } from './query-helper';
import { ColumnReference } from './showplan';
import { Grouper, Group } from './grouping';

export class ColumnReferenceParser {
  public static Parse(element: Element): ShowPlan.ColumnReference {
    const column = Convert.GetString(element, 'Column') as string;
    const columnReference = new ShowPlan.ColumnReference(column);

    columnReference.Server = Convert.GetString(element, 'Server');
    columnReference.Database = Convert.GetString(element, 'Database');
    columnReference.Schema = Convert.GetString(element, 'Schema');
    columnReference.Table = Convert.GetString(element, 'Table');
    columnReference.Alias = Convert.GetString(element, 'Alias');
    columnReference.ComputedColumn = Convert.GetBoolean(element, 'ComputedColumn');
    columnReference.ParameterDataType = Convert.GetString(element, 'ParameterDataType');
    columnReference.ParameterCompiledValue = Convert.GetString(element, 'ParameterCompiledValue');
    columnReference.ParameterRuntimeValue = Convert.GetString(element, 'ParameterRuntimeValue');

    // todo set InternalInfo and ScalarOperator

    return columnReference;
  }

  public static GetAllFromElement(parentElement: Element, elementName: string): ShowPlan.ColumnReference[] {
    const containerElement = QueryHelper.GetImmediateChildNodesByTagName(parentElement, elementName);
    if (containerElement.length !== 1) {
      return [];
    }

    const columnReferenceElements = QueryHelper.GetImmediateChildNodesByTagName(containerElement[0], 'ColumnReference');
    return columnReferenceElements.map((i) => this.Parse(i));
  }

  public static Group(columns: ShowPlan.ColumnReference[]): Array<Group<ColumnReference>> {
    // return groupBy(columns, (a) => a.Database + '.' + a.Schema + '.' + a.Table);
    return Grouper.groupBy<ColumnReference>(columns, (a: ShowPlan.ColumnReference) => {
      if (a.Database !== undefined && a.Schema !== undefined && a.Table !== undefined) {
        let key = a.Database + '.' + a.Schema + '.' + a.Table;
        if (a.Alias !== undefined) {
          key += ' as ' + a.Alias;
        }

        return key;
      }

      return '';
    });
  }

}

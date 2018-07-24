import * as ShowPlan from './showplan';
import { Convert } from './convert';
import { QueryHelper } from './query-helper';

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
}

import * as ShowPlan from './showplan';
import { Convert } from './convert';

export class ObjectParser {
  public static Parse(element: Element): ShowPlan.ObjectType {
    const object = new ShowPlan.ObjectType();
    object.Server = Convert.GetString(element, 'Server');
    object.Database = Convert.GetString(element, 'Database');
    object.Schema = Convert.GetString(element, 'Schema');
    object.Table = Convert.GetString(element, 'Table');
    object.Index = Convert.GetString(element, 'Index');
    object.Filtered = Convert.GetBoolean(element, 'Filtered');
    object.Alias = Convert.GetString(element, 'Alias');
    object.TableReferenceId = Convert.GetInt(element, 'TableReferenceId');

    object.IndexKind = Convert.GetString(element, 'IndexKind') as ShowPlan.IndexKindType;
    object.CloneAccessScope = Convert.GetString(element, 'CloneAccessScope') as ShowPlan.CloneAccessScope;
    object.Storage = Convert.GetString(element, 'Storage') as ShowPlan.StorageType;

    return object;
  }
}

import * as ShowPlan from './showplan';
import Convert from './convert';

class ObjectParser {
    public static Parse(element: Element): ShowPlan.ObjectType {
        const object = new ShowPlan.ObjectType();
        object.Server = Convert.GetStringOrUndefined(element, 'Server');
        object.Database = Convert.GetStringOrUndefined(element, 'Database');
        object.Schema = Convert.GetStringOrUndefined(element, 'Schema');
        object.Table = Convert.GetStringOrUndefined(element, 'Table');
        object.Index = Convert.GetStringOrUndefined(element, 'Index');
        object.Filtered = Convert.GetBooleanOrUndefined(element, 'Filtered');
        object.Alias = Convert.GetStringOrUndefined(element, 'Alias');
        object.TableReferenceId = Convert.GetIntOrUndefined(element, 'TableReferenceId');

        object.IndexKind = Convert.GetStringOrUndefined(element, 'IndexKind') as ShowPlan.IndexKindType;
        object.CloneAccessScope = Convert.GetStringOrUndefined(element, 'CloneAccessScope') as ShowPlan.CloneAccessScope;
        object.Storage = Convert.GetStringOrUndefined(element, 'Storage') as ShowPlan.StorageType;

        return object;
    }
}

export default ObjectParser;

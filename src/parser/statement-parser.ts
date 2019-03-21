import * as ShowPlan from './showplan';
import QueryPlanParser from './query-plan-parser';

class StatementParser {
    public ParseUseDb(element: Element): ShowPlan.StmtUseDb {
        const database = element.getAttribute('Database') || '(unknown)';
        return new ShowPlan.StmtUseDb(database);
    }

    public ParseStmtSimple(element: Element): ShowPlan.StmtSimple {
        const statement = new ShowPlan.StmtSimple();
        const queryPlan = element.getElementsByTagName('QueryPlan');
        const udf = element.getElementsByTagName('UDF');
        const storedProc = element.getElementsByTagName('StoredProc');

        if (queryPlan.length > 0) {
            statement.QueryPlan = QueryPlanParser.Parse(queryPlan[0] as Element);
        }
        if (udf.length > 0) { statement.UDF = this.ParseUDF(); }
        if (storedProc.length > 0) { statement.StoredProc = this.ParseStoredProc(); }
        return statement;
    }

    private ParseUDF(): ShowPlan.FunctionPlan[] {
        return [];
    }

    private ParseStoredProc(): ShowPlan.FunctionPlan | undefined {
        return undefined;
    }
}

export default StatementParser;

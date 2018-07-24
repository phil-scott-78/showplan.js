import * as ShowPlan from './showplan';
import { QueryPlanParser } from './query-plan-parser';

export class StatementParser {
  public static ParseUseDb(element: Element): ShowPlan.StmtUseDb {
    const database = element.getAttribute('Database') || '(unknown)';
    return new ShowPlan.StmtUseDb(database);
  }

  public static ParseStmtSimple(element: Element): ShowPlan.StmtSimple {
    const statement = new ShowPlan.StmtSimple();
    const queryPlan = element.getElementsByTagName('QueryPlan');
    const udf = element.getElementsByTagName('UDF');
    const storedProc = element.getElementsByTagName('StoredProc');

    if (queryPlan.length > 0) {
      statement.QueryPlan = QueryPlanParser.Parse(queryPlan[0] as Element);
    }
    if (udf.length > 0) { statement.UDF = this.ParseUDF(udf); }
    if (storedProc.length > 0) { statement.StoredProc = this.ParseStoredProc(storedProc[0]); }
    return statement;
  }

  private static ParseUDF(udf: NodeListOf<Element>) {
    return [];
  }

  private static ParseStoredProc(storedProcElement: Node) {
    return undefined;
  }
}

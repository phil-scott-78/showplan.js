import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('table-valued-function.sqlplan', () => {
  const file = 'tests/unit/plan-parser/plans/table-valued-function.sqlplan';
  let plan: ShowPlan.ShowPlanXML;

  before(function() {
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);
  });

  it('can parse', () => {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const tbfOp = statement.QueryPlan!.RelOp.Action.RelOp[0];
    expect(tbfOp.LogicalOp).to.equal('Table-valued function');
    expect(tbfOp.PhysicalOp).to.equal('Table-valued function');
    expect(tbfOp.Action).to.be.instanceof(ShowPlan.TableValuedFunction);

    const tbf = tbfOp.Action as ShowPlan.TableValuedFunction;
    expect(tbf.Object!.Table).to.equal('[UsersWithMorePostsThan]');
    expect(tbf.ParameterList!.ScalarOperator).to.have.length(1);
    expect(tbf.ParameterList!.ScalarOperator[0].ScalarString).to.equal('(10)');
  });
});

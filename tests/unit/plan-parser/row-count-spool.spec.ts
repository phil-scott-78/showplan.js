import { ShowPlanParser } from '../../../src/parser/showplan-parser';
import * as ShowPlan from '../../../src/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('row-count-spool.sqlplan', function() {
  it('can parse', function() {
    const file = 'tests/unit/plan-parser/plans/row-count-spool.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const op = showplan.QueryPlan!.RelOp.Action
      .RelOp[1];

    expect(op.LogicalOp).to.equal('Lazy Spool');
    expect(op.PhysicalOp).to.equal('Row Count Spool');
    expect(op.Action).to.be.instanceof(ShowPlan.Spool);
  });
});

import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('inserted-deleted.sqlplan', function() {
  let plan: ShowPlan.ShowPlanXML;

  before(function() {
    const file = 'tests/unit/plan-parser/plans/inserted-deleted-scan.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);
  });

  it('first statement can parse', function() {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    expect(statement.QueryPlan!.RelOp.PhysicalOp).to.equal('Table Update');
    expect(statement.QueryPlan!.RelOp.Action).to.be.instanceof(ShowPlan.Update);
  });

  it('second statement can parse as inserted scan', function() {
    const statement = plan.Batches[1].Statements[0] as ShowPlan.StmtSimple;
    const op = statement.QueryPlan!
      .RelOp.Action // compute scalar
      .RelOp[0].Action // compute scalar
      .RelOp[0].Action // streamaggregate
      .RelOp[0];

    expect(op.PhysicalOp).to.equal('Inserted Scan');
    expect(op.Action).to.be.instanceof(ShowPlan.Rowset);
  });

  it('third statement can parse as deleted scan', function() {
    const statement = plan.Batches[2].Statements[0] as ShowPlan.StmtSimple;
    const op = statement.QueryPlan!
      .RelOp.Action // compute scalar
      .RelOp[0].Action // compute scalar
      .RelOp[0].Action // streamaggregate
      .RelOp[0];

    expect(op.PhysicalOp).to.equal('Deleted Scan');
    expect(op.Action).to.be.instanceof(ShowPlan.Rowset);
  });
});

import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('merge-interval-constant-scan.sqlplan', function() {
  it('can parse', function() {
    const file = 'tests/unit/plan-parser/plans/merge-interval-constant-scan.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const mergeOp = showplan.QueryPlan!
      .RelOp.Action // nested join
      .RelOp[0];

    expect(mergeOp.PhysicalOp).to.equal('Merge Interval');
    expect(mergeOp.Action).to.be.instanceof(ShowPlan.SimpleIteratorOneChild);

    const concat = mergeOp.Action
      .RelOp[0].Action // sort
      .RelOp[0].Action // compute scalar
      .RelOp[0];

    expect(concat.Action).to.be.instanceof(ShowPlan.Concat);
    const constantScanOp = concat.Action.RelOp[0].Action.RelOp[0];
    expect(constantScanOp.PhysicalOp).to.equal('Constant Scan');
    expect(constantScanOp.Action).to.be.instanceof(ShowPlan.ConstantScan);

  });
});

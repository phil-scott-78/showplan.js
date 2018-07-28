import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('How many upvotes do I have for each tag.sqlplan', function() {
  it('can parse', function() {
    const file = 'tests/unit/plan-parser/plans/How many upvotes do I have for each tag.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const op = showplan.QueryPlan!.RelOp.Action
      .RelOp[0].Action // parallelism
      .RelOp[0].Action // compute scalar
      .RelOp[0].Action // stream aggregate
      .RelOp[0].Action // sort
      .RelOp[0].Action // parallelism
      .RelOp[0].Action // hash match
      .RelOp[0];

    expect(op.LogicalOp).to.equal('Bitmap Create');
    expect(op.PhysicalOp).to.equal('Bitmap');
    expect(op.Action).to.be.instanceof(ShowPlan.Bitmap);

    const bitmap = op.Action as ShowPlan.Bitmap;
    expect(bitmap.HashKeys).to.have.length(1);
    expect(bitmap.HashKeys[0].Table).to.equal('[Posts]');
    expect(bitmap.HashKeys[0].Column).to.equal('Id');
  });
});

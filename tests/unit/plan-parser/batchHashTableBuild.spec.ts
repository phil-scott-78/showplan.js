import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';


import * as fs from 'fs';

describe('nci_plan_2012.sqlplan', function() {
  it('can parse', function() {
    const file = 'tests/unit/plan-parser/plans/nci_plan_2012.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const queryplan = showplan.QueryPlan!;
    const action = queryplan.RelOp.Action
      .RelOp[0].Action // sort
      .RelOp[0].Action // parallelism
      .RelOp[0].Action // hash match
      .RelOp[0].Action // hash match inner join
      .RelOp[0].Action // parallelism parition streams
      .RelOp[0].Action; // batch hash table build

    expect(action).to.be.instanceof(ShowPlan.BatchHashTableBuild);
    expect((action as ShowPlan.BatchHashTableBuild).BitmapCreator).to.be.true;
  });
});

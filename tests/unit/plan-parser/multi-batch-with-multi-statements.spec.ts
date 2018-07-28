import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('multi-batch-with-multi-statements.sqlplan', () => {
  const file = 'tests/unit/plan-parser/plans/multi-batch-with-multi-statements.sqlplan';
  let plan: ShowPlan.ShowPlanXML;

  before(function() {
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);
  });

  it('can parse', () => {
    expect(plan.Batches.length).to.equal(2);
    expect(plan.Batches[0].Statements).to.have.length(3);
    expect(plan.Batches[1].Statements).to.have.length(2);
    expect(plan.Batches[0].Statements[0]).instanceof(ShowPlan.StmtUseDb);
    expect(plan.Batches[0].Statements[1]).instanceof(ShowPlan.StmtSimple);

    const useDbStatement = (plan.Batches[0].Statements[0] as ShowPlan.StmtUseDb);
    expect(useDbStatement.Database).to.equal('[StackOverflowMovies]');

    const statementSimple = (plan.Batches[0].Statements[1] as ShowPlan.StmtSimple);
    expect(statementSimple.CostPercentOfBatch()).to.equal(.5);
    expect(statementSimple.QueryPlan!.RelOp.Action).instanceof(ShowPlan.Top);
  });
});

import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('estimated-execution-plan.sqlplan', () => {
  it('is estimated', () => {
    const file = 'tests/unit/plan-parser/plans/estimated-execution-plan.sqlplan';
    let plan: ShowPlan.ShowPlanXML;
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);

    expect(plan.IsEstimatedPlan()).to.be.true;
  });
});

describe('actual-execution-plan.sqlplan', () => {
  it('is estimated', () => {
    const file = 'tests/unit/plan-parser/plans/actual-execution-plan.sqlplan';
    let plan: ShowPlan.ShowPlanXML;
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);

    expect(plan.IsEstimatedPlan()).to.be.false;
  });
});

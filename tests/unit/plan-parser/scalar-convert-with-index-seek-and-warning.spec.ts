import { ShowPlanParser } from '../../../src/parser/showplan-parser';
import * as ShowPlan from '../../../src/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('scalar-convert-with-index-seek-and-warning.sqlplan', () => {
  const file = 'tests/unit/plan-parser/plans/scalar-convert-with-index-seek-and-warning.sqlplan';
  let plan: ShowPlan.ShowPlanXML;

  before(function() {
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);
  });

  it('can parse', () => {
    expect((plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).StatementSubTreeCost)
      .to.equal(.0032833);
  });
});

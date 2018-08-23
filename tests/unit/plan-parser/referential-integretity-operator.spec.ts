import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';


import * as fs from 'fs';

describe('referential-integretity-operator.sqlplan', () => {
  const file = 'tests/unit/plan-parser/plans/referential-integretity-operator.sqlplan';
  let plan: ShowPlan.ShowPlanXML;

  before(function() {
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);
  });

  it('first operation is a nested loop', function() {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const op = statement.QueryPlan!.RelOp;
    expect(op.LogicalOp).to.equal('Foreign Key References Check');
    expect(op.PhysicalOp).to.equal('Foreign Key References Check');
    expect(op.Action).to.be.instanceof(ShowPlan.ForeignKeyReferencesCheck);

    const check = op.Action as ShowPlan.ForeignKeyReferencesCheck;
    expect(check.ForeignKeyReferenceCheck).to.have.length(1);
    expect(check.ForeignKeyReferenceCheck[0].IndexScan.Object[0].IndexKind).to.equal('Heap');
  });
});

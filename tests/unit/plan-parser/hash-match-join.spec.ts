import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('hash-match-join.sqlplan', () => {
  const file = 'tests/unit/plan-parser/plans/hash-match-join.sqlplan';
  let plan: ShowPlan.ShowPlanXML;

  before(function() {
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);
  });

  it('can parse', () => {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;

    expect(statement.QueryPlan!.RelOp.PhysicalOp).to.equal('Filter');
    expect(statement.QueryPlan!.RelOp.Action).to.be.instanceof(ShowPlan.Filter);

    const filter = statement.QueryPlan!.RelOp.Action as ShowPlan.Filter;
    expect(filter.Predicate.ScalarOperator.ScalarString).to.equal('[Expr1004]>(500)');
    expect(filter.RelOp[0].Action).to.be.instanceof(ShowPlan.Hash);

    const hash = filter.RelOp[0].Action as ShowPlan.Hash;
    expect(hash.RelOp).to.have.length(2);
    expect(hash.HashKeysBuild![0].Column).to.equal('OwnerUserId');
    expect(hash.HashKeysProbe![0].Column).to.equal('Id');
    expect(hash.ProbeResidual!.ScalarOperator.ScalarString).to.equal('[StackOverflowMovies].[dbo].[Posts].[OwnerUserId]=[StackOverflowMovies].[dbo].[Users].[Id]');
    expect(hash.RelOp[0].Action).to.be.instanceof(ShowPlan.ComputeScalar);
    expect(hash.RelOp[1].Action).to.be.instanceof(ShowPlan.IndexScan);
    expect(hash.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Hash);
    expect(hash.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.IndexScan);
  });
});

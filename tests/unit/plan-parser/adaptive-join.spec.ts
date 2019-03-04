import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';


import * as fs from 'fs';

describe('adaptive-join.sqlplan', function() {
  it('can parse', function() {
    const file = 'tests/unit/plan-parser/plans/adaptive-join.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    expect(showplan.QueryPlan!.RelOp.Action).to.be.instanceof(ShowPlan.AdaptiveJoin);

    const adaptiveJoin = showplan.QueryPlan!.RelOp.Action as ShowPlan.AdaptiveJoin;

    expect(showplan.QueryPlan!.RelOp.AdaptiveThresholdRows).to.equal(11.4837);
    expect(showplan.QueryPlan!.RelOp.EstimatedJoinType).to.equal('Hash Match');
    expect(showplan.QueryPlan!.RelOp.RunTimeInformation!.RunTimeCountersPerThread[0].ActualJoinType).to.equal('Hash Match');
    expect(adaptiveJoin.HashKeysBuild![0].Column).to.equal('ProductID');
    expect(adaptiveJoin.HashKeysBuild![0].Table).to.equal('[TransactionHistory]');
    expect(adaptiveJoin.HashKeysProbe![0].Column).to.equal('ProductID');
    expect(adaptiveJoin.HashKeysProbe![0].Table).to.equal('[Product]');
    expect(adaptiveJoin.OuterReferences![0].Table).to.equal('[TransactionHistory]');
    expect(adaptiveJoin.OuterReferences![0].Column).to.equal('ProductID');
    expect(adaptiveJoin.Optimized).to.be.false;
    expect(adaptiveJoin.RelOp).to.have.length(3);
    expect(adaptiveJoin.DefinedValues).to.have.length(5);
    expect(adaptiveJoin.RelOp[0].Action).to.be.instanceof(ShowPlan.ComputeScalar);
    expect(adaptiveJoin.RelOp[1].Action).to.be.instanceof(ShowPlan.Filter);
    expect(adaptiveJoin.RelOp[2].Action).to.be.instanceof(ShowPlan.IndexScan);
  });
});

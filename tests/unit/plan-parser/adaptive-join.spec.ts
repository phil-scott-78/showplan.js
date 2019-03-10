import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('adaptive-join.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/adaptive-join.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(showplan.QueryPlan!.RelOp.Action).toBeInstanceOf(ShowPlan.AdaptiveJoin);

        const adaptiveJoin = showplan.QueryPlan!.RelOp.Action as ShowPlan.AdaptiveJoin;

        expect(showplan.QueryPlan!.RelOp.AdaptiveThresholdRows).toBe(11.4837);
        expect(showplan.QueryPlan!.RelOp.EstimatedJoinType).toBe('Hash Match');
        expect(showplan.QueryPlan!.RelOp.RunTimeInformation!.RunTimeCountersPerThread[0].ActualJoinType).toBe('Hash Match');
        expect(adaptiveJoin.HashKeysBuild![0].Column).toBe('ProductID');
        expect(adaptiveJoin.HashKeysBuild![0].Table).toBe('[TransactionHistory]');
        expect(adaptiveJoin.HashKeysProbe![0].Column).toBe('ProductID');
        expect(adaptiveJoin.HashKeysProbe![0].Table).toBe('[Product]');
        expect(adaptiveJoin.OuterReferences![0].Table).toBe('[TransactionHistory]');
        expect(adaptiveJoin.OuterReferences![0].Column).toBe('ProductID');
        expect(adaptiveJoin.Optimized).toBe(false);
        expect(adaptiveJoin.RelOp).toHaveLength(3);
        expect(adaptiveJoin.DefinedValues).toHaveLength(5);
        expect(adaptiveJoin.RelOp[0].Action).toBeInstanceOf(ShowPlan.ComputeScalar);
        expect(adaptiveJoin.RelOp[1].Action).toBeInstanceOf(ShowPlan.Filter);
        expect(adaptiveJoin.RelOp[2].Action).toBeInstanceOf(ShowPlan.IndexScan);
    });
});

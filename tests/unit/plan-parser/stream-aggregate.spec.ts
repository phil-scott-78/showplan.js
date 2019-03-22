import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('stream-aggregate-with-rollup.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/stream-aggregate-with-rollup.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const allOps = showplan.QueryPlan!.getFlattenRelOps();
        const streamAgg = allOps.find(i => i.NodeId === 2)!;
        expect(streamAgg.LogicalOp).toBe('Aggregate');
        expect(streamAgg.Action).toBeInstanceOf(ShowPlan.StreamAggregate);

        const streamAggregateOp = streamAgg.Action as ShowPlan.StreamAggregate;
        expect(streamAggregateOp.RollupInfo).toBeDefined();
        expect(streamAggregateOp.RollupInfo!.HighestLevel).toBe(4);
        expect(streamAggregateOp.RollupInfo!.RollupLevel).toHaveLength(5);
        expect(streamAggregateOp.RollupInfo!.RollupLevel[0].Level).toBe(0);
        expect(streamAggregateOp.RollupInfo!.RollupLevel[1].Level).toBe(1);
    });
});

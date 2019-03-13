import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('help functions', () => {
    test('can flatten out a query plan', () => {
        const file = 'tests/unit/plan-parser/plans/adaptive-join.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const queryplan = showplan.QueryPlan!;

        const flatten = queryplan.getFlattenRelOps();
        expect(flatten).toHaveLength(7);
        expect(flatten.find(i => i.NodeId === 1)!.LogicalOp).toBe('Inner Join');
        expect(flatten.find(i => i.NodeId === 3)!.LogicalOp).toBe('Compute Scalar');
    });
});

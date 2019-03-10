import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('index-insert-create.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/index-insert-create.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const op = showplan.QueryPlan!.RelOp;
        expect(op.LogicalOp).toBe('Insert');
        expect(op.PhysicalOp).toBe('Index Insert');

        const createIndex = op.Action as ShowPlan.CreateIndex;
        expect(createIndex.Object).toHaveLength(1);
        expect(createIndex.Object[0].Index).toBe('[IX_WikiPostId]');
        expect(createIndex.Object[0].IndexKind).toBe('NonClustered');
    });
});

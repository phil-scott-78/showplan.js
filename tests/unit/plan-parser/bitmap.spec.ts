import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('How many upvotes do I have for each tag.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/How many upvotes do I have for each tag.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const op = showplan.QueryPlan!.RelOp.Action
            .RelOp[0].Action // parallelism
            .RelOp[0].Action // compute scalar
            .RelOp[0].Action // stream aggregate
            .RelOp[0].Action // sort
            .RelOp[0].Action // parallelism
            .RelOp[0].Action // hash match
            .RelOp[0];

        expect(op.LogicalOp).toBe('Bitmap Create');
        expect(op.PhysicalOp).toBe('Bitmap');
        expect(op.Action).toBeInstanceOf(ShowPlan.Bitmap);

        const bitmap = op.Action as ShowPlan.Bitmap;
        expect(bitmap.HashKeys).toHaveLength(1);
        expect(bitmap.HashKeys[0].Table).toBe('[Posts]');
        expect(bitmap.HashKeys[0].Column).toBe('Id');
    });
});

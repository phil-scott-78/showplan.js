import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('Parallism', () => {
    test('is parallel is set correctly', () => {
        const file = 'tests/unit/plan-parser/plans/How many upvotes do I have for each tag.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const ops = showplan.QueryPlan!.getFlattenRelOps();
        const sortOp = ops.find(i => i.NodeId === 0)!;

        expect(sortOp.Parallel).toBeFalsy();

        const parallelOp = ops.find(i => i.NodeId === 13)!;
        expect(showplan.QueryPlan!.DegreeOfParallelism).toBe(8);
        expect(parallelOp.Parallel).toBeTruthy();
        expect(parallelOp.RunTimeInformation).toBeDefined();
        expect(parallelOp.RunTimeInformation!.RunTimeCountersPerThread).toHaveLength(9);
    });
});

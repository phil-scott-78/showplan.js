import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('Parallism', () => {
    let allOperations: ShowPlan.RelOp[];
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const file = 'tests/unit/plan-parser/plans/parallelism.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
        allOperations = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!.getFlattenRelOps();
    });

    test('is parallel is set correctly', () => {
        const top = allOperations.find(i => i.NodeId === 0)!;
        expect(top.Parallel).toBeFalsy();

        const parallelOp = allOperations.find(i => i.NodeId === 1)!;
        expect(parallelOp.Parallel).toBeTruthy();
    });

    test('partitioned columns and predicate are set', () => {
        const parallelOp = allOperations.find(i => i.NodeId === 37)!;
        expect(parallelOp.LogicalOp).toBe('Repartition Streams');
        expect(parallelOp.RunTimeInformation!.RunTimeCountersPerThread.length).toBe(8);
        const parallel = parallelOp.Action as ShowPlan.Parallelism;
        expect(parallel.PartitionColumns).toHaveLength(3);
        expect(parallel.PartitionColumns![0].Column).toBe('Column5');
        expect(parallel.Predicate!.ScalarOperator.ScalarString).toBe('ScalarString12');
    });

    test('order by is set', () => {
        const parallelOp = allOperations.find(i => i.NodeId === 1)!;
        expect(parallelOp.LogicalOp).toBe('Gather Streams');
        const parallel = parallelOp.Action as ShowPlan.Parallelism;
        expect(parallel.OrderBy).toBeDefined();
        expect(parallel.OrderBy!.OrderByColumn[0].ColumnReference.Column).toBe('Column10');
        expect(parallelOp.RunTimeInformation!.RunTimeCountersPerThread.length).toBe(1);
    });
});

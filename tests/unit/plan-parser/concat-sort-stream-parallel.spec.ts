import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('concat-sort-stream-parallel.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/concat-sort-stream-parallel.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('has missing indexes', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        expect(queryplan.MissingIndexes!.MissingIndexGroup).toHaveLength(1);
        expect(queryplan.MissingIndexes!.MissingIndexGroup[0].Impact).toBe(97.4822);
        expect(queryplan.MissingIndexes!.MissingIndexGroup[0].MissingIndex).toHaveLength(1);
        expect(queryplan.MissingIndexes!.MissingIndexGroup[0].MissingIndex[0].ColumnGroup).toHaveLength(2);
        const columnGroup = queryplan.MissingIndexes!.MissingIndexGroup[0].MissingIndex[0].ColumnGroup;
        expect(columnGroup[0].Usage).toBe('INEQUALITY');
        expect(columnGroup[0].Column[0].Name).toBe('[OwnerUserId]');
        expect(columnGroup[1].Usage).toBe('INCLUDE');
        expect(columnGroup[1].Column[0].Name).toBe('[Title]');
    });

    test('has memory grant info', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const memorygrant = queryplan.MemoryGrantInfo!;
        expect(memorygrant.SerialRequiredMemory).toBe(640);
        expect(memorygrant.SerialDesiredMemory).toBe(2720);
    });

    test('has optimizer hardware dependent properties', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const props = queryplan.OptimizerHardwareDependentProperties!;
        expect(props.EstimatedAvailableMemoryGrant).toBe(209144);
    });

    test('has optimizer stats usage', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.OptimizerStatsUsage!;
        expect(stats.StatisticsInfo).toHaveLength(8);
        expect(stats.StatisticsInfo[0].Statistics).toBe('[_WA_Sys_00000002_412EB0B6]');
        expect(stats.StatisticsInfo[0].SamplingPercent).toBe(22.9745);
    });

    test('has wait stats', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.WaitStats!;
        expect(stats.Wait).toHaveLength(4);
        expect(stats.Wait![0].WaitType).toBe('CMEMTHREAD');
        expect(stats.Wait![0].WaitTimeMs).toBe(1);
        expect(stats.Wait![0].WaitCount).toBe(38);
    });

    test('has query time stats', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.QueryTimeStats!;
        expect(stats.CpuTime).toBe(252);
        expect(stats.ElapsedTime).toBe(322);
    });

    test('has thread stats', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.ThreadStat!;
        expect(stats.Branches).toBe(2);
        expect(stats.UsedThreads).toBe(32);
        expect(stats.ThreadReservation).toHaveLength(1);
        expect(stats.ThreadReservation![0].NodeId).toBe(0);
        expect(stats.ThreadReservation![0].ReservedThreads).toBe(32);
    });

    test('first operation is Parallelism', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        expect(queryplan.RelOp.Action).toBeInstanceOf(ShowPlan.Parallelism);
        expect(queryplan.RelOp.PhysicalOp).toBe('Parallelism');
        expect(queryplan.RelOp.LogicalOp).toBe('Gather Streams');
    });

    test('second operation is Sort', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const sort = queryplan.RelOp.Action.RelOp[0].Action as ShowPlan.Sort;
        expect(sort.Distinct).toBe(true);
        expect(sort.OrderBy.OrderByColumn[0].Ascending).toBe(true);
        expect(sort.OrderBy.OrderByColumn[0].ColumnReference.Column).toBe('Union1004');
    });

    test('third operation is also Parallelism', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        expect(queryplan.RelOp.Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Parallelism);

        const parallel = queryplan.RelOp.Action.RelOp[0].Action.RelOp[0];
        expect(parallel.LogicalOp).toBe('Repartition Streams');
        const parallelAction = parallel.Action as ShowPlan.Parallelism;
        expect(parallelAction.PartitioningType).toBe('Hash');
        expect(parallelAction.PartitionColumns).toHaveLength(1);
    });

    test('fourth operation is StreamAggregate', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const action = queryplan.RelOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action;
        expect(action).toBeInstanceOf(ShowPlan.StreamAggregate);

        const streamAggregate = action as ShowPlan.StreamAggregate;
        expect(streamAggregate.GroupBy![0].Column).toBe('Union1004');
    });

    test('fifth operation is a sort', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const action = queryplan
            .RelOp.Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action;

        expect(action).toBeInstanceOf(ShowPlan.Sort);
        const sort = action as ShowPlan.Sort;
        expect(sort.OrderBy.OrderByColumn[0].ColumnReference.Column).toBe('Union1004');
    });

    test('sixth operation is Concat', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const action = queryplan
            .RelOp.Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action;

        expect(action).toBeInstanceOf(ShowPlan.Concat);
        const concat = action as ShowPlan.Concat;
        expect(concat.RelOp).toHaveLength(2);
        expect(concat.RelOp[0].Action).toBeInstanceOf(ShowPlan.IndexScan);
        expect(concat.RelOp[1].Action).toBeInstanceOf(ShowPlan.IndexScan);

        const usersScan = concat.RelOp[0].Action as ShowPlan.IndexScan;
        const postsScan = concat.RelOp[1].Action as ShowPlan.IndexScan;

        expect(usersScan.Object[0].Table!).toBe('[Users]');
        expect(usersScan.Object[0].Index!).toBe('[PK_Users_Id]');
        expect(postsScan.Object[0].Table!).toBe('[Posts]');
        expect(postsScan.Object[0].Index!).toBe('[PK_Posts__Id]');
    });
});

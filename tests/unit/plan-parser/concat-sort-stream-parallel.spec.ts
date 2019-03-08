import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('concat-sort-stream-parallel.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/concat-sort-stream-parallel.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('has missing indexes', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        expect(queryplan.MissingIndexes!.MissingIndexGroup).to.have.length(1);
        expect(queryplan.MissingIndexes!.MissingIndexGroup[0].Impact).to.equal(97.4822);
        expect(queryplan.MissingIndexes!.MissingIndexGroup[0].MissingIndex).to.have.length(1);
        expect(queryplan.MissingIndexes!.MissingIndexGroup[0].MissingIndex[0].ColumnGroup).to.have.length(2);
        const columnGroup = queryplan.MissingIndexes!.MissingIndexGroup[0].MissingIndex[0].ColumnGroup;
        expect(columnGroup[0].Usage).to.equal('INEQUALITY');
        expect(columnGroup[0].Column[0].Name).to.equal('[OwnerUserId]');
        expect(columnGroup[1].Usage).to.equal('INCLUDE');
        expect(columnGroup[1].Column[0].Name).to.equal('[Title]');
    });

    it('has memory grant info', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const memorygrant = queryplan.MemoryGrantInfo!;
        expect(memorygrant.SerialRequiredMemory).to.equal(640);
        expect(memorygrant.SerialDesiredMemory).to.equal(2720);
    });

    it('has optimizer hardware dependent properties', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const props = queryplan.OptimizerHardwareDependentProperties!;
        expect(props.EstimatedAvailableMemoryGrant).to.equal(209144);
    });

    it('has optimizer stats usage', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.OptimizerStatsUsage!;
        expect(stats.StatisticsInfo).to.have.length(8);
        expect(stats.StatisticsInfo[0].Statistics).to.equal('[_WA_Sys_00000002_412EB0B6]');
        expect(stats.StatisticsInfo[0].SamplingPercent).to.equal(22.9745);
    });

    it('has wait stats', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.WaitStats!;
        expect(stats.Wait).to.have.length(4);
        expect(stats.Wait![0].WaitType).to.equal('CMEMTHREAD');
        expect(stats.Wait![0].WaitTimeMs).to.equal(1);
        expect(stats.Wait![0].WaitCount).to.equal(38);
    });

    it('has query time stats', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.QueryTimeStats!;
        expect(stats.CpuTime).to.equal(252);
        expect(stats.ElapsedTime).to.equal(322);
    });

    it('has thread stats', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const stats = queryplan.ThreadStat!;
        expect(stats.Branches).to.equal(2);
        expect(stats.UsedThreads).to.equal(32);
        expect(stats.ThreadReservation).to.have.length(1);
        expect(stats.ThreadReservation![0].NodeId).to.equal(0);
        expect(stats.ThreadReservation![0].ReservedThreads).to.equal(32);
    });

    it('first operation is Parallelism', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        expect(queryplan.RelOp.Action).to.be.instanceof(ShowPlan.Parallelism);
        expect(queryplan.RelOp.PhysicalOp).to.equal('Parallelism');
        expect(queryplan.RelOp.LogicalOp).to.equal('Gather Streams');
        expect(queryplan.RelOp.Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Sort);
    });

    it('second operation is Sort', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const sort = queryplan.RelOp.Action.RelOp[0].Action as ShowPlan.Sort;
        expect(sort.Distinct).to.be.true;
        expect(sort.OrderBy.OrderByColumn[0].Ascending).to.be.true;
        expect(sort.OrderBy.OrderByColumn[0].ColumnReference.Column).to.equal('Union1004');
    });

    it('third operation is also Parallelism', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        expect(queryplan.RelOp.Action.RelOp[0].Action.RelOp[0].Action)
            .to.be.instanceof(ShowPlan.Parallelism);
    });

    it('fourth operation is StreamAggregate', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const action = queryplan.RelOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action;
        expect(action).to.be.instanceof(ShowPlan.StreamAggregate);

        const streamAggregate = action as ShowPlan.StreamAggregate;
        expect(streamAggregate.GroupBy![0].Column).to.equal('Union1004');
    });

    it('fifth operation is a sort', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const action = queryplan
            .RelOp.Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action;

        expect(action).to.be.instanceof(ShowPlan.Sort);
        const sort = action as ShowPlan.Sort;
        expect(sort.OrderBy.OrderByColumn[0].ColumnReference.Column).to.equal('Union1004');
    });

    it('sixth operation is Concat', () => {
        const queryplan = (plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).QueryPlan!;
        const action = queryplan
            .RelOp.Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action;

        expect(action).to.be.instanceof(ShowPlan.Concat);
        const concat = action as ShowPlan.Concat;
        expect(concat.RelOp).to.have.length(2);
        expect(concat.RelOp[0].Action).to.be.instanceof(ShowPlan.IndexScan);
        expect(concat.RelOp[1].Action).to.be.instanceof(ShowPlan.IndexScan);

        const usersScan = concat.RelOp[0].Action as ShowPlan.IndexScan;
        const postsScan = concat.RelOp[1].Action as ShowPlan.IndexScan;

        expect(usersScan.Object[0].Table!).to.equal('[Users]');
        expect(usersScan.Object[0].Index!).to.equal('[PK_Users_Id]');
        expect(postsScan.Object[0].Table!).to.equal('[Posts]');
        expect(postsScan.Object[0].Index!).to.equal('[PK_Posts__Id]');
    });
});

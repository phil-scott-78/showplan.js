import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('simple-index-seek.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/simple-index-seek.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(statement.StatementSubTreeCost).toBe(0.0032831);
        expect(statement.QueryPlan!.RelOp.EstimateIO).toBe(0.003125);
        expect(statement.QueryPlan!.RelOp.EstimateCPU).toBe(0.0001581);
        expect(statement.QueryPlan!.RelOp.PhysicalOp).toBe('Clustered Index Seek');
        expect(statement.QueryPlan!.RelOp.LogicalOp).toBe('Clustered Index Seek');
        expect(statement.QueryPlan!.RelOp.OutputList).toHaveLength(20);

        const columnReference = statement.QueryPlan!.RelOp.OutputList[0];
        expect(columnReference.Database).toBe('[StackOverflowMovies]');
        expect(columnReference.Schema).toBe('[dbo]');
        expect(columnReference.Table).toBe('[Posts]');
        expect(columnReference.Column).toBe('Id');
        expect(columnReference.toString()).toBe('[StackOverflowMovies].[dbo].[Posts].Id');

        const indexScan = statement.QueryPlan!.RelOp.Action as ShowPlan.IndexScan;
        expect(indexScan.Ordered).toBe(true);
        expect(indexScan.ScanDirection).toBe('FORWARD');
    });
});

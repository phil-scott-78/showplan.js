import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('viewclustered-index-seek.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/viewclustered-index-seek.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;

        expect(statement.QueryPlan!.RelOp.OutputList).toHaveLength(2);

        const indexScan = statement.QueryPlan!.RelOp.Action as ShowPlan.IndexScan;
        expect(indexScan.Object[0].Table).toBe('[vUsersWithPostCount]');
        expect(indexScan.Object[0].IndexKind).toBe('ViewClustered');
        expect(indexScan.IndexedViewInfo).toHaveLength(2);
        expect(indexScan.IndexedViewInfo![0].Database).toBe('[StackOverflowMovies]');
        expect(indexScan.IndexedViewInfo![0].Schema).toBe('[dbo]');
        expect(indexScan.IndexedViewInfo![0].Table).toBe('[Users]');
        expect(indexScan.IndexedViewInfo![1].Table).toBe('[Posts]');
    });
});

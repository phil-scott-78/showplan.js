import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import ColumnReferenceParser from '@/parser/column-reference-parser';
import * as fs from 'fs';

describe('nested-loops.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/nested-loops.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('first operation is a nested loop', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(statement.QueryPlan!.RelOp.Action).toBeInstanceOf(ShowPlan.NestedLoops);

        const nestedLoops = statement.QueryPlan!.RelOp.Action as ShowPlan.NestedLoops;
        expect(nestedLoops.RelOp).toHaveLength(2);

        expect(nestedLoops.OuterReferences![0].Column).toBe('OwnerUserId');
    });

    test('predicate is parsed correctly', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const action = statement.QueryPlan!.RelOp.Action
            .RelOp[1].Action as ShowPlan.IndexScan;

        expect(action.SeekPredicates!.SeekPredicateNew).toHaveLength(1);
        expect(action.SeekPredicates!.SeekPredicateNew![0].SeekKeys[0].Prefix!.RangeColumns[0].Column).toBeDefined();
    });

    test('can group columnreferences', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const columns = statement.QueryPlan!.RelOp.OutputList;
        const grouping = ColumnReferenceParser.Group(columns);
        expect(grouping).toBeDefined();
        expect(grouping).toHaveLength(2);
        expect(grouping[0].key).toBe('[StackOverflowMovies].[dbo].[Posts]');
        expect(grouping[0].members).toHaveLength(20);
        expect(grouping[1].key).toBe('[StackOverflowMovies].[dbo].[Users]');
        expect(grouping[1].members).toHaveLength(14);
    });
});

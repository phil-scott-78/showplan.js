// users-with-post-count-and-comment-count
import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('compute scalar expander', () => {
    test('plans with same column redefined overwrite values properly', () => {
        const file = 'tests/unit/plan-parser/plans/update-assert-collapse-table-spool-split-merge-join.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const expanded = statement.QueryPlan!.RelOp.GetChildExpandedComputedColumns();
        expect(expanded).toHaveLength(5);
        expect(expanded[3].Column).toBe('Expr1010');
        expect(expanded[3].Value).toBe('SUM(CASE WHEN [Act1017] = (3) THEN (-1) ELSE (1) END)');

        const streamAggregate = statement.QueryPlan!.RelOp.Action
            .RelOp[1].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action
            .RelOp[0].Action.RelOp[1];

        expect(streamAggregate.LogicalOp).toBe('Aggregate');
        const aggregateExpanded = streamAggregate.ExpandedComputedColumns;
        expect(aggregateExpanded).toHaveLength(1);
        expect(aggregateExpanded[0].Column).toBe('Expr1010');
        expect(aggregateExpanded[0].Value).toBe('SUM(CASE WHEN [Act1017] = (3) THEN (-1) ELSE (1) END)');
    });

    test('can expand columns', () => {
        const file = 'tests/unit/plan-parser/plans/hash-match-join.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const expanded = statement.QueryPlan!.RelOp.GetChildExpandedComputedColumns();
        expect(expanded).toHaveLength(2);
        expect(expanded[0].Column).toBe('Expr1007');
        expect(expanded[0].Value).toBe('COUNT(*)');
        expect(expanded[1].Column).toBe('Expr1004');
        expect(expanded[1].Value).toBe('CONVERT_IMPLICIT(int,[COUNT(*)],0)');
    });
});

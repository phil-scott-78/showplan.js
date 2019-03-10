import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('multi-batch-with-multi-statements.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/multi-batch-with-multi-statements.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        expect(plan.Batches.length).toBe(1);
        expect(plan.Batches[0].Statements).toHaveLength(5);
        expect(plan.Batches[0].Statements[0]).toBeInstanceOf(ShowPlan.StmtUseDb);
        expect(plan.Batches[0].Statements[1]).toBeInstanceOf(ShowPlan.StmtSimple);

        const useDbStatement = (plan.Batches[0].Statements[0] as ShowPlan.StmtUseDb);
        expect(useDbStatement.Database).toBe('[StackOverflowMovies]');

        const statementSimple = (plan.Batches[0].Statements[1] as ShowPlan.StmtSimple);
        expect(statementSimple.QueryPlan!.CachedPlanSize).toBe(24);
        expect(statementSimple.CostPercentOfBatch()).toBe(1 / 3);
        expect(statementSimple.QueryPlan!.RelOp.Action).toBeInstanceOf(ShowPlan.Top);
    });

    test('can find by guid', () => {
        const firstGuid = plan.Batches[0].Statements[0].Guid;
        expect(plan.GetStatementByGuid(firstGuid)).toBeDefined();
        expect(plan.GetStatementByGuid('')).toBeUndefined();
    });
});

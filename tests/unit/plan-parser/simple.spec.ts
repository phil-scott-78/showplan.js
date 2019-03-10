import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('simple.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/simple.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        expect(plan.Build).toBe('14.0.1000.169');
        expect(plan.Version).toBe('1.6');
        expect(plan.Batches).toHaveLength(1);
        expect(plan.Batches[0].Statements).toHaveLength(1);
        expect(plan.Batches[0].Statements[0]).toBeInstanceOf(ShowPlan.StmtSimple);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(showplan.StatementText).toBe('select 1');
        expect(showplan.StatementType).toBe('SELECT WITHOUT QUERY');
    });
});

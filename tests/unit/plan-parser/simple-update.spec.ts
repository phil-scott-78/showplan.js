import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('simple-update.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/simple-update.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const queryplan = statement.QueryPlan!;
        expect(queryplan.RelOp.PhysicalOp).toBe('Clustered Index Update');
        expect(queryplan.RelOp.LogicalOp).toBe('Update');
        expect(queryplan.RelOp.Action).toBeInstanceOf(ShowPlan.SimpleUpdate);
    });
});

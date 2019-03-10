import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';


import * as fs from 'fs';

describe('scalar-convert-with-index-seek-and-warning.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/scalar-convert-with-index-seek-and-warning.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        expect((plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).StatementSubTreeCost).toBe(0.0032833);
    });
});

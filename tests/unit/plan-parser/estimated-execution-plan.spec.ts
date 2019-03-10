import ShowPlanParser from '@/parser/showplan-parser';
import * as fs from 'fs';

describe('estimated-execution-plan.sqlplan', () => {
    test('is estimated', () => {
        const file = 'tests/unit/plan-parser/plans/estimated-execution-plan.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        expect(plan.IsEstimatedPlan()).toBe(true);
    });
});

describe('actual-execution-plan.sqlplan', () => {
    test('is estimated', () => {
        const file = 'tests/unit/plan-parser/plans/actual-execution-plan.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        expect(plan.IsEstimatedPlan()).toBe(false);
    });
});

import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';


import * as fs from 'fs';

describe('row-count-spool.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/row-count-spool.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const op = showplan.QueryPlan!.RelOp.Action
            .RelOp[1];

        expect(op.LogicalOp).toBe('Lazy Spool');
        expect(op.PhysicalOp).toBe('Row Count Spool');
        expect(op.Action).toBeInstanceOf(ShowPlan.Spool);
    });
});

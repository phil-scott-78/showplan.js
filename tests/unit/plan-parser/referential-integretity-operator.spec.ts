import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';


import * as fs from 'fs';

describe('referential-integretity-operator.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/referential-integretity-operator.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('first operation is a nested loop', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const op = statement.QueryPlan!.RelOp;
        expect(op.LogicalOp).toBe('Foreign Key References Check');
        expect(op.PhysicalOp).toBe('Foreign Key References Check');
        expect(op.Action).toBeInstanceOf(ShowPlan.ForeignKeyReferencesCheck);

        const check = op.Action as ShowPlan.ForeignKeyReferencesCheck;
        expect(check.ForeignKeyReferenceCheck).toHaveLength(1);
        expect(check.ForeignKeyReferenceCheck[0].IndexScan.Object[0].IndexKind).toBe('Heap');
    });
});

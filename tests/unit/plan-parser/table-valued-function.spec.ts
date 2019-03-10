import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('table-valued-function.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/table-valued-function.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const tbfOp = statement.QueryPlan!.RelOp.Action.RelOp[0];
        expect(tbfOp.LogicalOp).toBe('Table-valued function');
        expect(tbfOp.PhysicalOp).toBe('Table-valued function');
        expect(tbfOp.Action).toBeInstanceOf(ShowPlan.TableValuedFunction);

        const tbf = tbfOp.Action as ShowPlan.TableValuedFunction;
        expect(tbf.Object!.Table).toBe('[UsersWithMorePostsThan]');
        expect(tbf.ParameterList!.ScalarOperator).toHaveLength(1);
        expect(tbf.ParameterList!.ScalarOperator[0].ScalarString).toBe('(10)');
    });
});

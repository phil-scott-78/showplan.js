import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('table-scan.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/table-scan.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(showplan.QueryPlan!.RelOp.Action).toBeInstanceOf(ShowPlan.TableScan);

        const tableScan = showplan.QueryPlan!.RelOp.Action as ShowPlan.TableScan;
        expect(tableScan.Ordered).toBe(false);
        expect(tableScan.ForcedIndex).toBe(false);
        expect(tableScan.ForceScan).toBe(false);
        expect(tableScan.NoExpandHint).toBe(false);
        expect(tableScan.Storage).toBe('RowStore');
    });
});

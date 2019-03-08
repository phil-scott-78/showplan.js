import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('table-scan.sqlplan', () => {
    it('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/table-scan.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(showplan.QueryPlan!.RelOp.Action).to.be.instanceof(ShowPlan.TableScan);

        const tableScan = showplan.QueryPlan!.RelOp.Action as ShowPlan.TableScan;
        expect(tableScan.Ordered).to.be.false;
        expect(tableScan.ForcedIndex).to.be.false;
        expect(tableScan.ForceScan).to.be.false;
        expect(tableScan.NoExpandHint).to.be.false;
        expect(tableScan.Storage).to.equal('RowStore');
    });
});

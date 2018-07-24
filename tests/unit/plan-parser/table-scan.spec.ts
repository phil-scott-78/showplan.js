import { ShowPlanParser } from '../../../src/parser/showplan-parser';
import * as ShowPlan from '../../../src/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('table-scan.sqlplan', function() {
  it('can parse', function() {
    const file = 'tests/unit/plan-parser/plans/table-scan.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

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

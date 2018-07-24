import { ShowPlanParser } from '../../../src/parser/showplan-parser';
import * as ShowPlan from '../../../src/parser/showplan';
import { expect } from 'chai';

// tslint:disable-next-line:no-var-requires
const fs = require('fs');

describe('window-spool-segment-sequence-project.sqlplan', function() {
  it('can parse', function() {
    const file = 'tests/unit/plan-parser/plans/window-spool-segment-sequence-project.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const queryplan = showplan.QueryPlan!;
    const windowSpool = queryplan
      .RelOp.Action // compute scalar
      .RelOp[0].Action // stream agg
      .RelOp[0]; // window spool

    expect(windowSpool.PhysicalOp).to.equal('Window Spool');
    expect(windowSpool.Action).to.be.instanceof(ShowPlan.Window);

    const segmentOp = windowSpool.Action.RelOp[0];
    expect(segmentOp.PhysicalOp).to.equal('Segment');
    expect(segmentOp.Action).to.be.instanceof(ShowPlan.Segment);

    const segment = segmentOp.Action as ShowPlan.Segment;
    expect(segment.GroupBy).to.have.length(0);
    expect(segment.SegmentColumn.Column).to.equal('Segment1005');

    const sequenceProjectOp = segment.RelOp[0];
    expect(sequenceProjectOp.PhysicalOp).to.equal('Sequence Project');
    expect(sequenceProjectOp.LogicalOp).to.equal('Compute Scalar');
    expect(sequenceProjectOp.Action).to.be.instanceof(ShowPlan.ComputeScalar);
  });
});

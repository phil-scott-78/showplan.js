import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('window-spool-segment-sequence-project.sqlplan', () => {
    test('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/window-spool-segment-sequence-project.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const queryplan = showplan.QueryPlan!;
        const windowSpool = queryplan
            .RelOp.Action // compute scalar
            .RelOp[0].Action // stream agg
            .RelOp[0]; // window spool

        expect(windowSpool.PhysicalOp).toBe('Window Spool');
        expect(windowSpool.Action).toBeInstanceOf(ShowPlan.Window);

        const segmentOp = windowSpool.Action.RelOp[0];
        expect(segmentOp.PhysicalOp).toBe('Segment');
        expect(segmentOp.Action).toBeInstanceOf(ShowPlan.Segment);

        const segment = segmentOp.Action as ShowPlan.Segment;
        expect(segment.GroupBy).toHaveLength(0);
        expect(segment.SegmentColumn.Column).toBe('Segment1005');

        const sequenceProjectOp = segment.RelOp[0];
        expect(sequenceProjectOp.PhysicalOp).toBe('Sequence Project');
        expect(sequenceProjectOp.LogicalOp).toBe('Compute Scalar');
        expect(sequenceProjectOp.Action).toBeInstanceOf(ShowPlan.ComputeScalar);
    });
});

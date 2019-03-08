import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('merge-interval-constant-scan.sqlplan', () => {
    it('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/merge-interval-constant-scan.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;

        // for whatever reason with this plan the CPU + IO doesn't equal
        // the total cost. not clue. verify the total cost calculated is zero
        // but CPI and IO do have a value
        expect(showplan.QueryPlan!.RelOp.EstimateTotalCost).to.equal(0);
        expect(showplan.QueryPlan!.RelOp.EstimateCPU).to.not.equal(0);
        expect(showplan.QueryPlan!.RelOp.EstimateIO).to.not.equal(0);

        const mergeOp = showplan.QueryPlan!
            .RelOp.Action // nested join
            .RelOp[0];

        expect(mergeOp.PhysicalOp).to.equal('Merge Interval');
        expect(mergeOp.Action).to.be.instanceof(ShowPlan.SimpleIteratorOneChild);


        const concat = mergeOp.Action
            .RelOp[0].Action // sort
            .RelOp[0].Action // compute scalar
            .RelOp[0];

        expect(concat.Action).to.be.instanceof(ShowPlan.Concat);
        const constantScanOp = concat.Action.RelOp[0].Action.RelOp[0];
        expect(constantScanOp.PhysicalOp).to.equal('Constant Scan');
        expect(constantScanOp.Action).to.be.instanceof(ShowPlan.ConstantScan);
    });
});

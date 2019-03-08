import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('inserted-deleted.sqlplan', () => {
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const file = 'tests/unit/plan-parser/plans/inserted-deleted-scan.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('first statement can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(statement.QueryPlan!.RelOp.PhysicalOp).to.equal('Table Update');
        expect(statement.QueryPlan!.RelOp.Action).to.be.instanceof(ShowPlan.Update);
    });

    it('second statement can parse as inserted scan', () => {
        const statement = plan.Batches[0].Statements[1] as ShowPlan.StmtSimple;
        const op = statement.QueryPlan!
            .RelOp.Action // compute scalar
            .RelOp[0].Action // compute scalar
            .RelOp[0].Action // streamaggregate
            .RelOp[0];

        expect(op.PhysicalOp).to.equal('Inserted Scan');
        expect(op.Action).to.be.instanceof(ShowPlan.Rowset);
    });

    it('third statement can parse as deleted scan', () => {
        const statement = plan.Batches[0].Statements[2] as ShowPlan.StmtSimple;
        const op = statement.QueryPlan!
            .RelOp.Action // compute scalar
            .RelOp[0].Action // compute scalar
            .RelOp[0].Action // streamaggregate
            .RelOp[0];

        expect(op.PhysicalOp).to.equal('Deleted Scan');
        expect(op.Action).to.be.instanceof(ShowPlan.Rowset);
    });
});

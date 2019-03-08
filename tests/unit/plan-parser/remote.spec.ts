import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('remote-query.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/remote-query.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const op = statement.QueryPlan!.RelOp.Action.RelOp[0];
        expect(op.LogicalOp).to.equal('Remote Query');
        expect(op.PhysicalOp).to.equal('Remote Query');
        expect(op.Action).to.be.instanceof(ShowPlan.RemoteQuery);

        const remoteQuery = op.Action as ShowPlan.RemoteQuery;
        expect(remoteQuery.RemoteSource).to.equal('.');
        expect(remoteQuery.RemoteQuery).contain('SELECT');
    });
});

describe('remote-update-scan.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/remote-update-scan.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const updateOp = statement.QueryPlan!.RelOp;
        expect(updateOp.LogicalOp).to.equal('Remote Update');
        expect(updateOp.PhysicalOp).to.equal('Remote Update');

        const remoteUpdate = updateOp.Action as ShowPlan.RemoteModify;
        expect(remoteUpdate.RemoteObject!).to.contain('StackOverFlowMovies');
        expect(remoteUpdate.SetPredicate!.ScalarOperator.ScalarString).to.equal('[.].[StackOverFlowMovies].[dbo].[Users].[DisplayName] = [Expr1003]');

        const scanOp = remoteUpdate.RelOp[0].Action
            .RelOp[0].Action // compute scalar
            .RelOp[0].Action // filter
            .RelOp[0];

        expect(scanOp.LogicalOp).to.equal('Remote Scan');
        expect(scanOp.PhysicalOp).to.equal('Remote Scan');
        expect(scanOp.Action).to.be.instanceof(ShowPlan.Remote);
        const remoteScan = scanOp.Action as ShowPlan.Remote;
        expect(remoteScan.RemoteObject).to.equal('"StackOverFlowMovies"."dbo"."Users"');
    });
});

import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('remote-query.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/remote-query.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const op = statement.QueryPlan!.RelOp.Action.RelOp[0];
        expect(op.LogicalOp).toBe('Remote Query');
        expect(op.PhysicalOp).toBe('Remote Query');
        expect(op.Action).toBeInstanceOf(ShowPlan.RemoteQuery);

        const remoteQuery = op.Action as ShowPlan.RemoteQuery;
        expect(remoteQuery.RemoteSource).toBe('.');
        expect(remoteQuery.RemoteQuery).toContain('SELECT');
    });
});

describe('remote-update-scan.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/remote-update-scan.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const updateOp = statement.QueryPlan!.RelOp;
        expect(updateOp.LogicalOp).toBe('Remote Update');
        expect(updateOp.PhysicalOp).toBe('Remote Update');

        const remoteUpdate = updateOp.Action as ShowPlan.RemoteModify;
        expect(remoteUpdate.RemoteObject!).toContain('StackOverFlowMovies');
        expect(remoteUpdate.SetPredicate!.ScalarOperator.ScalarString).toBe('[.].[StackOverFlowMovies].[dbo].[Users].[DisplayName] = [Expr1003]');

        const scanOp = remoteUpdate.RelOp[0].Action
            .RelOp[0].Action // compute scalar
            .RelOp[0].Action // filter
            .RelOp[0];

        expect(scanOp.LogicalOp).toBe('Remote Scan');
        expect(scanOp.PhysicalOp).toBe('Remote Scan');
        expect(scanOp.Action).toBeInstanceOf(ShowPlan.Remote);
        const remoteScan = scanOp.Action as ShowPlan.Remote;
        expect(remoteScan.RemoteObject).toBe('"StackOverFlowMovies"."dbo"."Users"');
    });
});

import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('hash-match-join.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/hash-match-join.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;

        expect(statement.QueryPlan!.RelOp.PhysicalOp).toBe('Filter');
        expect(statement.QueryPlan!.RelOp.Action).toBeInstanceOf(ShowPlan.Filter);

        const filter = statement.QueryPlan!.RelOp.Action as ShowPlan.Filter;
        expect(filter.Predicate.ScalarOperator.ScalarString).toBe('[Expr1004]>(500)');
        expect(filter.RelOp[0].Action).toBeInstanceOf(ShowPlan.Hash);

        const hash = filter.RelOp[0].Action as ShowPlan.Hash;
        expect(hash.RelOp).toHaveLength(2);
        expect(hash.HashKeysBuild![0].Column).toBe('OwnerUserId');
        expect(hash.HashKeysProbe![0].Column).toBe('Id');
        expect(hash.ProbeResidual!.ScalarOperator.ScalarString).toBe(
            '[StackOverflowMovies].[dbo].[Posts].[OwnerUserId]=[StackOverflowMovies].[dbo].[Users].[Id]'
        );
        expect(hash.RelOp[0].Action).toBeInstanceOf(ShowPlan.ComputeScalar);
        expect(hash.RelOp[1].Action).toBeInstanceOf(ShowPlan.IndexScan);
        expect(hash.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Hash);
        expect(hash.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.IndexScan);
    });
});

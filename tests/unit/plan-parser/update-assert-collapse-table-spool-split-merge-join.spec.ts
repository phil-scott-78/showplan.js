import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';

describe('update-assert-collapse-table-spool-split-merge-join.sqlplan', () => {
    let showplan: ShowPlan.StmtSimple;
    let queryplan: ShowPlan.QueryPlan;
    let firstSequence: ShowPlan.RelOp;
    let secondSequence: ShowPlan.RelOp;
    let thirdSequence: ShowPlan.RelOp;

    beforeAll(() => {
        const file = 'tests/unit/plan-parser/plans/update-assert-collapse-table-spool-split-merge-join.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);
        showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        queryplan = showplan.QueryPlan!;
        [firstSequence, secondSequence, thirdSequence] = queryplan.RelOp.Action.RelOp;
    });

    test('plan should be an update statement', () => {
        expect(showplan.StatementText).toBe('UPDATE [Posts] set [owneruserid] = @1  WHERE [OwnerUserId]=@2');
        expect(showplan.StatementType).toBe('UPDATE');
    });

    test('first operation should be a sequence', () => {
        expect(queryplan.RelOp.Action).toBeInstanceOf(ShowPlan.Sequence);
        expect(queryplan.RelOp.Action.RelOp).toHaveLength(3);
    });

    describe('first sequence', () => {
        let sequenceOp: ShowPlan.RelOp;

        beforeAll(() => {
            sequenceOp = firstSequence;
        });

        test('first operation should be a table spool', () => {
            expect(sequenceOp.Action).toBeInstanceOf(ShowPlan.Spool);
            expect(sequenceOp.LogicalOp).toBe('Eager Spool');
            expect(sequenceOp.PhysicalOp).toBe('Table Spool');
        });

        test('second operation should be a split', () => {
            expect(sequenceOp.Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Split);
            const split = sequenceOp.Action.RelOp[0].Action as ShowPlan.Split;
            expect(split.ActionColumn!.Column).toBe('Act1017');
        });

        test('third operation should be an update', () => {
            expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Update);
            const update = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Update;
            expect(update.Object).toHaveLength(2);
            expect(update.SetPredicate![0].ScalarOperator.ScalarString).toBe('[StackOverflowMovies].[dbo].[Posts].[OwnerUserId] = [Expr1015]');
            expect(update.SetPredicate![0].ScalarOperator.Operation).toBeInstanceOf(ShowPlan.ScalarExpressionList);
            const scalarExpressionList = update.SetPredicate![0].ScalarOperator.Operation as ShowPlan.ScalarExpressionList;
            expect(scalarExpressionList.ScalarOperator[0].Operation).toBeInstanceOf(ShowPlan.MultiAssign);
            const multiAssign = scalarExpressionList.ScalarOperator[0].Operation as ShowPlan.MultiAssign;
            expect(multiAssign.Assigns).toHaveLength(1);
            expect(multiAssign.Assigns![0].ScalarOperator.Operation).toBeInstanceOf(ShowPlan.Ident);
            expect(multiAssign.Assigns![0].ScalarOperator.Operation).toBeInstanceOf(ShowPlan.Ident);
        });

        test('and the rest are parsed ok too', () => {
            const action = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action;
            expect(action).toBeInstanceOf(ShowPlan.ComputeScalar);
            expect(action.RelOp[0].Action).toBeInstanceOf(ShowPlan.ComputeScalar);
            expect(action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.ComputeScalar);
            expect(action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Spool);
            expect(action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.ComputeScalar);
            expect(action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.IndexScan);
        });
    });

    describe('second sequence', () => {
        let sequenceOp: ShowPlan.RelOp;

        beforeAll(() => {
            sequenceOp = secondSequence;
        });

        test('first operation is an update', () => {
            expect(sequenceOp.Action).toBeInstanceOf(ShowPlan.Update);
            const update = sequenceOp.Action as ShowPlan.Update;

            expect(update.Object[0].Table).toBe('[vUsersWithPostCount]');
            expect(update.Object[0].Index).toBe('[CIX_vUsersWithPostCount]');

            expect(update.SetPredicate![0].ScalarOperator.ScalarString).toBe('[StackOverflowMovies].[dbo].[vUsersWithPostCount].[Id] = '
        + 'RaiseIfNullUpdate([StackOverflowMovies].[dbo].[Users].[Id]),[StackOverflowMovies].[dbo].[vUsersWithPostCount].[PostCount]'
        + ' = [Expr1010]');
            const multiAssign = (update.SetPredicate![0].ScalarOperator.Operation as ShowPlan.ScalarExpressionList).ScalarOperator[0].Operation as ShowPlan.MultiAssign;
            expect(multiAssign.Assigns).toHaveLength(2);
            expect(multiAssign.Assigns![0].ScalarOperator.Operation).toBeInstanceOf(ShowPlan.Intrinsic);
            expect(multiAssign.Assigns![1].ScalarOperator.Operation).toBeInstanceOf(ShowPlan.Ident);
        });

        test('second operation is a collapse', () => {
            expect(sequenceOp.Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Collapse);
            const collapse = sequenceOp.Action.RelOp[0].Action as ShowPlan.Collapse;
            expect(collapse.GroupBy).toHaveLength(1);
            expect(collapse.GroupBy[0].Column).toBe('Id');
        });

        test('third operation is a sort', () => {
            expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Sort);
        });

        test('fourth operation is a computer scalar', () => {
            expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.ComputeScalar);
        });

        test('fifth operation is a merge', () => {
            expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Merge);
            const merge = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Merge;
            expect(merge.InnerSideJoinColumns).toHaveLength(1);
            expect(merge.OuterSideJoinColumns).toHaveLength(1);
            expect(merge.InnerSideJoinColumns![0].Table).toBe('[Users]');
            expect(merge.OuterSideJoinColumns![0].Table).toBe('[vUsersWithPostCount]');
            expect(merge.Residual!.ScalarOperator.ScalarString).toBe(
                '[StackOverflowMovies].[dbo].[Users].[Id] = [StackOverflowMovies].[dbo].[vUsersWithPostCount].[Id]',
            );
        });

        describe('inner side of the join', () => {
            let merge: ShowPlan.Merge;

            beforeAll(() => {
                merge = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Merge;
            });

            test('operation is an IndexScan', () => {
                expect(merge.RelOp[0].Action).toBeInstanceOf(ShowPlan.IndexScan);
            });
        });

        describe('outer side of the join', () => {
            let merge: ShowPlan.Merge;

            beforeAll(() => {
                merge = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Merge;
            });

            test('first operation is a stream aggregate', () => {
                expect(merge.RelOp[1].Action).toBeInstanceOf(ShowPlan.StreamAggregate);
            });
        });
    });

    describe('third sequence', () => {
        let sequenceOp: ShowPlan.RelOp;

        beforeAll(() => {
            sequenceOp = thirdSequence;
        });

        test('first operation should be an assert', () => {
            expect(sequenceOp.Action).toBeInstanceOf(ShowPlan.Filter);
            expect(sequenceOp.PhysicalOp).toBe('Assert');
            expect(sequenceOp.LogicalOp).toBe('Assert');
            const assert = sequenceOp.Action as ShowPlan.Filter;
            expect(assert.IsAssert).toBe(true);
            expect(assert.Predicate.ScalarOperator.ScalarString).toBe('CASE WHEN NOT [Pass1024] AND [Expr1023] IS NULL THEN (0) ELSE NULL END');
        });

        test('second operation is a nested loop', () => {
            expect(sequenceOp.Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.NestedLoops);
            expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action).toBeInstanceOf(ShowPlan.Spool);
            expect(sequenceOp.Action.RelOp[0].Action.RelOp[1].Action).toBeInstanceOf(ShowPlan.IndexScan);
        });
    });
});

import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';


import * as fs from 'fs';

describe('update-assert-collapse-table-spool-split-merge-join.sqlplan', function() {
  let showplan: ShowPlan.StmtSimple;
  let queryplan: ShowPlan.QueryPlan;

  before(function() {
    const file = 'tests/unit/plan-parser/plans/update-assert-collapse-table-spool-split-merge-join.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);
    showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    queryplan = showplan.QueryPlan!;
  });

  it('plan should be an update statement', function() {
    expect(showplan.StatementText).to.equal('UPDATE [Posts] set [owneruserid] = @1  WHERE [OwnerUserId]=@2');
    expect(showplan.StatementType).to.equal('UPDATE');
  });

  it('first operation should be a sequence', function() {
    expect(queryplan.RelOp.Action).to.be.instanceof(ShowPlan.Sequence);
    expect(queryplan.RelOp.Action.RelOp).to.have.length(3);
  });

  describe('first sequence', function() {
    let sequenceOp: ShowPlan.RelOp;

    before(function() {
      sequenceOp = queryplan.RelOp.Action.RelOp[0];
    });

    it('first operation should be a table spool', function() {
      expect(sequenceOp.Action).to.be.instanceof(ShowPlan.Spool);
      expect(sequenceOp.LogicalOp).to.equal('Eager Spool');
      expect(sequenceOp.PhysicalOp).to.equal('Table Spool');
    });

    it('second operation should be a split', function() {
      expect(sequenceOp.Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Split);
      const split = sequenceOp.Action.RelOp[0].Action as ShowPlan.Split;
      expect(split.ActionColumn!.Column).to.equal('Act1017');
    });

    it('third operation should be an update', function() {
      expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Update);
      const update = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Update;
      expect(update.Object).to.have.length(2);
      expect(update.SetPredicate![0].ScalarOperator.ScalarString).to.equal('[StackOverflowMovies].[dbo].[Posts].[OwnerUserId] = [Expr1015]');
      expect(update.SetPredicate![0].ScalarOperator.Operation).to.be.instanceof(ShowPlan.ScalarExpressionList);
      const scalarExpressionList = update.SetPredicate![0].ScalarOperator.Operation as ShowPlan.ScalarExpressionList;
      expect(scalarExpressionList.ScalarOperator[0].Operation).to.be.instanceof(ShowPlan.MultiAssign);
      const multiAssign = scalarExpressionList.ScalarOperator[0].Operation as ShowPlan.MultiAssign;
      expect(multiAssign.Assigns).to.have.length(1);
      expect(multiAssign.Assigns![0].ScalarOperator.Operation).to.be.instanceof(ShowPlan.Ident);
      expect(multiAssign.Assigns![0].ScalarOperator.Operation).to.be.instanceof(ShowPlan.Ident);
    });

    it('and the rest are parsed ok too', function() {
      const action = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action;
      expect(action).to.be.instanceof(ShowPlan.ComputeScalar);
      expect(action.RelOp[0].Action).to.be.instanceof(ShowPlan.ComputeScalar);
      expect(action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.ComputeScalar);
      expect(action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Spool);
      expect(action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action)
        .to.be.instanceof(ShowPlan.ComputeScalar);
      expect(action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action)
        .to.be.instanceof(ShowPlan.IndexScan);
    });
  });

  describe('second sequence', function() {
    let sequenceOp: ShowPlan.RelOp;

    before(function() {
      sequenceOp = queryplan.RelOp.Action.RelOp[1];
    });

    it('first operation is an update', function() {
      expect(sequenceOp.Action).to.be.instanceof(ShowPlan.Update);
      const update = sequenceOp.Action as ShowPlan.Update;

      expect(update.Object[0].Table).to.equal('[vUsersWithPostCount]');
      expect(update.Object[0].Index).to.equal('[CIX_vUsersWithPostCount]');

      expect(update.SetPredicate![0].ScalarOperator.ScalarString)
        .to.equal('[StackOverflowMovies].[dbo].[vUsersWithPostCount].[Id] = ' +
        'RaiseIfNullUpdate([StackOverflowMovies].[dbo].[Users].[Id]),[StackOverflowMovies].[dbo].[vUsersWithPostCount].[PostCount]' +
        ' = [Expr1010]');
      const multiAssign = (update.SetPredicate![0].ScalarOperator.Operation as ShowPlan.ScalarExpressionList).ScalarOperator[0].Operation as ShowPlan.MultiAssign;
      expect(multiAssign.Assigns).to.have.length(2);
      expect(multiAssign.Assigns![0].ScalarOperator.Operation).to.be.instanceof(ShowPlan.Intrinsic);
      expect(multiAssign.Assigns![1].ScalarOperator.Operation).to.be.instanceof(ShowPlan.Ident);
    });

    it('second operation is a collapse', function() {
      expect(sequenceOp.Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Collapse);
      const collapse = sequenceOp.Action.RelOp[0].Action as ShowPlan.Collapse;
      expect(collapse.GroupBy).to.have.length(1);
      expect(collapse.GroupBy[0].Column).to.equal('Id');
    });

    it('third operation is a sort', function() {
      expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Sort);
    });

    it('fourth operation is a computer scalar', function() {
      expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.ComputeScalar);
    });

    it('fifth operation is a merge', function() {
      expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Merge);
      const merge = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Merge;
      expect(merge.InnerSideJoinColumns).to.have.length(1);
      expect(merge.OuterSideJoinColumns).to.have.length(1);
      expect(merge.InnerSideJoinColumns![0].Table).to.equal('[Users]');
      expect(merge.OuterSideJoinColumns![0].Table).to.equal('[vUsersWithPostCount]');
      expect(merge.Residual!.ScalarOperator.ScalarString).to.equal('[StackOverflowMovies].[dbo].[Users].[Id] = [StackOverflowMovies].[dbo].[vUsersWithPostCount].[Id]');
    });

    describe('inner side of the join', function() {
      let merge: ShowPlan.Merge;

      before(function() {
        merge = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Merge;
      });

      it('operation is an IndexScan', function() {
        expect(merge.RelOp[0].Action).to.be.instanceof(ShowPlan.IndexScan);
      });
    });

    describe('outer side of the join', function() {
      let merge: ShowPlan.Merge;

      before(function() {
        merge = sequenceOp.Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action.RelOp[0].Action as ShowPlan.Merge;
      });

      it('first operation is a stream aggregate', function() {
        expect(merge.RelOp[1].Action).to.be.instanceof(ShowPlan.StreamAggregate);
      });
    });
  });

  describe('third sequence', function() {
    let sequenceOp: ShowPlan.RelOp;

    before(function() {
      sequenceOp = queryplan.RelOp.Action.RelOp[2];
    });

    it('first operation should be an assert', function() {
      expect(sequenceOp.Action).to.be.instanceof(ShowPlan.Filter);
      expect(sequenceOp.PhysicalOp).to.equal('Assert');
      expect(sequenceOp.LogicalOp).to.equal('Assert');
      const assert = sequenceOp.Action as ShowPlan.Filter;
      expect(assert.IsAssert).to.be.true;
      expect(assert.Predicate.ScalarOperator.ScalarString).to.equal('CASE WHEN NOT [Pass1024] AND [Expr1023] IS NULL THEN (0) ELSE NULL END');
    });

    it('second operation is a nested loop', function() {
      expect(sequenceOp.Action.RelOp[0].Action).to.be.instanceof(ShowPlan.NestedLoops);
      expect(sequenceOp.Action.RelOp[0].Action.RelOp[0].Action).to.be.instanceof(ShowPlan.Spool);
      expect(sequenceOp.Action.RelOp[0].Action.RelOp[1].Action).to.be.instanceof(ShowPlan.IndexScan);
    });
  });
});

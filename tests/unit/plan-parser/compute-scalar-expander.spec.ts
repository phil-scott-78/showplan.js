// users-with-post-count-and-comment-count

import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';

import * as fs from 'fs';




describe('compute scalar expander', () => {
  it('plans with same column redefined overwrite values properly', () => {
    const file = 'tests/unit/plan-parser/plans/update-assert-collapse-table-spool-split-merge-join.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const expanded = statement.QueryPlan!.RelOp.GetChildExpandedComputedColumns();
    expect(expanded).to.have.length(5);
    expect(expanded[3].Column).to.equal('Expr1010');
    expect(expanded[3].Value).to.equal('SUM(CASE WHEN [Act1017] = (3) THEN (-1) ELSE (1) END)');

    const streamAggregate = statement.QueryPlan!.RelOp.Action
      .RelOp[1].Action
      .RelOp[0].Action
      .RelOp[0].Action
      .RelOp[0].Action
      .RelOp[0].Action.RelOp[1];

    expect(streamAggregate.LogicalOp).to.equal('Aggregate');
    const aggregateExpanded = streamAggregate.ExpandedComputedColumns;
    expect(aggregateExpanded).to.have.length(1);
    expect(aggregateExpanded[0].Column).to.equal('Expr1010');
    expect(aggregateExpanded[0].Value).to.equal('SUM(CASE WHEN [Act1017] = (3) THEN (-1) ELSE (1) END)');
  });

  it('can expand columns', () => {
    const file = 'tests/unit/plan-parser/plans/hash-match-join.sqlplan';
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    const plan = parse.Parse(data);

    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const expanded = statement.QueryPlan!.RelOp.GetChildExpandedComputedColumns();
    expect(expanded).to.have.length(2);
    expect(expanded[0].Column).to.equal('Expr1007');
    expect(expanded[0].Value).to.equal('COUNT(*)');
    expect(expanded[1].Column).to.equal('Expr1004');
    expect(expanded[1].Value).to.equal('CONVERT_IMPLICIT(int,[COUNT(*)],0)');
  });
});

import { ShowPlanParser } from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import { ColumnReferenceParser } from '@/parser/column-reference-parser';


import * as fs from 'fs';

describe('multi-convert.sqlplan', () => {
  const file = 'tests/unit/plan-parser/plans/multi-convert.sqlplan';
  let plan: ShowPlan.ShowPlanXML;

  before(function() {
    const data = fs.readFileSync(file, 'utf16le');
    const parse = new ShowPlanParser();
    plan = parse.Parse(data);
  });

  it('has warnings', () => {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    expect(statement.QueryPlan!.Warnings!.PlanAffectingConvert).to.have.length(1);
    const warning = statement.QueryPlan!.Warnings!.PlanAffectingConvert![0];
    expect(warning.ConvertIssue).to.equal('Cardinality Estimate');
    expect(warning.Expression).to.equal('CONVERT(varchar(30),[StackOverflowMovies].[dbo].[Users].[Id],0)');
  });

  it('first operation is ComputeScalar', () => {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    expect(statement.QueryPlan!.RelOp.Action).to.be.instanceof(ShowPlan.ComputeScalar);
    const firstComputeScalar = statement.QueryPlan!.RelOp.Action as ShowPlan.ComputeScalar;
    expect(firstComputeScalar.DefinedValues![0].ColumnReference![0].Column)
      .to.equal('Expr1003');
    expect(firstComputeScalar.DefinedValues![0].ScalarOperator!.ScalarString)
      .to.equal('CONVERT(varchar(30),[StackOverflowMovies].[dbo].[Users].[CreationDate],[@style])');

    expect(statement.QueryPlan!.RelOp.Action.DefinedValues![0].ScalarOperator!.Operation)
      .to.be.instanceof(ShowPlan.Convert);
    const convert = statement.QueryPlan!.RelOp.Action.DefinedValues![0].ScalarOperator!.Operation as ShowPlan.Convert;

    expect(convert.DataType).to.equal('varchar');
    expect(convert.Length).to.equal(30);
    expect(convert.Style).to.equal(0);
    expect(convert.Implicit).to.be.false;
    expect((convert.ScalarOperator.Operation as ShowPlan.Ident).ColumnReference!.Column)
      .to.equal('CreationDate');
  });

  it('second operation is Convert', function() {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const secondOperation = statement.QueryPlan!.RelOp.Action.RelOp;
    expect(secondOperation[0].Action).to.be.instanceof(ShowPlan.ComputeScalar);
    const secondComputeScalar = secondOperation[0].Action as ShowPlan.ComputeScalar;
    expect(secondComputeScalar.DefinedValues![0].ScalarOperator!.ScalarString)
      .to.equal('CONVERT(varchar(30),[StackOverflowMovies].[dbo].[Users].[Id],0)+\'!\'');
  });

  it('final operation is IndexScan', function() {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const finalOperation = statement.QueryPlan!.RelOp.Action.RelOp[0].Action.RelOp;
    expect(finalOperation[0].Action).to.be.instanceof(ShowPlan.IndexScan);
  });

  it('can group column references', function() {
    const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
    const columns = statement.QueryPlan!.RelOp.OutputList;
    const grouping = ColumnReferenceParser.Group(columns);
    expect(grouping).to.have.length(1);
    expect(grouping[0].key).to.be.equal('');
  });
});

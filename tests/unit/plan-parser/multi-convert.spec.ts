import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import ColumnReferenceParser from '@/parser/column-reference-parser';
import * as fs from 'fs';

describe('multi-convert.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/multi-convert.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    beforeAll(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    test('has warnings', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(statement.QueryPlan!.Warnings!.PlanAffectingConvert).toHaveLength(1);
        const warning = statement.QueryPlan!.Warnings!.PlanAffectingConvert![0];
        expect(warning.ConvertIssue).toBe('Cardinality Estimate');
        expect(warning.Expression).toBe('CONVERT(varchar(30),[StackOverflowMovies].[dbo].[Users].[Id],0)');
    });

    test('first operation is ComputeScalar', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(statement.QueryPlan!.RelOp.Action).toBeInstanceOf(ShowPlan.ComputeScalar);
        const firstComputeScalar = statement.QueryPlan!.RelOp.Action as ShowPlan.ComputeScalar;
        expect(firstComputeScalar.DefinedValues![0].ColumnReference![0].Column).toBe('Expr1003');
        expect(firstComputeScalar.DefinedValues![0].ScalarOperator!.ScalarString).toBe(
            'CONVERT(varchar(30),[StackOverflowMovies].[dbo].[Users].[CreationDate],[@style])'
        );

        expect(statement.QueryPlan!.RelOp.Action.DefinedValues![0].ScalarOperator!.Operation).toBeInstanceOf(ShowPlan.Convert);
        const convert = statement.QueryPlan!.RelOp.Action.DefinedValues![0].ScalarOperator!.Operation as ShowPlan.Convert;

        expect(convert.DataType).toBe('varchar');
        expect(convert.Length).toBe(30);
        expect(convert.Style).toBe(0);
        expect(convert.Implicit).toBe(false);
        expect((convert.ScalarOperator.Operation as ShowPlan.Ident).ColumnReference!.Column).toBe('CreationDate');
    });

    test('second operation is Convert', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const secondOperation = statement.QueryPlan!.RelOp.Action.RelOp;
        expect(secondOperation[0].Action).toBeInstanceOf(ShowPlan.ComputeScalar);
        const secondComputeScalar = secondOperation[0].Action as ShowPlan.ComputeScalar;
        expect(secondComputeScalar.DefinedValues![0].ScalarOperator!.ScalarString).toBe('CONVERT(varchar(30),[StackOverflowMovies].[dbo].[Users].[Id],0)+\'!\'');
    });

    test('final operation is IndexScan', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const finalOperation = statement.QueryPlan!.RelOp.Action.RelOp[0].Action.RelOp;
        expect(finalOperation[0].Action).toBeInstanceOf(ShowPlan.IndexScan);
    });

    test('can group column references', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const columns = statement.QueryPlan!.RelOp.OutputList;
        const grouping = ColumnReferenceParser.Group(columns);
        expect(grouping).toHaveLength(1);
        expect(grouping[0].key).toBe('');
    });
});

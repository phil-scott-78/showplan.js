import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import ColumnReferenceParser from '@/parser/column-reference-parser';
import * as fs from 'fs';

describe('nested-loops.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/nested-loops.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('first operation is a nested loop', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(statement.QueryPlan!.RelOp.Action).to.be.instanceof(ShowPlan.NestedLoops);

        const nestedLoops = statement.QueryPlan!.RelOp.Action as ShowPlan.NestedLoops;
        expect(nestedLoops.RelOp).to.have.length(2);

        expect(nestedLoops.OuterReferences![0].Column).to.equal('OwnerUserId');
    });

    it('predicate is parsed correctly', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const action = statement.QueryPlan!.RelOp.Action
            .RelOp[1].Action as ShowPlan.IndexScan;

        expect(action.SeekPredicates!.SeekPredicateNew).to.have.length(1);
        expect(action.SeekPredicates!.SeekPredicateNew![0].SeekKeys[0].Prefix!.RangeColumns[0].Column).to.not.be.undefined;
    });

    it('can group columnreferences', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        const columns = statement.QueryPlan!.RelOp.OutputList;
        const grouping = ColumnReferenceParser.Group(columns);
        expect(grouping).to.not.be.undefined;
        expect(grouping).to.have.length(2);
        expect(grouping[0].key).to.equal('[StackOverflowMovies].[dbo].[Posts]');
        expect(grouping[0].members).to.have.length(20);
        expect(grouping[1].key).to.equal('[StackOverflowMovies].[dbo].[Users]');
        expect(grouping[1].members).to.have.length(14);
    });
});

import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('viewclustered-index-seek.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/viewclustered-index-seek.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('can parse', () => {
        const statement = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;

        expect(statement.QueryPlan!.RelOp.OutputList).to.have.length(2);

        const indexScan = statement.QueryPlan!.RelOp.Action as ShowPlan.IndexScan;
        expect(indexScan.Object[0].Table).to.equal('[vUsersWithPostCount]');
        expect(indexScan.Object[0].IndexKind).to.equal('ViewClustered');
        expect(indexScan.IndexedViewInfo).to.have.length(2);
        expect(indexScan.IndexedViewInfo![0].Database).to.equal('[StackOverflowMovies]');
        expect(indexScan.IndexedViewInfo![0].Schema).to.equal('[dbo]');
        expect(indexScan.IndexedViewInfo![0].Table).to.equal('[Users]');
        expect(indexScan.IndexedViewInfo![1].Table).to.equal('[Posts]');
    });
});

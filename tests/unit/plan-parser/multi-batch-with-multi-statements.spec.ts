import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('multi-batch-with-multi-statements.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/multi-batch-with-multi-statements.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('can parse', () => {
        expect(plan.Batches.length).to.equal(1);
        expect(plan.Batches[0].Statements).to.have.length(5);
        expect(plan.Batches[0].Statements[0]).instanceof(ShowPlan.StmtUseDb);
        expect(plan.Batches[0].Statements[1]).instanceof(ShowPlan.StmtSimple);

        const useDbStatement = (plan.Batches[0].Statements[0] as ShowPlan.StmtUseDb);
        expect(useDbStatement.Database).to.equal('[StackOverflowMovies]');

        const statementSimple = (plan.Batches[0].Statements[1] as ShowPlan.StmtSimple);
        expect(statementSimple.QueryPlan!.CachedPlanSize).to.equal(24);
        expect(statementSimple.CostPercentOfBatch()).to.equal(1 / 3);
        expect(statementSimple.QueryPlan!.RelOp.Action).instanceof(ShowPlan.Top);
    });

    it('can find by guid', () => {
        const firstGuid = plan.Batches[0].Statements[0].Guid;
        expect(plan.GetStatementByGuid(firstGuid)).to.not.be.undefined;
        expect(plan.GetStatementByGuid('')).to.be.undefined;
    });
});

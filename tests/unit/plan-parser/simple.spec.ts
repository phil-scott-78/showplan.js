import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';
import * as fs from 'fs';

describe('simple.sqlplan', () => {
    it('can parse', () => {
        const file = 'tests/unit/plan-parser/plans/simple.sqlplan';
        const data = fs.readFileSync(file, 'utf16le');
        const plan = ShowPlanParser.Parse(data);

        expect(plan.Build).to.equal('14.0.1000.169');
        expect(plan.Version).to.equal('1.6');
        expect(plan.Batches).to.have.length(1);
        expect(plan.Batches[0].Statements).to.have.length(1);
        expect(plan.Batches[0].Statements[0]).to.be.instanceof(ShowPlan.StmtSimple);

        const showplan = plan.Batches[0].Statements[0] as ShowPlan.StmtSimple;
        expect(showplan.StatementText).to.equal('select 1');
        expect(showplan.StatementType).to.equal('SELECT WITHOUT QUERY');
    });
});

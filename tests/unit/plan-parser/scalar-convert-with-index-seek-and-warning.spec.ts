import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import { expect } from 'chai';


import * as fs from 'fs';

describe('scalar-convert-with-index-seek-and-warning.sqlplan', () => {
    const file = 'tests/unit/plan-parser/plans/scalar-convert-with-index-seek-and-warning.sqlplan';
    let plan: ShowPlan.ShowPlanXML;

    before(() => {
        const data = fs.readFileSync(file, 'utf16le');
        plan = ShowPlanParser.Parse(data);
    });

    it('can parse', () => {
        expect((plan.Batches[0].Statements[0] as ShowPlan.StmtSimple).StatementSubTreeCost)
            .to.equal(0.0032833);
    });
});

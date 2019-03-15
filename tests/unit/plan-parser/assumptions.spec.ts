import ShowPlanParser from '@/parser/showplan-parser';
import * as ShowPlan from '@/parser/showplan';
import * as fs from 'fs';
import * as path from 'path';

const root = 'tests/unit/plan-parser/plans/';
const files = fs.readdirSync(root)
    .filter(i => path.extname(i) === '.sqlplan')
    .map(i => [i]);

describe.each(files)('%s', (file) => {
    const fullFileName = path.join(root, file);
    const data = fs.readFileSync(fullFileName, 'utf16le');
    const plan = ShowPlanParser.Parse(data);
    const statements = plan.Batches
        .map(i => i.Statements)
        .reduce((prev, cur) => prev.concat(cur))
        .filter(i => i.StatementType === 'SELECT')
        .map(i => i as ShowPlan.StmtSimple)
        .filter(i => i.QueryPlan !== undefined);

    test('valid file', () => {
        expect(plan).toBeDefined();
    });

    statements.forEach((statement) => {
        const shortStatement = statement.StatementText === undefined
            ? statement.StatementType!
            : statement.StatementText.substring(0, 30);

        const queryPlan = statement.QueryPlan!;
        const allOperations = queryPlan.getFlattenRelOps();

        describe(shortStatement, () => {
            test('we have a queryplan', () => {
                expect(statement.QueryPlan).toBeDefined;
            });

            test('any parallel operations have DegreeOfParallelism number of RunTimeCountersPerThread', () => {
                const threads = queryPlan.DegreeOfParallelism;
                const parallelOperations = allOperations.filter(i => i.Parallel && i.RunTimeInformation !== undefined && i.RunTimeInformation!.RunTimeCountersPerThread.length !== 1);
                parallelOperations.forEach(op => expect(op.RunTimeInformation!.RunTimeCountersPerThread.length).toBe(threads));
            });
        });
    });
});

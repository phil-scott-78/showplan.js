import ShowPlanParser from '@/parser/showplan-parser';

describe('showplan-parser tests', () => {
    test('fails gracefully with invalid xml', () => {
        const parserFunction = function getPlan(): void { ShowPlanParser.Parse('this is some <b>invalid</s> xml'); };
        expect(parserFunction).toThrowError('Could not parse XML for showplan');
    });

    test('fails gracefully with valid xml that\'s not a showplan', () => {
        const parserFunction = function getPlan(): void { ShowPlanParser.Parse('<root><b>test</b></root>'); };
        expect(parserFunction).toThrowError('Invalid XML namespace. Received namespace undefined');
    });
});

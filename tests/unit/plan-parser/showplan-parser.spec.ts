import ShowPlanParser from '@/parser/showplan-parser';
import { expect } from 'chai';

describe('showplan-parser tests', () => {
    it('fails gracefully with invalid xml', () => {
        const parserFunction = function getPlan(): void { ShowPlanParser.Parse('this is some <b>invalid</s> xml'); };
        expect(parserFunction).to.throw('Invalid showplan');
    });

    it('fails gracefully with valid xml that\'s not a showplan', () => {
        const parserFunction = function getPlan(): void { ShowPlanParser.Parse('<root><b>test</b></root>'); };
        expect(parserFunction).to.throw('Invalid showplan');
    });
});

import { ShowPlanParser } from '@/parser/showplan-parser';
import { expect } from 'chai';


describe('showplan-parser tests', function() {
  it('fails gracefully with invalid xml', function() {
    const parse = new ShowPlanParser();
    const parserFunction = function() { parse.Parse('this is some <b>invalid</s> xml'); };
    expect(parserFunction).to.throw('Invalid showplan');
  });

  it('fails gracefully with valid xml that\'s not a showplan', function() {
    const parse = new ShowPlanParser();
    const parserFunction = function() { parse.Parse('<root><b>test</b></root>'); };
    expect(parserFunction).to.throw('Invalid showplan');
  });
});

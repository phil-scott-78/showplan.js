import * as ShowPlan from './showplan';
import QueryHelper from './query-helper';
import Convert from './convert';
import ColumnReferenceParser from './column-reference-parser';

class SeekPredicateParser {
    private scalarExpresionParser: (scalarExpressionElement: Element) => ShowPlan.ScalarExpression;

    private static ColumnReferenceParser = new ColumnReferenceParser();

    public constructor(scalarExpressionParser: (scalarExpressionElement: Element) => ShowPlan.ScalarExpression) {
        this.scalarExpresionParser = scalarExpressionParser;
    }

    public ParseSeekPredicates(element: Element): ShowPlan.SeekPredicates {
        const seekPredicates = new ShowPlan.SeekPredicates();

        const seekPredicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicate');
        if (seekPredicateElements.length > 0) {
            seekPredicates.SeekPredicate = seekPredicateElements.map(i => this.ParseSeekPredicate(i));
        }

        const seekPredicateNewElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicateNew');
        if (seekPredicateNewElements.length > 0) {
            seekPredicates.SeekPredicateNew = seekPredicateNewElements.map(i => this.ParseSeekPredicateNew(i));
        }

        return seekPredicates;
    }

    public ParseSeekPredicate(element: Element): ShowPlan.SeekPredicate {
        const seekPredicate = new ShowPlan.SeekPredicate();

        const prefixElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'Prefix');
        if (prefixElement.length === 1) {
            seekPredicate.Prefix = this.ParseScanRangeType(prefixElement[0]);
        }

        const startRangeElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'StartRange');
        if (startRangeElement.length === 1) {
            seekPredicate.StartRange = this.ParseScanRangeType(startRangeElement[0]);
        }

        const endRangeElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'EndRange');
        if (endRangeElement.length === 1) {
            seekPredicate.EndRange = this.ParseScanRangeType(endRangeElement[0]);
        }

        return seekPredicate;
    }

    public ParseSeekPredicateNew(element: Element): ShowPlan.SeekPredicateNew {
        const seekKeyElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekKeys');
        const seekKeys = seekKeyElements.map(i => this.ParseSeekPredicate(i));

        return new ShowPlan.SeekPredicateNew(seekKeys);
    }

    private ParseSeekPredicatePart(element: Element): ShowPlan.SeekPredicatePart {
        const seekPredicateNewElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicateNew');
        const seekPredicateNew = seekPredicateNewElements.map(i => this.ParseSeekPredicateNew(i));

        return new ShowPlan.SeekPredicatePart(seekPredicateNew);
    }

    private ParseScanRangeType(element: Element): ShowPlan.ScanRange {
        const scanType = Convert.GetString(element, 'ScanType') as ShowPlan.CompareOp;
        const rangeExpressionElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'RangeExpressions');

        const rangeColumns = SeekPredicateParser.ColumnReferenceParser.GetAllFromElement(element, 'RangeColumns');
        const rangeExpressions = rangeExpressionElements.map(i => this.scalarExpresionParser(i));

        return new ShowPlan.ScanRange(scanType, rangeColumns, rangeExpressions);
    }
}

export default SeekPredicateParser;

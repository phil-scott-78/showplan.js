import * as ShowPlan from './showplan';
import Convert from './convert';
import QueryHelper from './query-helper';
import ColumnReferenceParser from './column-reference-parser';
import MissingIndexParser from './missing-index-parser';
import MetaInfoParser from './meta-info-parser';
import WarningsParser from './warnings-parser';
import RelOpParser from './rel-op-parser';

class QueryPlanParser {
    private static MetaInfoParser = new MetaInfoParser();

    private static WarningsParser = new WarningsParser();

    private static MissingIndexParser = new MissingIndexParser();

    private static ColumnReferenceParser = new ColumnReferenceParser();

    public static Parse(queryPlanElement: Element): ShowPlan.QueryPlan {
        const relOpElements = QueryHelper.GetImmediateChildNodesByTagName(queryPlanElement, 'RelOp');
        if (relOpElements.length !== 1) {
            throw new Error('RelOp not found in query plan');
        }

        const relOp = RelOpParser.ParseRelOp(undefined, relOpElements[0]);
        const queryplan = new ShowPlan.QueryPlan(relOp);

        queryplan.MissingIndexes = QueryHelper.ParseSingleItem(queryPlanElement, 'MissingIndexes', i => QueryPlanParser.MissingIndexParser.ParseMissingIndexes(i));
        queryplan.ThreadStat = QueryHelper.ParseSingleItem(queryPlanElement, 'ThreadStat', i => QueryPlanParser.MetaInfoParser.ParseThreadStat(i));
        queryplan.MemoryGrant = Convert.GetIntOrUndefined(queryPlanElement, 'MemoryGrant');
        queryplan.MemoryGrantInfo = QueryHelper.ParseSingleItem(queryPlanElement, 'MemoryGrantInfo', i => QueryPlanParser.MetaInfoParser.ParseMemoryGrantInfo(i));
        queryplan.OptimizerHardwareDependentProperties = QueryHelper.ParseSingleItem(queryPlanElement, 'OptimizerHardwareDependentProperties', i => QueryPlanParser.MetaInfoParser.ParseOptimizerHardwareDependentProperties(i));
        queryplan.OptimizerStatsUsage = QueryHelper.ParseSingleItem(queryPlanElement, 'OptimizerStatsUsage', i => QueryPlanParser.MetaInfoParser.ParseOptimizerStatsUsage(i));
        queryplan.WaitStats = QueryHelper.ParseSingleItem(queryPlanElement, 'WaitStats', i => QueryPlanParser.MetaInfoParser.ParseWaitStats(i));
        queryplan.QueryTimeStats = QueryHelper.ParseSingleItem(queryPlanElement, 'QueryTimeStats', i => QueryPlanParser.MetaInfoParser.ParseQueryTimeStats(i));
        queryplan.Warnings = QueryHelper.ParseSingleItem(queryPlanElement, 'Warnings', i => QueryPlanParser.WarningsParser.ParseWarnings(i));
        queryplan.CachedPlanSize = Convert.GetIntOrUndefined(queryPlanElement, 'CachedPlanSize');
        queryplan.ParameterList = QueryPlanParser.ColumnReferenceParser.GetAllFromElement(queryPlanElement, 'ParameterList');
        queryplan.DegreeOfParallelism = Convert.GetIntOrUndefined(queryPlanElement, 'DegreeOfParallelism');
        return queryplan;
    }
}

export default QueryPlanParser;

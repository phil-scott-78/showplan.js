import * as ShowPlan from './showplan';
import QueryHelper from './query-helper';
import ColumnReferenceParser from './column-reference-parser';
import Convert from './convert';

class WarningsParser {
    public static ParseWarnings(element: Element): ShowPlan.Warnings {
        const warnings = new ShowPlan.Warnings();

        warnings.ColumnsWithNoStatistics = ColumnReferenceParser.GetAllFromElement(element, 'ColumnsWithNoStatistics');

        warnings.SpillToTempDb = QueryHelper.ParseAllItems(element, 'SpillToTempDb', i => this.ParseSpillToTempDb(i));
        warnings.Wait = QueryHelper.ParseAllItems(element, 'Wait', i => this.ParseWait(i));
        warnings.PlanAffectingConvert = QueryHelper.ParseAllItems(element, 'PlanAffectingConvert', i => this.ParsePlanAffectingConvert(i));
        warnings.SortSpillDetails = QueryHelper.ParseAllItems(element, 'SortSpillDetails', i => this.ParseSortSpillDetails(i));
        warnings.HashSpillDetails = QueryHelper.ParseAllItems(element, 'HashSpillDetails', i => this.ParseHashSpillDetails(i));
        warnings.MemoryGrantWarning = QueryHelper.ParseAllItems(element, 'MemoryGrantWarning', i => this.ParseMemoryGrantWarning(i));

        warnings.NoJoinPredicate = Convert.GetBoolean(element, 'NoJoinPredicate');
        warnings.SpatialGuess = Convert.GetBoolean(element, 'SpatialGuess');
        warnings.UnmatchedIndexes = Convert.GetBoolean(element, 'UnmatchedIndexes');
        warnings.FullUpdateForOnlineIndexBuild = Convert.GetBoolean(element, 'FullUpdateForOnlineIndexBuild');

        return warnings;
    }

    private static ParseSpillToTempDb(element: Element): ShowPlan.SpillToTempDb {
        const spill = new ShowPlan.SpillToTempDb();
        spill.SpillLevel = Convert.GetInt(element, 'SpillLevel');
        spill.SpilledThreadCount = Convert.GetInt(element, 'SpilledThreadCount');

        return spill;
    }

    private static ParseWait(element: Element): ShowPlan.WaitWarning {
        const type = Convert.GetString(element, 'WaitType') as ShowPlan.WaitWarningTypeWaitType;
        return new ShowPlan.WaitWarning(type);
    }

    private static ParsePlanAffectingConvert(element: Element): ShowPlan.AffectingConvertWarning {
        const convertIssue = Convert.GetString(element, 'ConvertIssue') as ShowPlan.AffectingConvertWarningTypeConvertIssue;
        const expression = Convert.GetString(element, 'Expression')!;

        return new ShowPlan.AffectingConvertWarning(convertIssue, expression);
    }

    private static ParseSortSpillDetails(element: Element): ShowPlan.SortSpillDetails {
        const details = new ShowPlan.SortSpillDetails();
        details.GrantedMemoryKb = Convert.GetInt(element, 'GrantedMemoryKb');
        details.ReadsFromTempDb = Convert.GetInt(element, 'ReadsFromTempDb');
        details.UsedMemoryKb = Convert.GetInt(element, 'UsedMemoryKb');
        details.WritesToTempDb = Convert.GetInt(element, 'WritesToTempDb');

        return details;
    }

    private static ParseHashSpillDetails(element: Element): ShowPlan.HashSpillDetails {
        const details = new ShowPlan.HashSpillDetails();
        details.GrantedMemoryKb = Convert.GetInt(element, 'GrantedMemoryKb');
        details.ReadsFromTempDb = Convert.GetInt(element, 'ReadsFromTempDb');
        details.UsedMemoryKb = Convert.GetInt(element, 'UsedMemoryKb');
        details.WritesToTempDb = Convert.GetInt(element, 'WritesToTempDb');

        return details;
    }

    private static ParseMemoryGrantWarning(element: Element): ShowPlan.MemoryGrantWarningInfo {
        const kind = Convert.GetString(element, 'GrantWarningKind') as ShowPlan.MemoryGrantWarningType;
        const requestedMemory = Convert.GetInt(element, 'RequestedMemory')!;
        const grantedMemory = Convert.GetInt(element, 'GrantedMemory')!;
        const maxUsedMemory = Convert.GetInt(element, 'MaxUsedMemory')!;

        return new ShowPlan.MemoryGrantWarningInfo(grantedMemory, kind, maxUsedMemory, requestedMemory);
    }
}

export default WarningsParser;

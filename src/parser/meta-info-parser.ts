import { QueryHelper } from './query-helper';
import * as ShowPlan from './showplan';
import { Convert } from './convert';

export class MetaInfoParser {
  public static ParseThreadStat(element: Element): ShowPlan.ThreadStat {

    const parseThreadReservation = (threadElement: Element): ShowPlan.ThreadReservation => {
      const nodeId = Convert.GetInt(threadElement, 'NodeId')!;
      const reservationThreads = Convert.GetInt(threadElement, 'ReservedThreads')!;

      return new ShowPlan.ThreadReservation(nodeId, reservationThreads);
    };

    const branches = Convert.GetInt(element, 'Branches')!;
    const threadStat = new ShowPlan.ThreadStat(branches);

    threadStat.UsedThreads = Convert.GetInt(element, 'UsedThreads');

    const threadReservationElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ThreadReservation');
    if (threadReservationElements.length > 0) {
      threadStat.ThreadReservation = threadReservationElements.map((i) => parseThreadReservation(i));
    }

    return threadStat;
  }

  public static ParseMemoryGrantInfo(element: Element) {
    const serialRequiredMemory = Convert.GetInt(element, 'SerialRequiredMemory')!;
    const serialDesiredMemory = Convert.GetInt(element, 'SerialDesiredMemory')!;

    const memoryGrant = new ShowPlan.MemoryGrant(serialDesiredMemory, serialRequiredMemory);
    memoryGrant.RequiredMemory = Convert.GetInt(element, 'RequiredMemory');
    memoryGrant.DesiredMemory = Convert.GetInt(element, 'DesiredMemory');
    memoryGrant.RequiredMemory = Convert.GetInt(element, 'RequiredMemory');
    memoryGrant.RequestedMemory = Convert.GetInt(element, 'RequestedMemory');
    memoryGrant.GrantWaitTime = Convert.GetInt(element, 'GrantWaitTime');
    memoryGrant.GrantedMemory = Convert.GetInt(element, 'GrantedMemory');
    memoryGrant.MaxUsedMemory = Convert.GetInt(element, 'MaxUsedMemory');
    memoryGrant.MaxQueryMemory = Convert.GetInt(element, 'MaxQueryMemory');

    return memoryGrant;
  }

  public static ParseOptimizerHardwareDependentProperties(element: Element): ShowPlan.OptimizerHardwareDependentProperties {
    const estimatedAvailableMemoryGrant = Convert.GetInt(element, 'EstimatedAvailableMemoryGrant')!;
    const estimatedPagesCached = Convert.GetInt(element, 'EstimatedPagesCached')!;
    const props = new ShowPlan.OptimizerHardwareDependentProperties(estimatedAvailableMemoryGrant, estimatedPagesCached);
    props.EstimatedAvailableDegreeOfParallelism = Convert.GetInt(element, 'EstimatedAvailableDegreeOfParallelism');
    props.MaxCompileMemory = Convert.GetInt(element, 'MaxCompileMemory');

    return props;
  }

  public static ParseOptimizerStatsUsage(element: Element): ShowPlan.OptimizerStatsUsage {
    const parseStatisticsInfo = (statElement: Element): ShowPlan.StatsInfo => {
      const statistics = Convert.GetString(statElement, 'Statistics')!;
      const modificationCount = Convert.GetInt(statElement, 'ModificationCount')!;
      const samplingPercent = Convert.GetFloat(statElement, 'SamplingPercent')!;

      const stats = new ShowPlan.StatsInfo(modificationCount, samplingPercent, statistics);
      stats.LastUpdate = Convert.GetDate(statElement, 'LastUpdate');
      stats.Database = Convert.GetString(statElement, 'Database');
      stats.Schema = Convert.GetString(statElement, 'Schema');
      stats.Database = Convert.GetString(statElement, 'Table');
      return stats;
    };

    const statInfoElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'StatisticsInfo');
    const statInfo = statInfoElements.map((i) => parseStatisticsInfo(i));

    return new ShowPlan.OptimizerStatsUsage(statInfo);
  }

  public static ParseWaitStats(element: Element): ShowPlan.WaitStatList {
    const parseWaitStat = (waitElement: Element): ShowPlan.WaitStat => {
      const waitType = Convert.GetString(waitElement, 'WaitType')!;
      const waitTimeMs = Convert.GetInt(waitElement, 'WaitTimeMs')!;
      const waitCount = Convert.GetInt(waitElement, 'WaitCount')!;

      return new ShowPlan.WaitStat(waitCount, waitTimeMs, waitType);
    };

    const waitElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'Wait');

    const list = new ShowPlan.WaitStatList();
    list.Wait = waitElements.map((i) => parseWaitStat(i));
    return list;
  }

  public static ParseQueryTimeStats(element: Element): ShowPlan.QueryExecTime {
    const cpuTime = Convert.GetInt(element, 'CpuTime')!;
    const elapsedTime = Convert.GetInt(element, 'ElapsedTime')!;

    return new ShowPlan.QueryExecTime(cpuTime, elapsedTime);
  }

  public static ParseRunTimeInformation(element: Element): ShowPlan.RunTimeInformation {
    const parsePerThread = (threadElement: Element): ShowPlan.RunTimeInformationTypeRunTimeCountersPerThread => {
      const threadId = Convert.GetInt(threadElement, 'Thread')!;
      const actualRows = Convert.GetInt(threadElement, 'ActualRows')!;
      const actualEndOfScans = Convert.GetInt(threadElement, 'ActualEndOfScans')!;
      const actualExecutions = Convert.GetInt(threadElement, 'ActualExecutions')!;

      const perThread = new ShowPlan.RunTimeInformationTypeRunTimeCountersPerThread(actualEndOfScans, actualRows, threadId, actualExecutions);

      perThread.ActualCPUms = Convert.GetInt(threadElement, 'ActualCPUms');
      perThread.ActualElapsedms = Convert.GetInt(threadElement, 'ActualElapsedms');
      perThread.ActualLobLogicalReads = Convert.GetInt(threadElement, 'ActualLobLogicalReads');
      perThread.ActualLobPhysicalReads = Convert.GetInt(threadElement, 'ActualLobPhysicalReads');
      perThread.ActualLobReadAheads = Convert.GetInt(threadElement, 'ActualLobReadAheads');
      perThread.ActualLocallyAggregatedRows = Convert.GetInt(threadElement, 'ActualLocallyAggregatedRows');
      perThread.ActualLogicalReads = Convert.GetInt(threadElement, 'ActualLogicalReads');
      perThread.ActualLogicalReads = Convert.GetInt(threadElement, 'ActualLogicalReads');
      perThread.ActualPhysicalReads = Convert.GetInt(threadElement, 'ActualPhysicalReads');

      perThread.ActualReadAheads = Convert.GetInt(threadElement, 'ActualReadAheads');
      perThread.ActualRebinds = Convert.GetInt(threadElement, 'ActualRebinds');
      perThread.ActualRewinds = Convert.GetInt(threadElement, 'ActualRewinds');
      perThread.ActualRowsRead = Convert.GetInt(threadElement, 'ActualRowsRead');
      perThread.ActualScans = Convert.GetInt(threadElement, 'ActualScans');
      perThread.ActualJoinType = Convert.GetString(threadElement, 'ActualJoinType') as ShowPlan.PhysicalOp;

      return perThread;
    };

    return new ShowPlan.RunTimeInformation(QueryHelper.ParseAllItems(element, 'RunTimeCountersPerThread', (i) => parsePerThread(i))!);
  }
}

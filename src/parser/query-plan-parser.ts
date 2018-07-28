import * as ShowPlan from './showplan';
import { Convert } from './convert';
import { TagAndParser } from './tag-and-parser';
import { QueryHelper } from './query-helper';
import { ScalarExpressionParser } from './scalar-expression-parser';
import { ObjectParser } from './object-parser';
import { SeekPredicateParser } from './seek-predicate-parser';
import { ColumnReferenceParser } from './column-reference-parser';
import { MissingIndexParser } from './missing-index-parser';
import { MetaInfoParser } from './meta-info-parser';
import { WarningsParser } from './warnings-parser';

export class QueryPlanParser {
  public static Parse(queryPlanElement: Element): ShowPlan.QueryPlan {
    const relOpElements = QueryHelper.GetImmediateChildNodesByTagName(queryPlanElement, 'RelOp');
    if (relOpElements.length !== 1) {
      throw new Error('RelOp not found in query plan');
    }

    const relOp = this.ParseRelOp(relOpElements[0]);
    const queryplan = new ShowPlan.QueryPlan(relOp);

    queryplan.MissingIndexes = QueryHelper.ParseSingleItem(queryPlanElement, 'MissingIndexes', (i) => MissingIndexParser.ParseMissingIndexes(i));
    queryplan.ThreadStat = QueryHelper.ParseSingleItem(queryPlanElement, 'ThreadStat', (i) => MetaInfoParser.ParseThreadStat(i));
    queryplan.MemoryGrant = Convert.GetInt(queryPlanElement, 'MemoryGrant');
    queryplan.MemoryGrantInfo = QueryHelper.ParseSingleItem(queryPlanElement, 'MemoryGrantInfo', (i) => MetaInfoParser.ParseMemoryGrantInfo(i));
    queryplan.OptimizerHardwareDependentProperties = QueryHelper.ParseSingleItem(queryPlanElement, 'OptimizerHardwareDependentProperties', (i) => MetaInfoParser.ParseOptimizerHardwareDependentProperties(i));
    queryplan.OptimizerStatsUsage = QueryHelper.ParseSingleItem(queryPlanElement, 'OptimizerStatsUsage', (i) => MetaInfoParser.ParseOptimizerStatsUsage(i));
    queryplan.WaitStats = QueryHelper.ParseSingleItem(queryPlanElement, 'WaitStats', (i) => MetaInfoParser.ParseWaitStats(i));
    queryplan.QueryTimeStats = QueryHelper.ParseSingleItem(queryPlanElement, 'QueryTimeStats', (i) => MetaInfoParser.ParseQueryTimeStats(i));
    queryplan.Warnings = QueryHelper.ParseSingleItem(queryPlanElement, 'Warnings', (i) => WarningsParser.ParseWarnings(i));

    queryplan.CachedPlanSize = Convert.GetInt(queryPlanElement, 'CachedPlanSize');
    return queryplan;
  }

  public static ParseRelOp(relOpElement: Element): ShowPlan.RelOp {
    const tagsAndParsers: Array<TagAndParser<ShowPlan.RelOpAction>> = [
      new TagAndParser('AdaptiveJoin', (element) => this.ParseAdaptiveJoin(element)),
      new TagAndParser('Assert', (element) => this.ParseFilterElement(element)),
      new TagAndParser('BatchHashTableBuild', (element) => this.ParseBatchHashTableBuild(element)),
      new TagAndParser('Bitmap', (element) => this.ParseBitmap(element)),
      new TagAndParser('Collapse', (element) => this.ParseCollapse(element)),
      new TagAndParser('ComputeScalar', (element) => this.ParseComputeScalar(element)),
      new TagAndParser('ConstantScan', (element) => this.ParseConstantScan(element)),
      new TagAndParser('Concat', (element) => this.ParseConcat(element)),
      new TagAndParser('CreateIndex', (element) => this.ParseCreateIndex(element)),
      new TagAndParser('DeletedScan', (element) => this.ParseRowSet(element)),
      new TagAndParser('Extension', (element) => this.ParseUDX(element)),
      new TagAndParser('Filter', (element) => this.ParseFilterElement(element)),
      new TagAndParser('ForeignKeyReferencesCheck', (element) => this.ParseForeignKeyReferencesCheckType(element)),
      new TagAndParser('Generic', (element) => this.ParseGeneric(element)),
      new TagAndParser('Hash', (element) => this.ParseHash(element)),
      new TagAndParser('InsertedScan', (element) => this.ParseRowSet(element)),
      new TagAndParser('LogRowScan', (element) => this.ParseRelOpBaseType(element)),
      new TagAndParser('Merge', (element) => this.ParseMerge(element)),
      new TagAndParser('MergeInterval', (element) => this.ParseSimpleIteratorOneChild(element)),
      new TagAndParser('NestedLoops', (element) => this.ParseNestedLoop(element)),
      new TagAndParser('OnlineIndex', (element) => this.ParseCreateIndex(element)),
      new TagAndParser('Parallelism', (element) => this.ParseParallelism(element)),
      new TagAndParser('ParameterTableScan', (element) => this.ParseRelOpBaseType(element)),
      new TagAndParser('PrintDataflow', (element) => this.ParseRelOpBaseType(element)), // i can't find this ANYWHERE online
      new TagAndParser('Put', (element) => this.ParsePut(element)),
      new TagAndParser('RemoteFetch', (element) => this.ParseRemoteFetch(element)),
      new TagAndParser('RemoteModify', (element) => this.ParseRemoteModify(element)),
      new TagAndParser('RemoteQuery', (element) => this.ParseRemoteQuery(element)),
      new TagAndParser('RemoteRange', (element) => this.ParseRemoteRange(element)),
      new TagAndParser('RemoteScan', (element) => this.ParseRemote(element)),
      new TagAndParser('RowCountSpool', (element) => this.ParseSpool(element)),
      new TagAndParser('ScalarInsert', (element) => this.ParseScalarInsert(element)),
      new TagAndParser('Segment', (element) => this.ParseSegment(element)),
      new TagAndParser('Sequence', (element) => this.ParseSequence(element)),
      new TagAndParser('SequenceProject', (element) => this.ParseComputeScalar(element)),
      new TagAndParser('SimpleUpdate', (element) => this.ParseSimpleUpdate(element)),
      new TagAndParser('Sort', (element) => this.ParseSort(element)),
      new TagAndParser('Split', (element) => this.ParseSplit(element)),
      new TagAndParser('Spool', (element) => this.ParseSpool(element)),
      new TagAndParser('StreamAggregate', (element) => this.ParseStreamAggregate(element)),
      new TagAndParser('Switch', (element) => this.ParseSwitch(element)),
      new TagAndParser('TableScan', (element) => this.ParseTableScan(element)),
      new TagAndParser('TableValuedFunction', (element) => this.ParseTableValuedFunction(element)),
      new TagAndParser('Top', (element) => this.ParseTopElement(element)),
      new TagAndParser('TopSort', (element) => this.ParseTopSort(element)),
      new TagAndParser('Update', (element) => this.ParseUpdate(element)),
      new TagAndParser('IndexScan', (element) => this.ParseIndexScan(element)),
      new TagAndParser('WindowSpool', (element) => this.ParseWindow(element)),
      new TagAndParser('WindowAggregate', (element) => this.ParseWindowAggregate(element)),
    ];

/*
<xsd:element name="Generic" type="shp:GenericType"/>
<xsd:element name="Put" type="shp:PutType"/>

*/

    let action: ShowPlan.RelOpAction | undefined;
    let actionElement: Element | undefined;

    for (const tagAndParser of tagsAndParsers) {
      const childNodes = QueryHelper.GetImmediateChildNodesByTagName(
        relOpElement,
        tagAndParser.TagName,
      );
      if (childNodes.length === 1) {
        actionElement = childNodes[0];
        action = tagAndParser.Action(actionElement);
        break;
      }
    }

    if (action !== undefined && actionElement !== undefined) {
      const childOpElements = QueryHelper.GetImmediateChildNodesByTagName(actionElement, 'RelOp');

      if (childOpElements.length > 0) {
        action.RelOp = childOpElements.map((element) => this.ParseRelOp(element));
      }

      const definedValuesElement = QueryHelper.GetImmediateChildNodesByTagName(actionElement, 'DefinedValues');
      if (definedValuesElement.length === 1) {
        const definedValueElements = QueryHelper.GetImmediateChildNodesByTagName(definedValuesElement[0], 'DefinedValue');
        action.DefinedValues = definedValueElements.map((i) => this.ParseDefinedValue(i));
      }
    } else {
      action = new ShowPlan.Generic();
    }

    const avgRowSize = Convert.GetInt(relOpElement, 'AvgRowSize') as number;
    const EstimateCPU = Convert.GetFloat(relOpElement, 'EstimateCPU') as number;
    const EstimatedTotalSubtreeCost = Convert.GetFloat(
      relOpElement,
      'EstimatedTotalSubtreeCost',
    ) as number;
    const EstimateIO = Convert.GetFloat(relOpElement, 'EstimateIO') as number;
    const EstimateRebinds = Convert.GetFloat(relOpElement, 'EstimateRebinds') as number;
    const EstimateRewinds = Convert.GetFloat(relOpElement, 'EstimateRewinds') as number;
    const EstimateRows = Convert.GetFloat(relOpElement, 'EstimateRows') as number;
    const LogicalOp = Convert.GetString(relOpElement, 'LogicalOp') as ShowPlan.LogicalOpType;
    const NodeId = Convert.GetInt(relOpElement, 'NodeId') as number;
    const Parallel = Convert.GetBoolean(relOpElement, 'Parallel') as boolean;
    const PhysicalOp = Convert.GetString(relOpElement, 'PhysicalOp') as ShowPlan.PhysicalOp;

    const columnReferenceList = ColumnReferenceParser.GetAllFromElement(relOpElement, 'OutputList');

    const thisOp = new ShowPlan.RelOp(
      action,
      avgRowSize,
      EstimateCPU,
      EstimatedTotalSubtreeCost,
      EstimateIO,
      EstimateRebinds,
      EstimateRewinds,
      EstimateRows,
      LogicalOp,
      NodeId,
      Parallel,
      PhysicalOp,
      columnReferenceList,
    );

    thisOp.Warnings = QueryHelper.ParseSingleItem(relOpElement, 'Warnings', (i) => WarningsParser.ParseWarnings(i));
    thisOp.RunTimeInformation = QueryHelper.ParseSingleItem(relOpElement, 'RunTimeInformation', (i) => MetaInfoParser.ParseRunTimeInformation(i));
    return thisOp;
  }

  private static ParseGeneric(element: Element): ShowPlan.Generic {
    return new ShowPlan.Generic();
  }

  private static ParseSequence(element: Element): ShowPlan.Sequence {
    return new ShowPlan.Sequence();
  }

  private static ParseConcat(element: Element): ShowPlan.Concat {
    return new ShowPlan.Concat();
  }

  private static ParseSimpleIteratorOneChild(element: Element): ShowPlan.SimpleIteratorOneChild {
    return new ShowPlan.SimpleIteratorOneChild();
  }

  private static ParseWindow(element: Element): ShowPlan.Window {
    return new ShowPlan.Window();
  }

  private static ParseWindowAggregate(element: Element): ShowPlan.WindowAggregate {
    return new ShowPlan.WindowAggregate();
  }

  private static ParseRelOpBaseType(element: Element): ShowPlan.RelOpAction {
    return new ShowPlan.RelOpAction();
  }

  private static ParseConstantScan(element: Element): ShowPlan.ConstantScan {
    const scan = new ShowPlan.ConstantScan();
    // todo parse values. I can't find an example of this though
    return scan;
  }

  private static ParseRowSet(element: Element): ShowPlan.Rowset {
    const object = QueryHelper.GetImmediateChildNodesByTagName(element, 'Object')
      .map((i) => ObjectParser.Parse(i));

    return new ShowPlan.Rowset(object);
  }

  private static ParseSwitch(element: Element): ShowPlan.Switch {
    const $switch = new ShowPlan.Switch();
    const predicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'Predicate');
    if (predicateElements.length === 1) {
      $switch.Predicate = predicateElements.map((i) => ScalarExpressionParser.Parse(i))[0];
    }
    return $switch;
  }

  private static ParseCreateIndex(element: Element): ShowPlan.CreateIndex {
    const objectElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'Object');
    return new ShowPlan.CreateIndex(objectElement.map((i) => ObjectParser.Parse(i)));
  }

  private static ParseBitmap(element: Element): ShowPlan.Bitmap {
    const hashkeys = ColumnReferenceParser.GetAllFromElement(element, 'HashKeys');
    return new ShowPlan.Bitmap(hashkeys);
  }

  private static ParseForeignKeyReferencesCheckType(element: Element): ShowPlan.ForeignKeyReferencesCheck {
    const parseForeignKeyReferenceCheckElements = (fkElement: Element): ShowPlan.ForeignKeyReferenceCheck => {
      const indexScanElements = QueryHelper.GetImmediateChildNodesByTagName(fkElement, 'IndexScan');
      const indexScan = this.ParseIndexScan(indexScanElements[0]);
      return new ShowPlan.ForeignKeyReferenceCheck(indexScan);
    };

    const foreignKeyReferenceCheckElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ForeignKeyReferenceCheck');
    const foreignKeyReferenceCheck = foreignKeyReferenceCheckElements.map((i) => parseForeignKeyReferenceCheckElements(i));

    const check = new ShowPlan.ForeignKeyReferencesCheck(foreignKeyReferenceCheck);
    check.ForeignKeyReferencesCount = Convert.GetInt(element, 'ForeignKeyReferencesCount');
    check.NoMatchingIndexCount = Convert.GetInt(element, 'NoMatchingIndexCount');
    check.PartialMatchingIndexCount = Convert.GetInt(element, 'PartialMatchingIndexCount');

    return check;
  }

  private static ParseNestedLoop(element: Element): ShowPlan.NestedLoops {
    const optimized = Convert.GetBoolean(element, 'Optimized')!;
    const nestedLoop = new ShowPlan.NestedLoops(optimized);

    nestedLoop.WithOrderedPrefetch = Convert.GetBoolean(element, 'WithOrderedPrefetch');
    nestedLoop.WithUnorderedPrefetch = Convert.GetBoolean(element, 'WithUnorderedPrefetch');

    nestedLoop.OuterReferences = ColumnReferenceParser.GetAllFromElement(element, 'OuterReferences');

    return nestedLoop;
  }

  private static ParseBatchHashTableBuild(element: Element): ShowPlan.BatchHashTableBuild {
    const op = new ShowPlan.BatchHashTableBuild();
    op.BitmapCreator = Convert.GetBoolean(element, 'BitmapCreator');
    return op;
  }

  private static ParseSplit(element: Element): ShowPlan.Split {
    const split = new ShowPlan.Split();
    const actionColumns = ColumnReferenceParser.GetAllFromElement(element, 'ActionColumn');
    if (actionColumns.length === 1) {
      split.ActionColumn = actionColumns[0];
    }

    return split;
  }

  private static ParseUDX(element: Element): ShowPlan.UDX {
    const name = Convert.GetString(element, 'UDXName')!;
    const udx = new ShowPlan.UDX(name);

    udx.UsedUDXColumns = ColumnReferenceParser.GetAllFromElement(element, 'UsedUDXColumns');

    return udx;
  }

  private static ParseSegment(element: Element): ShowPlan.Segment {
    const groupBy = ColumnReferenceParser.GetAllFromElement(element, 'GroupBy');
    const segmentColumns = ColumnReferenceParser.GetAllFromElement(element, 'SegmentColumn');
    return new ShowPlan.Segment(groupBy, segmentColumns[0]);
  }

  private static ParseScalarInsert(element: Element): ShowPlan.ScalarInsert {
    const object = QueryHelper.GetImmediateChildNodesByTagName(element, 'Object')
      .map((i) => ObjectParser.Parse(i));

    const insert = new ShowPlan.ScalarInsert(object);

    const setPredicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SetPredicate');
    if (setPredicateElements.length === 1) {
      insert.SetPredicate = this.parseSetPredicateElementType(setPredicateElements[0]);
    }

    insert.DMLRequestSort = Convert.GetBoolean(element, 'DMLRequestSort');
    return insert;
  }

  private static ParseSimpleUpdate(element: Element): ShowPlan.SimpleUpdate {
    const object = QueryHelper.GetImmediateChildNodesByTagName(element, 'Object')
      .map((i) => ObjectParser.Parse(i));

    const update = new ShowPlan.SimpleUpdate(object);

    const seekPredicateElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicate');
    if (seekPredicateElement.length === 1) {
      update.SeekPredicate = SeekPredicateParser.ParseSeekPredicate(seekPredicateElement[0]);
    }

    const seekPredicateNewElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicateNew');
    if (seekPredicateNewElement.length === 1) {
      update.SeekPredicateNew = SeekPredicateParser.ParseSeekPredicateNew(seekPredicateNewElement[0]);
    }

    const setPredicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SetPredicate');
    if (setPredicateElements.length === 1) {
      update.SetPredicate = this.parseSetPredicateElementType(setPredicateElements[0]);
    }

    update.DMLRequestSort = Convert.GetBoolean(element, 'DMLRequestSort');
    return update;
  }

  private static ParseSpool(element: Element): ShowPlan.Spool {
    const spool = new ShowPlan.Spool();
    spool.Stack = Convert.GetBoolean(element, 'Stack');
    spool.PrimaryNodeId = Convert.GetInt(element, 'PrimaryNodeId');

    const seekPredicateElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicate');
    if (seekPredicateElement.length === 1) {
      spool.SeekPredicate = SeekPredicateParser.ParseSeekPredicate(seekPredicateElement[0]);
    }

    const seekPredicateNewElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicateNew');
    if (seekPredicateNewElement.length === 1) {
      spool.SeekPredicateNew = SeekPredicateParser.ParseSeekPredicateNew(seekPredicateNewElement[0]);
    }

    return spool;
  }

  private static ParseSort(element: Element): ShowPlan.Sort {
    const distinct = Convert.GetBoolean(element, 'Distinct')!;
    const orderByElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'OrderBy');
    const orderByColumnElements = QueryHelper.GetImmediateChildNodesByTagName(orderByElement[0], 'OrderByColumn');
    const orderBy = new ShowPlan.OrderBy(orderByColumnElements.map((i) => this.parseOrderByColumn(i)));

    return new ShowPlan.Sort(distinct, orderBy);
  }

  private static parseOrderByColumn(element: Element): ShowPlan.OrderByTypeOrderByColumn {
    const ascending = Convert.GetBoolean(element, 'Ascending')!;
    const columnReferenceElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'ColumnReference');
    const columnReference = ColumnReferenceParser.Parse(columnReferenceElement[0]);

    return new ShowPlan.OrderByTypeOrderByColumn(ascending, columnReference);
  }

  private static ParseTopSort(element: Element): ShowPlan.TopSort {
    const distinct = Convert.GetBoolean(element, 'Distinct')!;
    const orderByElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'OrderBy');
    const orderByColumnElements = QueryHelper.GetImmediateChildNodesByTagName(orderByElement[0], 'OrderByColumn');

    const orderBy = new ShowPlan.OrderBy(orderByColumnElements.map((i) => this.parseOrderByColumn(i)));
    const rows = Convert.GetInt(element, 'Rows')!;

    const sort = new ShowPlan.TopSort(rows, distinct, orderBy);
    sort.WithTies = Convert.GetBoolean(element, 'WithTies');

    return sort;
  }

  private static ParseTableValuedFunction(element: Element): ShowPlan.TableValuedFunction {
    const tvf = new ShowPlan.TableValuedFunction();

    tvf.Object = QueryHelper.ParseSingleItem(element, 'Object', (i) => ObjectParser.Parse(i));
    tvf.Predicate = QueryHelper.ParseSingleItem(element, 'Predicate', (i) => ScalarExpressionParser.Parse(i));

    const parameterListElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ParameterList');
    if (parameterListElements.length === 1) {
      const scalarElements = QueryHelper.GetImmediateChildNodesByTagName(parameterListElements[0], 'ScalarOperator');
      const scalars = scalarElements.map((i) => ScalarExpressionParser.ParseScalarType(i));
      tvf.ParameterList = new ShowPlan.ScalarExpressionList(scalars);
    }

    return tvf;
  }

  private static ParseMerge(element: Element): ShowPlan.Merge {
    const merge = new ShowPlan.Merge();
    merge.InnerSideJoinColumns = ColumnReferenceParser.GetAllFromElement(element, 'InnerSideJoinColumns');
    merge.OuterSideJoinColumns = ColumnReferenceParser.GetAllFromElement(element, 'OuterSideJoinColumns');

    const residualElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'Residual');
    if (residualElement.length === 1) {
      merge.Residual = ScalarExpressionParser.Parse(residualElement[0]);
    }

    const passThruElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'PassThru');
    if (passThruElement.length === 1) {
      merge.PassThru = ScalarExpressionParser.Parse(passThruElement[0]);
    }

    const starJoinElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'StarJoinInfo');
    if (starJoinElement.length === 1) {
      merge.StarJoinInfo = this.ParseStarJoinInfo(starJoinElement[0]);
    }

    merge.ManyToMany = Convert.GetBoolean(element, 'ManyToMany');
    return merge;
  }

  private static ParseAdaptiveJoin(element: Element): ShowPlan.AdaptiveJoin {
    const optimized = Convert.GetBoolean(element, 'Optimized')!;
    const adaptiveJoin = new ShowPlan.AdaptiveJoin(optimized);

    adaptiveJoin.HashKeysBuild = ColumnReferenceParser.GetAllFromElement(element, 'HashKeysBuild');
    adaptiveJoin.HashKeysProbe = ColumnReferenceParser.GetAllFromElement(element, 'HashKeysProbe');

    const buildResidualElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'BuildResidual');
    if (buildResidualElement.length === 1) {
      adaptiveJoin.BuildResidual = ScalarExpressionParser.Parse(buildResidualElement[0]);
    }

    const probeElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'ProbeResidual');
    if (probeElement.length === 1) {
      adaptiveJoin.ProbeResidual = ScalarExpressionParser.Parse(probeElement[0]);
    }

    const starJoinElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'StarJoinInfo');
    if (starJoinElement.length === 1) {
      adaptiveJoin.StarJoinInfo = this.ParseStarJoinInfo(starJoinElement[0]);
    }

    const passThruElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'BuildResidual');
    if (passThruElement.length === 1) {
      adaptiveJoin.PassThru = ScalarExpressionParser.Parse(passThruElement[0]);
    }

    adaptiveJoin.OuterReferences = ColumnReferenceParser.GetAllFromElement(element, 'OuterReferences');
    const partitionIdElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'PartitionId');
    if (partitionIdElement.length === 1) {
      adaptiveJoin.PartitionId = ColumnReferenceParser.Parse(partitionIdElement[0]);
    }

    adaptiveJoin.BitmapCreator = Convert.GetBoolean(element, 'BitmapCreator');

    return adaptiveJoin;
  }

  private static ParseStreamAggregate(element: Element): ShowPlan.StreamAggregate {
    const groupBy = ColumnReferenceParser.GetAllFromElement(element, 'GroupBy');

    const stream = new ShowPlan.StreamAggregate();
    stream.GroupBy = groupBy;
    return stream;
  }

  private static ParseDefinedValue(element: Element): ShowPlan.DefinedValue {
    const definedValue = new ShowPlan.DefinedValue();

    const columnReferenceElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ColumnReference');
    if (columnReferenceElements.length > 0) {
      definedValue.ColumnReference = columnReferenceElements.map((i) => ColumnReferenceParser.Parse(i));
    }

    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    if (scalarOperatorElements.length === 1) {
      definedValue.ScalarOperator = ScalarExpressionParser.ParseScalarType(scalarOperatorElements[0]);
    }

    return definedValue;
  }

  private static ParseTableScan(element: Element): ShowPlan.TableScan {
    const ordered = Convert.GetBoolean(element, 'Ordered')!;
    const object = QueryHelper.GetImmediateChildNodesByTagName(element, 'Object')
      .map((i) => ObjectParser.Parse(i));
    const scan = new ShowPlan.TableScan(object, ordered);

    const predicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'Predicate');
    if (predicateElements.length === 1) {
      scan.Predicate = predicateElements.map((i) => ScalarExpressionParser.Parse(i))[0];
    }

    const partitionIdElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'PartitionId');
    if (partitionIdElement.length === 1) {
      scan.PartitionId = ColumnReferenceParser.Parse(partitionIdElement[0]);
    }

    const indexViewInfoElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'IndexedViewInfo');
    if (indexViewInfoElement.length === 1) {
      const objects = QueryHelper.GetImmediateChildNodesByTagName(indexViewInfoElement[0], 'Object');
      scan.IndexedViewInfo = objects.map((i) => ObjectParser.Parse(i));
    }

    scan.ForcedIndex = Convert.GetBoolean(element, 'ForcedIndex');
    scan.ForceScan = Convert.GetBoolean(element, 'ForceScan');
    scan.NoExpandHint = Convert.GetBoolean(element, 'NoExpandHint');
    scan.Storage = Convert.GetString(element, 'Storage') as ShowPlan.StorageType;

    return scan;
  }

  private static parseSetPredicateElementType(element: Element): ShowPlan.SetPredicateElement {
    const predicateElement = ScalarExpressionParser.Parse(element) as ShowPlan.SetPredicateElement;
    predicateElement.SetPredicateType = Convert.GetString(element, 'SetPredicateType') as ShowPlan.SetPredicateType;

    return predicateElement;
  }

  private static ParseUpdate(element: Element): ShowPlan.Update {
    const objects = QueryHelper.GetImmediateChildNodesByTagName(element, 'Object').map((i) => ObjectParser.Parse(i));
    const update = new ShowPlan.Update(objects);
    const setPredicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SetPredicate');
    if (setPredicateElements.length > 0) {
      update.SetPredicate = setPredicateElements.map((i) => this.parseSetPredicateElementType(i));
    }

    const probeColumnElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'ProbeColumn');
    if (probeColumnElement.length === 1) {
      update.ProbeColumn = ColumnReferenceParser.Parse(probeColumnElement[0]);
    }

    const actionColumnElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'ActionColumn');
    if (actionColumnElement.length === 1) {
      update.ActionColumn = ColumnReferenceParser.Parse(actionColumnElement[0]);
    }

    const originalActionColumnElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'OriginalActionColumn');
    if (originalActionColumnElement.length === 1) {
      update.OriginalActionColumn = ColumnReferenceParser.Parse(originalActionColumnElement[0]);
    }

    update.WithOrderedPrefetch = Convert.GetBoolean(element, 'WithOrderedPrefetch');
    update.WithUnorderedPrefetch = Convert.GetBoolean(element, 'WithUnorderedPrefetch');
    update.DMLRequestSort = Convert.GetBoolean(element, 'DMLRequestSort');

    return update;
  }

  private static ParseCollapse(element: Element): ShowPlan.Collapse {
    const collapse = new ShowPlan.Collapse(ColumnReferenceParser.GetAllFromElement(element, 'GroupBy'));
    return collapse;
  }

  private static ParseHash(element: Element): ShowPlan.Hash {
    const hash = new ShowPlan.Hash();
    hash.HashKeysBuild = ColumnReferenceParser.GetAllFromElement(element, 'HashKeysBuild');
    hash.HashKeysProbe = ColumnReferenceParser.GetAllFromElement(element, 'HashKeysProbe');

    const probeElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'ProbeResidual');
    if (probeElement.length === 1) {
      hash.ProbeResidual = ScalarExpressionParser.Parse(probeElement[0]);
    }

    const starJoinElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'StarJoinInfo');
    if (starJoinElement.length === 1) {
      hash.StarJoinInfo = this.ParseStarJoinInfo(starJoinElement[0]);
    }

    return hash;
  }

  private static ParseFilterElement(filterElement: Element): ShowPlan.RelOpAction {
    const startUpExpression = Convert.GetBoolean(filterElement, 'StartupExpression') as boolean;
    const predicateElement = QueryHelper.GetImmediateChildNodesByTagName(filterElement, 'Predicate');
    const filter = new ShowPlan.Filter(startUpExpression, ScalarExpressionParser.Parse(predicateElement[0]));
    if (filterElement.tagName.toUpperCase() === 'ASSERT') {
      filter.IsAssert = true;
    }

    return filter;
  }

  private static ParseComputeScalar(element: Element): ShowPlan.ComputeScalar {
    const op = new ShowPlan.ComputeScalar();
    op.ComputeSequence = Convert.GetBoolean(element, 'ComputeSequence');
    return op;
  }

  private static ParseParallelism(element: Element): ShowPlan.Parallelism {
    const op = new ShowPlan.Parallelism();

    return op;
  }

  private static ParseTopElement(topElement: Element): ShowPlan.Top {
    const isPercent = Convert.GetBoolean(topElement, 'IsPercent');
    const rowCount = Convert.GetBoolean(topElement, 'RowCount');
    const rows = Convert.GetInt(topElement, 'Rows');
    const withTies = Convert.GetBoolean(topElement, ' WithTies');
    const topExpressionElements = QueryHelper.GetImmediateChildNodesByTagName(topElement, 'TopExpression');

    const top = new ShowPlan.Top();
    top.IsPercent = isPercent;
    top.RowCount = rowCount;
    top.Rows = rows;
    top.WithTies = withTies;

    if (topExpressionElements.length === 1) {
      top.TopExpression = ScalarExpressionParser.Parse(topExpressionElements[0]);
    }

    return top;
  }

  private static ParseIndexScan(element: Element): ShowPlan.IndexScan {
    const ordered = Convert.GetBoolean(element, 'Ordered') as boolean;
    const objectElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'Object');
    const indexScan = new ShowPlan.IndexScan(objectElement.map((i) => ObjectParser.Parse(i)), ordered);

    const seekPredicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'SeekPredicates');
    if (seekPredicateElements.length === 1) {
      indexScan.SeekPredicates = SeekPredicateParser.ParseSeekPredicates(seekPredicateElements[0]);
    }

    const predicateElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'Predicate');
    if (predicateElements.length > 0) {
      indexScan.Predicate = predicateElements.map((i) => ScalarExpressionParser.Parse(i));
    }

    const partitionIdElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'PartitionId');
    if (partitionIdElement.length === 1) {
      indexScan.PartitionId = ColumnReferenceParser.Parse(partitionIdElement[0]);
    }

    const indexViewInfoElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'IndexedViewInfo');
    if (indexViewInfoElement.length === 1) {
      const objects = QueryHelper.GetImmediateChildNodesByTagName(indexViewInfoElement[0], 'Object');
      indexScan.IndexedViewInfo = objects.map((i) => ObjectParser.Parse(i));
    }

    indexScan.Lookup = Convert.GetBoolean(element, 'Lookup');
    indexScan.ScanDirection = Convert.GetString(element, 'ScanDirection') as ShowPlan.OrderType;
    indexScan.ForcedIndex = Convert.GetBoolean(element, 'ForcedIndex');
    indexScan.NoExpandHint = Convert.GetBoolean(element, 'NoExpandHint');
    indexScan.Storage = Convert.GetString(element, 'Storage') as ShowPlan.StorageType;
    indexScan.DynamicSeek = Convert.GetBoolean(element, 'DynamicSeek');

    return indexScan;
  }

  private static ParseStarJoinInfo(element: Element): ShowPlan.StarJoinInfo {
    const operationType = Convert.GetString(element, 'OperationType') as ShowPlan.StarJoinInfoTypeOperationType;
    const starJoin = new ShowPlan.StarJoinInfo(operationType);
    starJoin.Root = Convert.GetBoolean(element, 'Root');

    return starJoin;
  }

  /* remote types */
  private static ApplyRemoteAttributes(element: Element, remote: ShowPlan.Remote) {
    remote.RemoteDestination = Convert.GetString(element, 'RemoveDestination');
    remote.RemoteSource = Convert.GetString(element, 'RemoteSource');
    remote.RemoteObject = Convert.GetString(element, 'RemoteObject');
  }

  private static ParseRemote(element: Element): ShowPlan.Remote {
    const remote = new ShowPlan.Remote();
    this.ApplyRemoteAttributes(element, remote);
    return remote;
  }

  private static ParseRemoteRange(element: Element): ShowPlan.RemoteRange {
    const range = new ShowPlan.RemoteRange();
    this.ApplyRemoteAttributes(element, range);
    range.SeekPredicates = QueryHelper.ParseSingleItem(element, 'SeekPredicates', (i) => SeekPredicateParser.ParseSeekPredicates(i));
    return range;
  }

  private static ParseRemoteFetch(element: Element): ShowPlan.RemoteFetch {
    const fetch = new ShowPlan.RemoteFetch();
    this.ApplyRemoteAttributes(element, fetch);
    return fetch;
  }

  private static ParseRemoteModify(element: Element): ShowPlan.RemoteModify {
    const modify = new ShowPlan.RemoteModify();
    this.ApplyRemoteAttributes(element, modify);
    modify.SetPredicate = QueryHelper.ParseSingleItem(element, 'SetPredicate', (i) => ScalarExpressionParser.Parse(i));
    return modify;
  }

  private static ParseRemoteQuery(element: Element): ShowPlan.RemoteQuery {
    const query = new ShowPlan.RemoteQuery();
    this.ApplyRemoteAttributes(element, query);
    query.RemoteQuery = Convert.GetString(element, 'RemoteQuery');
    return query;
  }

  private static ParsePut(element: Element): ShowPlan.Put {
    const query = new ShowPlan.Put();
    this.ApplyRemoteAttributes(element, query);
    query.RemoteQuery = Convert.GetString(element, 'RemoteQuery');
    query.ShuffleColumn = Convert.GetString(element, 'ShuffleColumn');
    query.ShuffleType = Convert.GetString(element, 'ShuffleType');
    return query;
  }
}

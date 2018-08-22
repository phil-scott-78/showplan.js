import { Guid } from 'guid-typescript';

/** This is the root element */
export class ShowPlanXML {
  public Build: string;
  public ClusteredMode?: boolean;
  public Version: string;
  public Batches: ShowPlanXMLTypeBatchSequenceTypeBatch[];

  constructor(
    Build: string,
    ClusteredMode: boolean,
    Version: string,
    Batches: ShowPlanXMLTypeBatchSequenceTypeBatch[],
  ) {
    this.Build = Build;
    this.ClusteredMode = ClusteredMode;
    this.Version = Version;
    this.Batches = Batches;
  }

  public GetStatementByGuid(guid: string): BaseStmtInfo | undefined {
    for (const batch of this.Batches) {
      for (const statement of batch.Statements) {
        if (statement.Guid === guid) {
           return statement;
        }
      }
    }

    return undefined;
  }

  public IsEstimatedPlan(): boolean {
    for (const batch of this.Batches) {
      for (const statement of batch.Statements) {
        if (!(statement instanceof StmtSimple)) { continue; }
        const queryPlan = (statement as StmtSimple).QueryPlan;
        if (queryPlan === undefined) { continue; }

        if (queryPlan.RelOp.RunTimeInformation !== undefined) {
          return false;
        }
      }
    }

    return true;
  }
}

export class RelOpAction {
  public RelOp: RelOp[] = [];
  public DefinedValues?: DefinedValue[];
}

export class RelOp {
  public AdaptiveThresholdRows?: number;
  public AvgRowSize: number;
  public EstimateCPU: number;
  public EstimatedExecutionMode?: ExecutionModeType;
  public EstimatedJoinType?: PhysicalOp;
  public EstimatedRowsRead?: number;
  public EstimatedTotalSubtreeCost: number;
  public EstimateIO: number;
  public get EstimateTotalCost(): number {
    // one would think this would simply be
    // return this.EstimateCPU + this.EstimateIO;
    // but in fact it's the subree cost subtracking the subtree cost of it's children

    if (!this.Action.RelOp.length) {
      return this.EstimatedTotalSubtreeCost;
    }

    let sum = 0;
    for (const relOp of this.Action.RelOp) {
      sum += relOp.EstimatedTotalSubtreeCost;
    }

    const estimate = this.EstimatedTotalSubtreeCost - sum;
    if (estimate > 0) {
      return estimate;
    }

    return 0;
  }
  public EstimateRebinds: number;
  public EstimateRewinds: number;
  public EstimateRows: number;
  public GroupExecuted?: boolean;
  public IsAdaptive?: boolean;
  public LogicalOp: LogicalOpType;
  public NodeId: number;
  public Parallel: boolean;
  public Partitioned?: boolean;
  public PhysicalOp: PhysicalOp;
  public RemoteDataAccess?: boolean;
  public StatsCollectionId?: number;
  public TableCardinality?: number;
  public OutputList: ColumnReference[];
  public RunTimeInformation?: RunTimeInformation;
  public MemoryFractions?: MemoryFractions;
  public Action: RelOpAction;
  public Warnings?: Warnings;

  constructor(
    Action: RelOpAction,
    AvgRowSize: number,
    EstimateCPU: number,
    EstimatedTotalSubtreeCost: number,
    EstimateIO: number,
    EstimateRebinds: number,
    EstimateRewinds: number,
    EstimateRows: number,
    LogicalOp: LogicalOpType,
    NodeId: number,
    Parallel: boolean,
    PhysicalOperation: PhysicalOp,
    OutputList: ColumnReference[],
  ) {
    this.Action = Action;
    this.AvgRowSize = AvgRowSize;
    this.EstimateCPU = EstimateCPU;
    this.EstimatedTotalSubtreeCost = EstimatedTotalSubtreeCost;
    this.EstimateIO = EstimateIO;
    this.EstimateRebinds = EstimateRebinds;
    this.EstimateRewinds = EstimateRewinds;
    this.EstimateRows = EstimateRows;
    this.LogicalOp = LogicalOp;
    this.NodeId = NodeId;
    this.Parallel = Parallel;
    this.PhysicalOp = PhysicalOperation;
    this.OutputList = OutputList;
  }

  /* replaced with child items
  AdaptiveJoin: AdaptiveJoin;
  Assert: Filter;
  BatchHashTableBuild: BatchHashTableBuild;
  Bitmap: Bitmap;
  Collapse: Collapse;
  ComputeScalar: ComputeScalar;
  Concat: Concat;
  ConstantScan: ConstantScan;
  CreateIndex: CreateIndex;
  DeletedScan: Rowset;
  Extension: UDX;
  Filter: Filter;
  ForeignKeyReferencesCheck: ForeignKeyReferencesCheck;
  Generic: Generic;
  Hash: Hash;
  IndexScan: IndexScan;
  InsertedScan: Rowset;
  InternalInfo?: InternalInfo;
  LogRowScan: RelOp;
  Merge: Merge;
  MergeInterval: SimpleIteratorOneChild;
  NestedLoops: NestedLoops;
  OnlineIndex: CreateIndex;
  Parallelism: Parallelism;
  ParameterTableScan: RelOp;
  PrintDataflow: RelOp;
  Put: Put;
  RemoteFetch: RemoteFetch;
  RemoteModify: RemoteModify;
  RemoteQuery: RemoteQuery;
  RemoteRange: RemoteRange;
  RemoteScan: Remote;
  RowCountSpool: Spool;
  RunTimePartitionSummary?: RunTimePartitionSummary;
  ScalarInsert: ScalarInsert;
  Segment: Segment;
  Sequence: Sequence;
  SequenceProject: ComputeScalar;
  SimpleUpdate: SimpleUpdate;
  Sort: Sort | undefined;
  Split: Split | undefined;
  Spool: Spool | undefined;
  StreamAggregate: StreamAggregate | undefined;
  Switch: Switch | undefined;
  TableScan: TableScan | undefined;
  TableValuedFunction: TableValuedFunction | undefined;
  Top: Top | undefined;
  TopSort: TopSort;
  Update: Update;
  Warnings?: Warnings;
  WindowAggregate: WindowAggregate;
  WindowSpool: Window;
  */
}

export class Rowset extends RelOpAction {
  public Object: ObjectType[];

  constructor(object: ObjectType[]) {
    super();
    this.Object = object;
  }
}

/** The Adaptive Join element replaces a adaptive concat with Hash Join and Nested loops as inputs. This element
 * will have 3 inputs the two children of the HJ and the inner child of the NLJ. We append the required HJ and NLJ properties to the new
 * AdaptiveJoin showplan element.
 */
export class AdaptiveJoin extends RelOpAction {
  public BitmapCreator?: boolean;
  public Optimized: boolean;
  public BuildResidual?: ScalarExpression;
  public HashKeysBuild?: ColumnReference[];
  public HashKeysProbe?: ColumnReference[];
  public OuterReferences?: ColumnReference[];
  public PartitionId?: ColumnReference;
  public PassThru?: ScalarExpression;
  public Predicate?: ScalarExpression;
  public ProbeResidual?: ScalarExpression;
  public StarJoinInfo?: StarJoinInfo;

  constructor(optimized: boolean) {
    super();
    this.Optimized = optimized;
  }
}

/** Warning information for plan-affecting type conversion */
export class AffectingConvertWarning {
  public ConvertIssue: AffectingConvertWarningTypeConvertIssue;
  public Expression: string;

  constructor(convertIssue: AffectingConvertWarningTypeConvertIssue, expression: string) {
    this.ConvertIssue = convertIssue;
    this.Expression = expression;
  }
}

export type AffectingConvertWarningTypeConvertIssue = 'Cardinality Estimate' | 'Seek Plan';

export class Aggregate implements ScalarOp {
  public AggType: string;
  public Distinct: boolean;
  public ScalarOperator?: Scalar[];

  constructor(AggType: string, Distinct: boolean) {
    this.AggType = AggType;
    this.Distinct = Distinct;
  }
}

export type ArithmeticOperation =
  | 'ADD'
  | 'BIT_ADD'
  | 'BIT_AND'
  | 'BIT_COMBINE'
  | 'BIT_NOT'
  | 'BIT_OR'
  | 'BIT_XOR'
  | 'DIV'
  | 'HASH'
  | 'MINUS'
  | 'MOD'
  | 'MULT'
  | 'SUB';

export class Arithmetic implements ScalarOp {
  public Operation: ArithmeticOperation;
  public ScalarOperator: Scalar[];

  constructor(Operation: ArithmeticOperation, ScalarOperator: Scalar[]) {
    this.Operation = Operation;
    this.ScalarOperator = ScalarOperator;
  }
}

export class Assign implements ScalarOp {
  public ColumnReference: ColumnReference;
  public ScalarOperator: Scalar;

  constructor(ColumnRef: ColumnReference, ScalarOperator: Scalar) {
    this.ColumnReference = ColumnRef;
    this.ScalarOperator = ScalarOperator;
  }
}

/** the type that contains the basic statement information */
export class BaseStmtInfo {
  public Batch?: ShowPlanXMLTypeBatchSequenceTypeBatch;
  public BatchSqlHandle?: string;
  public CardinalityEstimationModelVersion?: string;
  public DatabaseContextSettingsId?: number;
  public ParameterizedPlanHandle?: string;
  public ParameterizedText?: string;
  public ParentObjectId?: number;
  public PlanGuideDB?: string;
  public PlanGuideName?: string;
  public QueryHash?: string;
  public QueryPlanHash?: string;
  public RetrievedFromCache?: string;
  public SecurityPolicyApplied?: boolean;
  public StatementCompId?: number;
  public StatementEstRows?: number;
  public StatementId?: number;
  public StatementOptmEarlyAbortReason?: BaseStmtInfoTypeStatementOptmEarlyAbortReason;
  public StatementOptmLevel?: string;
  public StatementParameterizationType?: number;
  public StatementSqlHandle?: string;
  public StatementSubTreeCost?: number;
  public StatementText?: string;
  public StatementType?: string;
  public TemplatePlanGuideDB?: string;
  public TemplatePlanGuideName?: string;
  public StatementSetOptions?: SetOptions;
  public Guid: string = Guid.create().toString();

  public CostPercentOfBatch(): number | undefined {
    if (this.Batch === undefined) {
      return undefined;
    }

    if (this.StatementSubTreeCost === undefined) {
      return undefined;
    }

    const total =  this.Batch!.Statements
      .filter((i) => i.StatementSubTreeCost !== undefined)
      .map((i) => i.StatementSubTreeCost!)
      .reduce((sum, current) => sum + current);

    return this.StatementSubTreeCost! / total;
  }
}

export type BaseStmtInfoTypeStatementOptmEarlyAbortReason =
  | 'TimeOut'
  | 'MemoryLimitExceeded'
  | 'GoodEnoughPlanFound';

export class BatchHashTableBuild extends RelOpAction {
  public BitmapCreator?: boolean;
}

export class Bitmap extends RelOpAction {
  public HashKeys: ColumnReference[];

  public constructor(hashKeys: ColumnReference[]) {
    super();
    this.HashKeys = hashKeys;
  }
}

export type CloneAccessScope = 'Primary' | 'Secondary' | 'Both' | 'Either' | 'ExactMatch' | 'Local';

export class CLRFunction {
  public Assembly?: string;
  public Class: string;
  public Method?: string;

  constructor($class: string) {
    this.Class = $class;
  }
}

export class Collapse extends RelOpAction {
  public GroupBy: ColumnReference[];

  constructor(groupBy: ColumnReference[]) {
    super();
    this.GroupBy = groupBy;
  }
}

export class ColumnGroup {
  public Usage: ColumnGroupTypeUsage;
  public Column: Column[];

  constructor(usage: ColumnGroupTypeUsage, column: Column[]) {
    this.Usage = usage;
    this.Column = column;
  }
}

export type ColumnGroupTypeUsage = 'EQUALITY' | 'INEQUALITY' | 'INCLUDE';

export class ColumnReference {
  public Alias?: string;
  public Column: string;
  public ComputedColumn?: boolean;
  public Database?: string;
  public ParameterCompiledValue?: string;
  public ParameterDataType?: string;
  public ParameterRuntimeValue?: string;
  public Schema?: string;
  public Server?: string;
  public Table?: string;
  public ScalarOperator?: Scalar;

  constructor(ColumnName: string) {
    this.Column = ColumnName;
  }

  public toString(): string {
    let out = '';
    if (this.Database !== undefined) {
      out += this.Database + '.';
    }

    if (this.Schema !== undefined) {
      out += this.Schema + '.';
    }
    if (this.Table !== undefined) {
      out += this.Table + '.';
    }

    out += this.Column;

    if (this.Alias !== undefined) {
      out += 'out as ' + this.Alias;
    }
    return out;
  }
}

export class Column {
  public ColumnId: number;
  public Name: string;

  constructor(columnId: number, name: string) {
    this.ColumnId = columnId;
    this.Name = name;
  }
}

export type CompareOp =
  | 'BINARY IS'
  | 'BOTH NULL'
  | 'EQ'
  | 'GE'
  | 'GT'
  | 'IS'
  | 'IS NOT'
  | 'IS NOT NULL'
  | 'IS NULL'
  | 'LE'
  | 'LT'
  | 'NE'
  | 'ONE NULL';

export class CompareType implements ScalarOp {
  public CompareOp: CompareOp;
  public ScalarOperator: Scalar[];

  constructor(compareOp: CompareOp, scalarOperator: Scalar[]) {
    this.CompareOp = compareOp;
    this.ScalarOperator = scalarOperator;
  }
}

export class ComputeScalar extends RelOpAction {
  public ComputeSequence?: boolean;
}

export class Concat extends RelOpAction {}

export class Conditional implements ScalarOp {
  public Condition: ScalarExpression;
  public Else: ScalarExpression;
  public Then: ScalarExpression;

  constructor(condition: ScalarExpression, $else: ScalarExpression, then: ScalarExpression) {
    this.Condition = condition;
    this.Else = $else;
    this.Then = then;
  }
}

export class ConstantScan extends RelOpAction {
  public Values?: ScalarExpressionList[];
}

export class Const implements ScalarOp {
  public ConstValue: string;

  constructor(constValue: string) {
    this.ConstValue = constValue;
  }
}

export class Convert implements ScalarOp {
  public DataType: string;
  public Implicit: boolean;
  public Length?: number;
  public Precision?: number;
  public Scale?: number;
  public Style: number;
  public ScalarOperator: Scalar;

  constructor(dataType: string, implicit: boolean, style: number, scalarOperator: Scalar) {
    this.DataType = dataType;
    this.Implicit = implicit;
    this.Style = style;
    this.ScalarOperator = scalarOperator;
  }
}

export class CreateIndex extends Rowset {}

interface CursorPlan {
  CursorActualType: CursorType;
  CursorConcurrency: CursorPlanTypeCursorConcurrency;
  CursorName: string;
  CursorRequestedType: CursorType;
  ForwardOnly: boolean;
  /** The number of occure time depends on how we define the cursor
   * schema. In shiloh, the OPEN CURSOR and FETCH CURSOR doesn't show any plan and won't raise
   * error if the cursor doesn't exist. So we must keep the same behaivor, so the minOccurs is 0. If we allow
   * the declare cursor to be executed in showplan mode, then the open cursor and declare cursor will have
   * plan in showplan mode, the minOccurs will be 1
   */
  Operation?: CursorPlanTypeOperation[];
}

type CursorPlanTypeCursorConcurrency = 'Read Only' | 'Pessimistic' | 'Optimistic';

interface CursorPlanTypeOperation {
  OperationType: CursorPlanTypeOperationTypeOperationType;
  QueryPlan: QueryPlan;
  UDF?: FunctionPlan[];
}

type CursorPlanTypeOperationTypeOperationType = 'FetchQuery' | 'PopulateQuery' | 'RefreshQuery';

export type CursorType = 'Dynamic' | 'FastForward' | 'Keyset' | 'SnapShot';

export class DefinedValue {
  public ColumnReference?: ColumnReference[];
  public ScalarOperator?: Scalar;
  public ValueVector?: ColumnReference[];
}

export type ExecutionModeType = 'Row' | 'Batch';

export class Filter extends RelOpAction {
  public StartupExpression: boolean;
  public Predicate: ScalarExpression;
  public IsAssert?: boolean;

  constructor(StartupExpression: boolean, Predicate: ScalarExpression) {
    super();
    this.StartupExpression = StartupExpression;
    this.Predicate = Predicate;
  }
}

export class ForeignKeyReferenceCheck {
  public IndexScan: IndexScan;

  constructor(indexScan: IndexScan) {
    this.IndexScan = indexScan;
  }
}

export class ForeignKeyReferencesCheck extends RelOpAction {
  public ForeignKeyReferencesCount?: number;
  public NoMatchingIndexCount?: number;
  public PartialMatchingIndexCount?: number;
  public ForeignKeyReferenceCheck: ForeignKeyReferenceCheck[];

  constructor(foreignKeyReferenceCheck: ForeignKeyReferenceCheck[]) {
    super();
    this.ForeignKeyReferenceCheck = foreignKeyReferenceCheck;
  }
}

/** Shows the plan for the UDF or stored procedure */
export interface FunctionPlan {
  IsNativelyCompiled?: boolean;
  ProcName: string;
  Statements: BaseStmtInfo;
}

export class Generic extends RelOpAction {}

interface GuessedSelectivity {
  Spatial: ObjectType;
}

/** Hash spill details */
export class HashSpillDetails {
  public GrantedMemoryKb?: number;
  public ReadsFromTempDb?: number;
  public UsedMemoryKb?: number;
  public WritesToTempDb?: number;
}

export class Hash extends RelOpAction {
  public BitmapCreator?: boolean;
  public BuildResidual?: ScalarExpression;
  public HashKeysBuild?: ColumnReference[];
  public HashKeysProbe?: ColumnReference[];
  public ProbeResidual?: ScalarExpression;
  public StarJoinInfo?: StarJoinInfo;
}

export class Ident implements ScalarOp {
  public Table: string;
  public ColumnReference?: ColumnReference;

  constructor(table: string) {
    this.Table = table;
  }
}

export type IndexKindType =
  | 'Heap'
  | 'Clustered'
  | 'FTSChangeTracking'
  | 'FTSMapping'
  | 'NonClustered'
  | 'PrimaryXML'
  | 'SecondaryXML'
  | 'Spatial'
  | 'ViewClustered'
  | 'ViewNonClustered'
  | 'NonClusteredHash'
  | 'SelectiveXML'
  | 'SecondarySelectiveXML';

export class IndexScan extends Rowset {
  public DynamicSeek?: boolean;
  public ForcedIndex?: boolean;
  public ForceScan?: boolean;
  public ForceSeek?: boolean;
  public ForceSeekColumnCount?: number;
  public Lookup?: boolean;
  public NoExpandHint?: boolean;
  public Ordered: boolean;
  public ScanDirection?: OrderType;
  public Storage?: StorageType;
  public IndexedViewInfo?: ObjectType[];
  public PartitionId?: ColumnReference;
  public Predicate?: ScalarExpression[];
  public SeekPredicates?: SeekPredicates;

  constructor(object: ObjectType[], ordered: boolean) {
    super(object);
    this.Ordered = ordered;
  }
}

export class Intrinsic implements ScalarOp {
  public FunctionName: string;
  public ScalarOperator?: Scalar[];

  constructor(functionName: string) {
    this.FunctionName = functionName;
  }
}

export type LogicalOperationType =
  | 'AND'
  | 'IMPLIES'
  | 'IS NOT NULL'
  | 'IS NULL'
  | 'IS'
  | 'IsFalseOrNull'
  | 'NOT'
  | 'OR'
  | 'XOR';

/** These are the logical operators to which "query"
 * portions of T-SQL statement are translated. Subsequent
 * to that translation, a physical operator is chosen for
 * evaluating each logical operator. The SQL Server query
 * optimizer uses a cost-based approach to decide which
 * physical operator will implement a logical operator.
 */
export type LogicalOpType =
  | 'Aggregate'
  | 'Anti Diff'
  | 'Assert'
  | 'Async Concat'
  | 'Batch Hash Table Build'
  | 'Bitmap Create'
  | 'Clustered Index Scan'
  | 'Clustered Index Seek'
  | 'Clustered Update'
  | 'Collapse'
  | 'Compute Scalar'
  | 'Concatenation'
  | 'Constant Scan'
  | 'Cross Join'
  | 'Delete'
  | 'Deleted Scan'
  | 'Distinct Sort'
  | 'Distinct'
  | 'Distribute Streams'
  | 'Eager Spool'
  | 'Filter'
  | 'Flow Distinct'
  | 'Foreign Key References Check'
  | 'Full Outer Join'
  | 'Gather Streams'
  | 'Generic'
  | 'Index Scan'
  | 'Index Seek'
  | 'Inner Join'
  | 'Insert'
  | 'Inserted Scan'
  | 'Intersect'
  | 'Intersect All'
  | 'Lazy Spool'
  | 'Left Anti Semi Join'
  | 'Left Diff'
  | 'Left Diff All'
  | 'Left Outer Join'
  | 'Left Semi Join'
  | 'Log Row Scan'
  | 'Merge'
  | 'Merge Interval'
  | 'Merge Stats'
  | 'Parameter Table Scan'
  | 'Partial Aggregate'
  | 'Print'
  | 'Put'
  | 'Rank'
  | 'Remote Delete'
  | 'Remote Index Scan'
  | 'Remote Index Seek'
  | 'Remote Insert'
  | 'Remote Query'
  | 'Remote Scan'
  | 'Remote Update'
  | 'Repartition Streams'
  | 'RID Lookup'
  | 'Right Anti Semi Join'
  | 'Right Diff'
  | 'Right Diff All'
  | 'Right Outer Join'
  | 'Right Semi Join'
  | 'Segment'
  | 'Sequence'
  | 'Sort'
  | 'Split'
  | 'Switch'
  | 'Table-valued function'
  | 'Table Scan'
  | 'Top'
  | 'TopN Sort'
  | 'UDX'
  | 'Union'
  | 'Update'
  | 'Local Stats'
  | 'Window Spool'
  | 'Window Aggregate'
  | 'Key Lookup'
  | 'Root'
  ;

export class Logical implements ScalarOp {
  public Operation: LogicalOperationType;
  public ScalarOperator: Scalar[];

  constructor(operation: LogicalOperationType, scalarOperator: Scalar[]) {
    this.Operation = operation;
    this.ScalarOperator = scalarOperator;
  }
}

/** For memory consuming relational operators, show fraction of memory grant iterator will use */
interface MemoryFractions {
  Input: number;
  Output: number;
}

/** Provide memory grant estimate as well as actual runtime memory grant information.
 * Serial required/desired memory attributes are estimated during query compile time for serial execution.
 * The rest of attributes provide estimates and counters for query execution time considering actual degree of parallelism.
 * SerialRequiredMemory: Required memory in KB if the query runs in serial mode. The query will not start without this memory.
 * SerialDesiredMemory: Memory estimated to fit intermediate results in KB if the query runs in serial mode.
 * RequiredMemory: Required memory in KB for the chosen degree of parallelism. If the query runs in serial mode, this is the same as SerialRequiredMemory.
 * DesiredMemory: Memory estimated to fit intermediate results in KB for the chosen degree of parallelism.  If the query runs in serial mode, this is the same as SerialDesiredMemory.
 * RequestedMemory: Memory in KB which the query requests the memory manager to grant. This can be smaller than sum of RequiredMemory and DesiredMemory if it exceeds the maximum allowed for single query.
 * GrantWaitTime: Time in seconds if the query has to wait for successful memory grant.
 * MaxUsedMemory: Maximum memory in KB used by the query.
 * MaxQueryMemory: Maximum memory in KB allowed for single query.
 */
export class MemoryGrant {
  public DesiredMemory?: number;
  public GrantedMemory?: number;
  public GrantWaitTime?: number;
  public MaxQueryMemory?: number;
  public MaxUsedMemory?: number;
  public RequestedMemory?: number;
  public RequiredMemory?: number;
  public SerialDesiredMemory: number;
  public SerialRequiredMemory: number;

  constructor(serialDesiredMemory: number, serialRequiredMemory: number) {
    this.SerialDesiredMemory = serialDesiredMemory;
    this.SerialRequiredMemory = serialRequiredMemory;
  }
}

/** Provide warning information for memory grant.
 * GrantWarningKind: Warning kind
 * RequestedMemory: Initial grant request in KB
 * GrantedMemory: Granted memory in KB
 * MaxUsedMemory: Maximum used memory grant in KB
 */
export class MemoryGrantWarningInfo {
  public GrantedMemory: number;
  public GrantWarningKind: MemoryGrantWarningType;
  public MaxUsedMemory: number;
  public RequestedMemory: number;

  constructor(grantedMemory: number, grantWarningKind: MemoryGrantWarningType, maxUsedMemory: number, requestedMemory: number) {
    this.GrantedMemory = grantedMemory;
    this.GrantWarningKind = grantWarningKind;
    this.MaxUsedMemory = maxUsedMemory;
    this.RequestedMemory = requestedMemory;
  }
}

export type MemoryGrantWarningType = 'Excessive Grant' | 'Used More Than Granted' | 'Grant Increase';

export class Merge extends RelOpAction {
  public ManyToMany?: boolean;
  public InnerSideJoinColumns?: ColumnReference[];
  public OuterSideJoinColumns?: ColumnReference[];
  public PassThru?: ScalarExpression;
  public Residual?: ScalarExpression;
  public StarJoinInfo?: StarJoinInfo;
}

export class MissingIndexes {
  public MissingIndexGroup: MissingIndexGroup[];

  constructor(missingIndexGroup: MissingIndexGroup[]) {
    this.MissingIndexGroup = missingIndexGroup;
  }
}

export class MissingIndexGroup {
  public Impact: number;
  public MissingIndex: MissingIndex[];

  constructor(impact: number, missingIndex: MissingIndex[]) {
    this.Impact = impact;
    this.MissingIndex = missingIndex;
  }
}

export class MissingIndex {
  public Database: string;
  public Schema: string;
  public Table: string;
  public ColumnGroup: ColumnGroup[];

  constructor(database: string, schema: string, table: string, columnGroup: ColumnGroup[]) {
    this.Database = database;
    this.Schema = schema;
    this.Table = table;
    this.ColumnGroup = columnGroup;
  }

  public toCreateIndexString(): string {
    const equalityColumnNames = this.ColumnGroup.filter((i) => i.Usage === 'EQUALITY' || i.Usage === 'INEQUALITY' )[0].Column.map((col) => col.Name);

    const includeColumns = this.ColumnGroup.filter((i) => i.Usage === 'INCLUDE')[0];
    let includeColumnNames: string[] | undefined;
    if (includeColumns !== undefined) {
      includeColumnNames = includeColumns.Column.map((col) => col.Name);
    }

    const indexName = `IX_${this.Table}_${equalityColumnNames.join('_')}`;
    let sql = `CREATE NONCLUSTERED INDEX ${indexName} ON ${this.Schema}.${this.Table} (${equalityColumnNames.join(', ')})`;

    if (includeColumnNames !== undefined) {
      sql += ` INCLUDE (${includeColumnNames.join(', ')})`;
    }

    return sql;
  }
}

export class MultiAssign implements ScalarOp {
  public Assigns?: Assign[];

  constructor(assigns?: Assign[]) {
    this.Assigns = assigns;
  }
}

export class NestedLoops extends RelOpAction {
  public Optimized: boolean;
  public WithOrderedPrefetch?: boolean;
  public WithUnorderedPrefetch?: boolean;
  public OuterReferences?: ColumnReference[];
  public PartitionId?: ColumnReference;
  public PassThru?: ScalarExpression;
  public Predicate?: ScalarExpression;
  public ProbeColumn?: ColumnReference;

  public StarJoinInfo?: StarJoinInfo;

  constructor(optimized: boolean) {
    super();
    this.Optimized = optimized;
  }
}

export class ObjectType {
  public Alias?: string;
  public CloneAccessScope?: CloneAccessScope;
  public Database?: string;
  public Filtered?: boolean;
  public Index?: string;
  public IndexKind?: IndexKindType;
  public Schema?: string;
  public Server?: string;
  public Storage?: StorageType;
  public Table?: string;
  public TableReferenceId?: number;
}
/** Provide hardware-dependent properties that affect cost estimate (and hence, query plan choice), as seen by the Query Optimizer.
 * EstimatedAvailableMemoryGrant is an estimate of what amount of memory (KB) will be available for this query at the execution time to request a memory grant from.
 * EstimatedPagesCached is an estimate of how many pages of data will remain cached in the buffer pool if the query needs to read it again.
 * EstimatedAvailableDegreeOfParallelism is an estimate of number of CPUs that can be used to execute the query should the Query Optimizer pick a parallel plan.
 * MaxCompileMemory is the maximum memory in KB allowed for query optimizer to use during compilation.
 */
export class OptimizerHardwareDependentProperties {
  public EstimatedAvailableDegreeOfParallelism?: number;
  public EstimatedAvailableMemoryGrant: number;
  public EstimatedPagesCached: number;
  public MaxCompileMemory?: number;

  constructor(EstimatedAvailableMemoryGrant: number, EstimatedPagesCached: number) {
    this.EstimatedAvailableMemoryGrant = EstimatedAvailableMemoryGrant;
    this.EstimatedPagesCached = EstimatedPagesCached;
  }
}
/** List of statistics info used during query optimization */
export class OptimizerStatsUsage {
  public StatisticsInfo: StatsInfo[];

  constructor(statisticsInfo: StatsInfo[]) {
    this.StatisticsInfo = statisticsInfo;
  }
}

export class OrderBy {
  public OrderByColumn: OrderByTypeOrderByColumn[];

  constructor(orderByColumn: OrderByTypeOrderByColumn[]) {
    this.OrderByColumn = orderByColumn;
  }
}

export class OrderByTypeOrderByColumn {
  public Ascending: boolean;
  public ColumnReference: ColumnReference;

  constructor(ascending: boolean, columnReference: ColumnReference) {
    this.Ascending = ascending;
    this.ColumnReference = columnReference;
  }

  public toString(): string {
    if (this.Ascending) {
      return this.ColumnReference.toString() + ' ASC';
    }

    return this.ColumnReference.toString() + 'DESC';
  }
}

export type OrderType = 'BACKWARD' | 'FORWARD';

export class Parallelism extends RelOpAction {
  public InRow?: boolean;
  public LocalParallelism?: boolean;
  public PartitioningType?: PartitionType;
  public Remoting?: boolean;
  public Activation?: ParallelismTypeActivation;
  public BrickRouting?: ParallelismTypeBrickRouting;
  public HashKeys?: ColumnReference[];
  public OrderBy?: OrderBy;
  public PartitionColumns?: ColumnReference[];
  public Predicate?: ScalarExpression;
  public ProbeColumn?: ColumnReference;
}

interface ParallelismTypeActivation {
  Type: ParallelismTypeActivationType;
  Object?: ObjectType;
}

type ParallelismTypeActivationType = 'CloneLocation' | 'Resource' | 'SingleBrick' | 'Region';

interface ParallelismTypeBrickRouting {
  FragmentIdColumn?: ColumnReference;
  Object?: ObjectType;
}

interface Parameterization {
  Object: ObjectType[];
}

export type PartitionType =
  | 'Broadcast'
  | 'Demand'
  | 'Hash'
  | 'NoPartitioning'
  | 'Range'
  | 'RoundRobin'
  | 'CloneLocation';

/** Each of the physical operator is an iterator. An iterator
 * can answer three method calls: Init(), GetNext(), and Close().
 * Upon receiving an Init() call, an iterator initializes itself,
 * setting up any data structures if necessary. Upon receiving a
 * GetNext() call, the iterator produces the "next" packet of
 * data and gives it to the iterator that made the GetNext() call.
 * To produce the "next" packet of data, the iterator may have to
 * make zero or more GetNext() (or even Init()) calls to its
 * children. Upon receiving a Close() call, an iterator performs
 * some clean-up operations and shuts itself down. Typically, an
 * iterator receives one Init() call, followed by many GetNext()
 * calls, and then a single Close() call.
 *
 * The "query" portion of a T-SQL statement is typically a tree
 * made up of iterators.
 *
 * Usually, there is a one-to-many mapping among logical operators
 * and physical operators. That is, usually multiple physical operators
 * can implement a logical operator. In some cases in SQL Server,
 * however, a physical operator can implement multiple logical operators.
 */
export type PhysicalOp =
  | 'Adaptive Join'
  | 'Assert'
  | 'Batch Hash Table Build'
  | 'Bitmap'
  | 'Clustered Index Delete'
  | 'Clustered Index Insert'
  | 'Clustered Index Scan'
  | 'Clustered Index Seek'
  | 'Clustered Index Update'
  | 'Clustered Index Merge'
  | 'Clustered Update'
  | 'Collapse'
  | 'Columnstore Index Delete'
  | 'Columnstore Index Insert'
  | 'Columnstore Index Merge'
  | 'Columnstore Index Scan'
  | 'Columnstore Index Update'
  | 'Compute Scalar'
  | 'Concatenation'
  | 'Constant Scan'
  | 'Deleted Scan'
  | 'Filter'
  | 'Foreign Key References Check'
  | 'Generic'
  | 'Hash Match'
  | 'Index Delete'
  | 'Index Insert'
  | 'Index Scan'
  | 'Index Seek'
  | 'Index Spool'
  | 'Index Update'
  | 'Inserted Scan'
  | 'Log Row Scan'
  | 'Merge Interval'
  | 'Merge Join'
  | 'Nested Loops'
  | 'Online Index Insert'
  | 'Parallelism'
  | 'Parameter Table Scan'
  | 'Print'
  | 'Put'
  | 'Rank'
  | 'Remote Delete'
  | 'Remote Index Scan'
  | 'Remote Index Seek'
  | 'Remote Insert'
  | 'Remote Query'
  | 'Remote Scan'
  | 'Remote Update'
  | 'RID Lookup'
  | 'Row Count Spool'
  | 'Segment'
  | 'Sequence'
  | 'Sequence Project'
  | 'Sort'
  | 'Split'
  | 'Stream Aggregate'
  | 'Switch'
  | 'Table Delete'
  | 'Table Insert'
  | 'Table Merge'
  | 'Table Scan'
  | 'Table Spool'
  | 'Table Update'
  | 'Table-valued function'
  | 'Top'
  | 'UDX'
  | 'Window Aggregate'
  | 'Window Spool'
  | 'Key Lookup'
  | 'Root'
  ;

/** Shows time statistics for single query execution.
 * CpuTime: CPU time in milliseconds
 * ElapsedTime: elapsed time in milliseconds
 */
export class QueryExecTime {
  public CpuTime: number;
  public ElapsedTime: number;

  constructor(cpuTime: number, elapsedTime: number) {
    this.CpuTime = cpuTime;
    this.ElapsedTime = elapsedTime;
  }
}

/** New Runtime information:
 * DegreeOfParallelism
 * EffectiveDegreeOfParallelism: Max parallelism used by columnstore index build
 * MemoryGrant (in kilobytes)
 *
 * New compile time information:
 * mem fractions
 * CachedPlanSize (in kilobytes)
 * CompileTime (in milliseconds)
 * CompileCPU (in milliseconds)
 * CompileMemory (in kilobytes)
 * Parameter values used during query compilation
 * NonParallelPlanReason
 */
export class QueryPlan {
  public CachedPlanSize?: number;
  public CompileCPU?: number;
  public CompileMemory?: number;
  public CompileTime?: number;
  public ContainsInterleavedExecutionCandidates?: boolean;
  public DegreeOfParallelism?: number;
  public EffectiveDegreeOfParallelism?: number;
  public MemoryGrant?: number;
  public NonParallelPlanReason?: string;
  public UsePlan?: boolean;
  public GuessedSelectivity?: GuessedSelectivity;
  public MemoryGrantInfo?: MemoryGrant;
  public MissingIndexes?: MissingIndexes;
  public OptimizerHardwareDependentProperties?: OptimizerHardwareDependentProperties;
  public OptimizerStatsUsage?: OptimizerStatsUsage;
  public ParameterList?: ColumnReference[];
  public QueryTimeStats?: QueryExecTime;
  public RelOp: RelOp;
  public ThreadStat?: ThreadStat;
  public TraceFlags?: TraceFlagList[];
  public UnmatchedIndexes?: UnmatchedIndexes;
  public WaitStats?: WaitStatList;
  public Warnings?: Warnings;

  constructor(RelOperation: RelOp) {
    this.RelOp = RelOperation;
  }
}

export class ReceivePlan {
  public Operation: ReceivePlanTypeOperation[];

  constructor(operation: ReceivePlanTypeOperation[]) {
    this.Operation = operation;
  }
}

export class ReceivePlanTypeOperation {
  public OperationType: ReceivePlanTypeOperationTypeOperationType;
  public QueryPlan: QueryPlan;

  constructor(pperationType: ReceivePlanTypeOperationTypeOperationType, queryPlan: QueryPlan) {
    this.OperationType = pperationType;
    this.QueryPlan = queryPlan;
  }
}

export type ReceivePlanTypeOperationTypeOperationType = 'ReceivePlanSelect' | 'ReceivePlanUpdate';

export class Remote extends RelOpAction {
  public RemoteDestination?: string;
  public RemoteObject?: string;
  public RemoteSource?: string;
}

export class RemoteFetch extends Remote {}

export class RemoteModify extends Remote {
  public SetPredicate?: ScalarExpression;
}

export class RemoteQuery extends Remote {
  public RemoteQuery?: string;
}

export class RemoteRange extends Remote {
  public SeekPredicates?: SeekPredicates;
}

export class Put extends RemoteQuery {
  public ShuffleColumn?: string;
  public ShuffleType?: string;
}

/** Additional information about a rollup. The highest level is the number of group by columns. */
export class RollupInfo {
  public HighestLevel: number;
  public RollupLevel: RollupLevel[];

  constructor(highestLevel: number, rollupLevel: RollupLevel[]) {
    this.HighestLevel = highestLevel;
    this.RollupLevel = rollupLevel;
  }
}

/** A level that is output by the rollup.  Level 0 is the base aggregation, equivalent to the statement without 'WITH ROLLUP'.
 * The highest level is the grand total, or group by all.  Level 0 is always output, and at least one higher level.
 */
export class RollupLevel {
  public Level: number;

  constructor(level: number) {
    this.Level = level;
  }
}

/** Runtime information provided from statistics_xml for each relational iterator */
export class RunTimeInformation {
  public RunTimeCountersPerThread: RunTimeInformationTypeRunTimeCountersPerThread[];

  constructor(runTimeCountersPerThread: RunTimeInformationTypeRunTimeCountersPerThread[]) {
    this.RunTimeCountersPerThread = runTimeCountersPerThread;
  }

  public GetRunTimeCountersSummary(): RunTimeInformationTypeRunTimeCountersPerThread | undefined {
    if (this.RunTimeCountersPerThread.length === 0) {
      return undefined;
    }

    function undefinedAdd(a: number | undefined, b: number | undefined): number | undefined {
      if (a === undefined && b === undefined) {
        return undefined;
      }

      if (a === undefined && b !== undefined) {
        return b;
      }

      if (a !== undefined && b === undefined) {
        return a;
      }

      return a! + b!;
    }

    return this.RunTimeCountersPerThread.reduce((a, b) => {
      const i = new RunTimeInformationTypeRunTimeCountersPerThread(
        a.ActualEndOfScans + b.ActualEndOfScans,
        a.ActualRows + b.ActualRows,
        0,
        a.ActualExecutions + b.ActualExecutions);

      i.ActualCPUms = undefinedAdd(a.ActualCPUms, b.ActualCPUms);
      i.ActualElapsedms = undefinedAdd(a.ActualElapsedms, b.ActualElapsedms);
      i.ActualLobLogicalReads = undefinedAdd(a.ActualLobLogicalReads, b.ActualLobLogicalReads);
      i.ActualLobPhysicalReads = undefinedAdd(a.ActualLobPhysicalReads, b.ActualLobPhysicalReads);
      i.ActualLobReadAheads = undefinedAdd(a.ActualLobReadAheads, b.ActualLobReadAheads);
      i.ActualLocallyAggregatedRows = undefinedAdd(a.ActualLocallyAggregatedRows, b.ActualLocallyAggregatedRows);
      i.ActualLogicalReads = undefinedAdd(a.ActualLogicalReads, b.ActualLogicalReads);
      i.ActualPhysicalReads = undefinedAdd(a.ActualPhysicalReads, b.ActualPhysicalReads);
      i.ActualReadAheads = undefinedAdd(a.ActualReadAheads, b.ActualReadAheads);
      i.ActualRebinds = undefinedAdd(a.ActualRebinds, b.ActualRebinds);
      i.ActualRewinds = undefinedAdd(a.ActualRewinds, b.ActualRewinds);
      i.ActualRowsRead = undefinedAdd(a.ActualRowsRead, b.ActualRowsRead);
      i.ActualScans = undefinedAdd(a.ActualScans, b.ActualScans);

      return i;
    });
  }
}

export class RunTimeInformationTypeRunTimeCountersPerThread {
  public ActualCPUms?: number;
  public ActualElapsedms?: number;
  public ActualEndOfScans: number;
  public ActualExecutionMode?: ExecutionModeType;
  public ActualExecutions: number;
  public ActualJoinType?: PhysicalOp;
  public ActualLobLogicalReads?: number;
  public ActualLobPhysicalReads?: number;
  public ActualLobReadAheads?: number;
  public ActualLocallyAggregatedRows?: number;
  public ActualLogicalReads?: number;
  public ActualPhysicalReads?: number;
  public ActualReadAheads?: number;
  public ActualRebinds?: number;
  public ActualRewinds?: number;
  public ActualRows: number;
  public ActualRowsRead?: number;
  public ActualScans?: number;
  public Batches?: number;
  public BrickId?: number;
  public CloseTime?: number;
  public FirstActiveTime?: number;
  public FirstRowTime?: number;
  public InputMemoryGrant?: number;
  public IsInterleavedExecuted?: boolean;
  public LastActiveTime?: number;
  public LastRowTime?: number;
  public OpenTime?: number;
  public OutputMemoryGrant?: number;
  public SchedulerId?: number;
  public SegmentReads?: number;
  public SegmentSkips?: number;
  public TaskAddr?: number;
  public Thread: number;
  public UsedMemoryGrant?: number;

  constructor(actualEndOfScans: number, actualRows: number, thread: number, actualExecutions: number) {
    this.ActualEndOfScans = actualEndOfScans;
    this.ActualRows = actualRows;
    this.Thread = thread;
    this.ActualExecutions = actualExecutions;
  }
}

/** Runtime partition information provided in statistics xml for each relational iterator that support partitioning */
interface RunTimePartitionSummary {
  PartitionsAccessed: RunTimePartitionSummaryTypePartitionsAccessed;
}

export class RunTimePartitionSummaryTypePartitionsAccessed {
  public PartitionCount: number;
  public PartitionRange?: RunTimePartitionSummaryTypePartitionsAccessedTypePartitionRange[];

  constructor(PartitionCount: number) {
    this.PartitionCount = PartitionCount;
  }
}

export class RunTimePartitionSummaryTypePartitionsAccessedTypePartitionRange {
  public End: number;
  public Start: number;

  constructor(End: number, Start: number) {
    this.End = End;
    this.Start = Start;
  }
}

export class ScalarExpressionList implements ScalarOp {
  public ScalarOperator: Scalar[];

  constructor(scalarOperator: Scalar[]) {
    this.ScalarOperator = scalarOperator;
  }
}

export class ScalarExpression {
  public ScalarOperator: Scalar;

  constructor(ScalarOperator: Scalar) {
    this.ScalarOperator = ScalarOperator;
  }
}

export class ScalarInsert extends Rowset {
  public DMLRequestSort?: boolean;
  public SetPredicate?: ScalarExpression;
}

export class ScalarSequence implements ScalarOp {
  public FunctionName: string;

  constructor(functionName: string) {
    this.FunctionName = functionName;
  }
}

// tslint:disable-next-line:no-empty-interface
export interface ScalarOp {}

/** should not be used */
export class NotImplementedScalarOp implements ScalarOp {

}

/** Scalar expression. If root of scalar tree contains semantically equivalent string representation of entire expression */
export class Scalar {
  public ScalarString?: string;
  public Operation: ScalarOp;

  constructor(Operation: ScalarOp) {
    this.Operation = Operation;
  }
}

export class ScanRange {
  public ScanType: CompareOp;
  public RangeColumns: ColumnReference[];
  public RangeExpressions: ScalarExpression[];

  constructor(scanType: CompareOp, rangeColumns: ColumnReference[], rangeExpressions: ScalarExpression[]) {
    this.ScanType = scanType;
    this.RangeColumns = rangeColumns;
    this.RangeExpressions = rangeExpressions;
  }

  public ScanTypeToString(): string {
    switch (this.ScanType) {
      case 'EQ': return '=';
      case 'GE': return '>=';
      case 'GT': return '>';
      case 'LE': return '<=';
      case 'LT': return '<';
      case 'NE': return '!=';
      default: return this.ScanType;
    }
  }
}

export class SeekPredicateNew {
  public SeekKeys: SeekPredicate[];

  constructor(seekKeys: SeekPredicate[]) {
    this.SeekKeys = seekKeys;
  }
}

export class SeekPredicatePart {
  public SeekPredicateNew: SeekPredicateNew[];

  constructor(seekPredicateNew: SeekPredicateNew[]) {
    this.SeekPredicateNew = seekPredicateNew;
  }
}

export class SeekPredicates {
  public SeekPredicate?: SeekPredicate[];
  public SeekPredicateNew?: SeekPredicateNew[];
  public SeekPredicatePart?: SeekPredicatePart[];
}

export class SeekPredicate {
  public EndRange?: ScanRange;
  public IsNotNull?: ColumnReference;
  public Prefix?: ScanRange;
  public StartRange?: ScanRange;

  public toStrings(): Array<{key: string, value: string}> {
    const result: Array<{key: string, value: string}> = [];
    if (this.Prefix !== undefined) {
      if (this.Prefix.RangeColumns.length === 1 && this.Prefix.RangeExpressions.length === 1) {
        result.push({ key: 'Prefix', value: this.Prefix.RangeColumns[0].toString() + ' ' + this.Prefix.ScanTypeToString() + ' ' + this.Prefix.RangeExpressions[0].ScalarOperator.ScalarString });
      }
    }

    if (this.StartRange !== undefined) {
      if (this.StartRange.RangeColumns.length === 1 && this.StartRange.RangeExpressions.length === 1) {
        result.push({ key: 'Start', value: this.StartRange.RangeColumns[0].toString() + ' ' + this.StartRange.ScanTypeToString() + ' ' + this.StartRange.RangeExpressions[0].ScalarOperator.ScalarString });
      }
    }

    if (this.EndRange !== undefined) {
      if (this.EndRange.RangeColumns.length === 1 && this.EndRange.RangeExpressions.length === 1) {
        result.push({ key: 'End', value: this.EndRange.RangeColumns[0].toString() + ' ' + this.EndRange.ScanTypeToString() + ' ' + this.EndRange.RangeExpressions[0].ScalarOperator.ScalarString });
      }
    }

    if (this.IsNotNull !== undefined) {
      result.push({ key: 'Is Not Null', value: this.IsNotNull!.toString() });
    }

    return result;
  }
}

export class Segment extends RelOpAction {
  public GroupBy: ColumnReference[];
  public SegmentColumn: ColumnReference;

  constructor(groupBy: ColumnReference[], segmentColumn: ColumnReference) {
    super();
    this.GroupBy = groupBy;
    this.SegmentColumn = segmentColumn;
  }

}

export class Sequence extends RelOpAction {}

/** The set options that affects query cost */
export class SetOptions {
  public ANSI_NULLS?: boolean;
  public ANSI_PADDING?: boolean;
  public ANSI_WARNINGS?: boolean;
  public ARITHABORT?: boolean;
  public CONCAT_NULL_YIELDS_NULL?: boolean;
  public NUMERIC_ROUNDABORT?: boolean;
  public QUOTED_IDENTIFIER?: boolean;

  constructor(
    ANSI_NULLS?: boolean,
    ANSI_PADDING?: boolean,
    ANSI_WARNINGS?: boolean,
    ARITHABORT?: boolean,
    CONCAT_NULL_YIELDS_NULL?: boolean,
    NUMERIC_ROUNDABORT?: boolean,
    QUOTED_IDENTIFIER?: boolean,
  ) {
    this.ANSI_NULLS = ANSI_NULLS;
    this.ANSI_PADDING = ANSI_PADDING;
    this.ANSI_WARNINGS = ANSI_WARNINGS;
    this.ARITHABORT = ARITHABORT;
    this.CONCAT_NULL_YIELDS_NULL = CONCAT_NULL_YIELDS_NULL;
    this.NUMERIC_ROUNDABORT = NUMERIC_ROUNDABORT;
    this.QUOTED_IDENTIFIER = QUOTED_IDENTIFIER;
  }
}

export class SetPredicateElement extends ScalarExpression {
  public SetPredicateType?: SetPredicateType;
}

export type SetPredicateType = 'Update' | 'Insert';

export class ShowPlanXMLTypeBatchSequenceTypeBatch {
  public Statements: BaseStmtInfo[];

  constructor(Statements: BaseStmtInfo[]) {
    this.Statements = Statements;

    for (const statement of this.Statements) {
      statement.Batch = this;
    }
  }

  public TotalCost(): number {
    let sum = 0;
    for (const child of this.Statements) {
      if (child.StatementSubTreeCost !== undefined) {
        sum += child.StatementSubTreeCost!;
      }
    }

    return sum;
  }
}

export class SimpleIteratorOneChild extends RelOpAction {}

export class SimpleUpdate extends Rowset {
  public DMLRequestSort?: boolean;
  public SeekPredicate?: SeekPredicate;
  public SeekPredicateNew?: SeekPredicateNew;
  public SetPredicate?: ScalarExpression;
}

/** Sort spill details */
export class SortSpillDetails {
  public GrantedMemoryKb?: number;
  public ReadsFromTempDb?: number;
  public UsedMemoryKb?: number;
  public WritesToTempDb?: number;
}

export class Sort extends RelOpAction {
  public Distinct: boolean;
  public OrderBy: OrderBy;
  public PartitionId?: ColumnReference;

  constructor(distinct: boolean, orderBy: OrderBy) {
    super();
    this.Distinct = distinct;
    this.OrderBy = orderBy;
  }
}

/** Spill warning information */
export class SpillToTempDb {
  public SpilledThreadCount?: number;
  public SpillLevel?: number;
}

export class Split extends RelOpAction {
  public ActionColumn?: ColumnReference;
}

export class Spool extends RelOpAction {
  public PrimaryNodeId?: number;
  public Stack?: boolean;
  public SeekPredicate?: SeekPredicate;
  public SeekPredicateNew?: SeekPredicateNew;
}

/** Additional information about Star Join structure. */
export class StarJoinInfo {
  public OperationType: StarJoinInfoTypeOperationType;
  public Root?: boolean;

  constructor(operationType: StarJoinInfoTypeOperationType) {
    this.OperationType = operationType;
  }
}

export type StarJoinInfoTypeOperationType =
  | 'Fetch'
  | 'Index Intersection'
  | 'Index Filter'
  | 'Index Lookup';

/** Information on single statistics used during query optimization.
 * Database : name of the database
 * Schema : name of the schema
 * Table : name of the table
 * Statistics : name of the statistics
 * ModificationCount : number of modifications since the last update
 * SamplingPercent : statistics sampling percentage
 * LastUpdate : date when the statistics was updated
 */
export class StatsInfo {
  public Database?: string;
  public LastUpdate?: Date;
  public ModificationCount: number;
  public SamplingPercent: number;
  public Schema?: string;
  public Statistics: string;
  public Table?: string;

  constructor(modificationCount: number, samplingPercent: number, statistics: string) {
    this.ModificationCount = modificationCount;
    this.SamplingPercent = samplingPercent;
    this.Statistics = statistics;
  }
}

/** Complex statement type that is constructed by a condition, a then clause and an optional else clause. */
export class StmtCond extends BaseStmtInfo {
  public Condition: StmtCondTypeCondition;
  public Else?: StmtCondTypeElse;
  public Then: StmtCondTypeThen;

  constructor(condition: StmtCondTypeCondition, then: StmtCondTypeThen) {
    super();
    this.Condition = condition;
    this.Then = then;
  }
}

export class StmtCondTypeCondition {
  public QueryPlan?: QueryPlan;
  public UDF?: FunctionPlan[];
}

export class StmtCondTypeElse {
  public Statements: BaseStmtInfo;

  constructor(statements: BaseStmtInfo) {
    this.Statements = statements;
  }
}
export class StmtCondTypeThen {
  public Statements: BaseStmtInfo;

  constructor(statements: BaseStmtInfo) {
    this.Statements = statements;
  }
}

/** The cursor type that might have one or more cursor operations, used in DECLARE CURSOR, OPEN CURSOR and FETCH CURSOR */
export class StmtCursor extends BaseStmtInfo {
  public CursorPlan: CursorPlan;

  constructor(cursorPlan: CursorPlan) {
    super();
    this.CursorPlan = cursorPlan;
  }
}

/** The cursor type that might have one or more cursor operations, used in DECLARE CURSOR, OPEN CURSOR and FETCH CURSOR */
export class StmtReceive extends BaseStmtInfo {
  public ReceivePlan: ReceivePlan;

  constructor(receivePlan: ReceivePlan) {
    super();
    this.ReceivePlan = receivePlan;
  }
}

/** The simple statement that may or may not contain query plan, UDF plan or Stored Procedure plan */
export class StmtSimple extends BaseStmtInfo {
  public QueryPlan?: QueryPlan;
  public StoredProc?: FunctionPlan;
  public UDF?: FunctionPlan[];
}

/** Use database statement */
export class StmtUseDb extends BaseStmtInfo {
  public Database: string;

  constructor(Database: string) {
    super();
    this.Database = Database;
  }
}

export type StorageType = 'RowStore' | 'ColumnStore' | 'MemoryOptimized';

export class StreamAggregate extends RelOpAction {
  public GroupBy?: ColumnReference[];
  public RollupInfo?: RollupInfo;
}

export type SubqueryOperationType =
  | 'EQ ALL'
  | 'EQ ANY'
  | 'EXISTS'
  | 'GE ALL'
  | 'GE ANY'
  | 'GT ALL'
  | 'GT ANY'
  | 'IN'
  | 'LE ALL'
  | 'LE ANY'
  | 'LT ALL'
  | 'LT ANY'
  | 'NE ALL'
  | 'NE ANY';

export class Subquery implements ScalarOp {
  public Operation: SubqueryOperationType;
  public ScalarOperator?: Scalar;
  public RelOp: RelOp;

  constructor(operation: SubqueryOperationType, relop: RelOp) {
    this.Operation = operation;
    this.RelOp = relop;
  }
}

export class Switch extends Concat {
  public Predicate?: ScalarExpression;
}

export class TableScan extends Rowset {
  public ForcedIndex?: boolean;
  public ForceScan?: boolean;
  public NoExpandHint?: boolean;
  public Ordered: boolean;
  public Storage?: StorageType;
  public IndexedViewInfo?: ObjectType[];
  public PartitionId?: ColumnReference;
  public Predicate?: ScalarExpression;

  constructor(object: ObjectType[], ordered: boolean) {
    super(object);
    this.Ordered = ordered;
  }
}

/** Typical user defined table valued function doesn't have a relational child element. If a relational child
 * is present then the operator is a special internal table valued function that hosts native code.
 */
export class TableValuedFunction extends RelOpAction {
  public Object?: ObjectType;
  public ParameterList?: ScalarExpressionList;
  public Predicate?: ScalarExpression;
}

/** Information on how parallel threads are reserved on NUMA node
 * NodeId: ID of NUMA node where this query is chosen to run
 * ReservedThreads: number of reserved parallel thread on this NUMA node
 */
export class ThreadReservation {
  public NodeId: number;
  public ReservedThreads: number;

  constructor(NodeId: number, ReservedThreads: number) {
    this.NodeId = NodeId;
    this.ReservedThreads = ReservedThreads;
  }
}

/** Information on parallel thread usage.
 * Branches: Attribute. total number of concurrent branches of query plan.
 * Query would need additional worker threads of at least (Branches)* (Degree of Parallelism)
 * UsedThreads: Attribute maximum number of used parallel threads.  This is available only for statistics XML
 * Then follows a list of one or more ThreadReservation elements.
 */
export class ThreadStat {
  public Branches: number;
  public UsedThreads?: number;
  public ThreadReservation?: ThreadReservation[];

  constructor(Branches: number) {
    this.Branches = Branches;
  }
}

export class TopSort extends Sort {
  public Rows: number;
  public WithTies?: boolean;

  constructor(rows: number, distinct: boolean, orderBy: OrderBy) {
    super(distinct, orderBy);
    this.Rows = rows;
  }
}

export class Top extends RelOpAction {
  public IsPercent?: boolean;
  public RowCount?: boolean;
  public Rows?: number;
  public WithTies?: boolean;
  public OffsetExpression?: ScalarExpression;
  public TieColumns?: ColumnReference[];
  public TopExpression?: ScalarExpression;
}

/** Collection of trace flags used in SQL engine. */
interface TraceFlagList {
  IsCompileTime: boolean;
  TraceFlag: TraceFlag[];
}

export type TraceFlagScopeType = 'Global' | 'Session';

/** Describe a trace flag used in SQL engine. */
interface TraceFlag {
  Scope: TraceFlagScopeType;
  Value: number;
}

export class UDAggregate implements ScalarOp {
  public Distinct: boolean;
  public ScalarOperator?: Scalar[];
  public UDAggObject?: ObjectType;

  constructor(distinct: boolean) {
    this.Distinct = distinct;
  }
}

export class UDF implements ScalarOp {
  public FunctionName: string;
  public IsClrFunction?: boolean;
  public CLRFunction?: CLRFunction;
  public ScalarOperator?: Scalar[];

  constructor(functionName: string) {
    this.FunctionName = functionName;
  }
}

export class UDTMethod implements ScalarOp {
  public CLRFunction?: CLRFunction;
  public ScalarOperator?: Scalar[];
}

export class UDX extends RelOpAction {
  public UDXName: string;
  public UsedUDXColumns?: ColumnReference[];

  constructor(udxName: string) {
    super();
    this.UDXName = udxName;
  }
}

interface UnmatchedIndexes {
  Parameterization: Parameterization;
}

export class Update extends Rowset {
  public DMLRequestSort?: boolean;
  public WithOrderedPrefetch?: boolean;
  public WithUnorderedPrefetch?: boolean;
  public ActionColumn?: ColumnReference;
  public OriginalActionColumn?: ColumnReference;
  public ProbeColumn?: ColumnReference;
  public SetPredicate?: SetPredicateElement[];
}

/** A list of query wait statistics. */
export class WaitStatList {
  public Wait?: WaitStat[];
}

/** Wait statistics during one query execution.
 * WaitType: Name of the wait
 * WaitTimeMs: Wait time in milliseconds
 * WaitCount: Number of waits
 */
export class WaitStat {
  public WaitCount: number;
  public WaitTimeMs: number;
  public WaitType: string;

  constructor(waitCount: number, waitTimeMs: number, waitType: string) {
    this.WaitCount = waitCount;
    this.WaitTimeMs = waitTimeMs;
    this.WaitType = waitType;
  }
}

/** Query wait information */
export class WaitWarning {
  public WaitTime?: number;
  public WaitType: WaitWarningTypeWaitType;

  constructor(waitType: WaitWarningTypeWaitType) {
    this.WaitType = waitType;
  }
}

export type WaitWarningTypeWaitType = 'Memory Grant';

/** List of all possible iterator or query specific warnings (e.g. hash spilling, no join predicate) */
export class Warnings {
  public FullUpdateForOnlineIndexBuild?: boolean;
  public NoJoinPredicate?: boolean;
  public SpatialGuess?: boolean;
  public UnmatchedIndexes?: boolean;
  public ColumnsWithNoStatistics?: ColumnReference[];
  public HashSpillDetails?: HashSpillDetails[];
  public MemoryGrantWarning?: MemoryGrantWarningInfo[];
  public PlanAffectingConvert?: AffectingConvertWarning[];
  public SortSpillDetails?: SortSpillDetails[];
  public SpillToTempDb?: SpillToTempDb[];
  public Wait?: WaitWarning[];
}
export class WindowAggregate extends RelOpAction {}

export class Window extends RelOpAction {}

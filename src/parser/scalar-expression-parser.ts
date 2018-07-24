import * as ShowPlan from './showplan';
import { Convert } from './convert';
import { TagAndParser } from './tag-and-parser';
import { QueryHelper } from './query-helper';
import { ColumnReferenceParser } from './column-reference-parser';
import { QueryPlanParser } from './query-plan-parser';
import { ObjectParser } from './object-parser';

export class ScalarExpressionParser {
  public static Parse(scalarExpressionElement: Element): ShowPlan.ScalarExpression {
    const scalarOperation = QueryHelper.GetImmediateChildNodesByTagName(scalarExpressionElement, 'ScalarOperator')[0];
    const operation = this.ParseScalarType(scalarOperation);

    return new ShowPlan.ScalarExpression(operation);
  }

  public static ParseScalarType(scalarElement: Element): ShowPlan.Scalar {
    const parsers: Array<TagAndParser<ShowPlan.ScalarOp>> = [
      new TagAndParser('Aggregate', (e) => this.ParseAggregate(e)),
      new TagAndParser('Arithmetic', (e) => this.ParseArithmetic(e)),
      new TagAndParser('Assign', (e) => this.ParseAssign(e)),
      new TagAndParser('Compare', (e) => this.ParseCompare(e)),
      new TagAndParser('Const', (e) => this.ParseConst(e)),
      new TagAndParser('Convert', (e) => this.ParseConvert(e)),
      new TagAndParser('Identifier', (e) => this.ParseIdentifier(e)),
      new TagAndParser('IF', (e) => this.ParseConditional(e)),
      new TagAndParser('Intrinsic', (e) => this.ParseIntrinsic(e)),
      new TagAndParser('Logical', (e) => this.ParseLogical(e)),
      new TagAndParser('MultipleAssign', (e) => this.ParseMultiAssign(e)),
      new TagAndParser('ScalarExpressionList', (e) => this.ParseScalarExpressionList(e)),
      new TagAndParser('Sequence', (e) => this.ParseSequence(e)),
      new TagAndParser('Subquery', (e) => this.ParseSubquery(e)),
      new TagAndParser('UDTMethod', (e) => this.ParseUDTMethod(e)),
      new TagAndParser('UserDefinedAggregate', (e) => this.ParseUserDefinedAggregate(e)),
      new TagAndParser('UserDefinedFunction', (e) => this.ParseUDF(e)),
    ];

    const element = QueryHelper.GetAllImmediateChildNodes(scalarElement).filter((i) => i.tagName !== 'InternalInfo')[0];
    const parser = parsers.filter((i) => i.TagName === element.tagName);
    let operationOp: ShowPlan.ScalarOp;
    if (parser.length === 1) {
      operationOp = parser[0].Action(element);
    } else {
      operationOp = ShowPlan.NotImplementedScalarOp;
    }

    const scalar = new ShowPlan.Scalar(operationOp);
    scalar.ScalarString = Convert.GetString(scalarElement, 'ScalarString');

    return scalar;
  }

  private static ParseAggregate(element: Element) {
    const aggType = Convert.GetString(element, 'AggType') as string;
    const distinct = Convert.GetBoolean(element, 'Distinct') as boolean;
    const aggregate = new ShowPlan.Aggregate(aggType, distinct);

    const operators = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    if (operators.length > 0) {
      aggregate.ScalarOperator = operators.map((value) => this.ParseScalarType(value));
    }

    return aggregate;
  }

  private static ParseArithmetic(element: Element) {
    const operation = element.getAttribute('Operation') as ShowPlan.ArithmeticOperation;
    const scalarOperators = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator')
      .map((value) => this.ParseScalarType(value));
    return new ShowPlan.Arithmetic(operation, scalarOperators);
  }

  private static ParseAssign(element: Element): ShowPlan.Assign {
    const columnReferenceElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'ColumnReference')[0];
    const scalarOperator = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator')[0];

    return new ShowPlan.Assign(ColumnReferenceParser.Parse(columnReferenceElement), ScalarExpressionParser.ParseScalarType(scalarOperator));
  }

  private static ParseCompare(element: Element): ShowPlan.CompareType {
    const compareOp = element.getAttribute('CompareOp') as ShowPlan.CompareOp;
    const scalarOps = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');

    return new ShowPlan.CompareType(compareOp, scalarOps.map((e) => this.ParseScalarType(e)));
  }

  private static ParseConst(element: Element): ShowPlan.Const {
    const constValue = Convert.GetString(element, 'ConstValue') as string;
    return new ShowPlan.Const(constValue);
  }

  private static ParseConvert(element: Element): ShowPlan.Convert {
    // let style = QueryHelper.GetImmediateChildNodesByTagName(element, 'Style')[0]
    // per the xsd this says there could be a style element here, but also a style attribute
    // I can't figure out how to trigger the element to show at all show let's just use the attribute
    // until I can find a working case to keep it.
    const scalarOperator = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    const dataType = Convert.GetString(element, 'DataType') as string;
    const length = Convert.GetInt(element, 'Length');
    const precision = Convert.GetInt(element, 'Precision');
    const scale = Convert.GetInt(element, 'Scale');
    const style = Convert.GetInt(element, 'Style') as number;
    const implicit = Convert.GetBoolean(element, 'Implicit') as boolean;

    const convert = new ShowPlan.Convert(dataType, implicit, style, this.ParseScalarType(scalarOperator[0]));
    convert.Length = length;
    convert.Precision = precision;
    convert.Scale = scale;

    return convert;
  }

  private static ParseIdentifier(element: Element): ShowPlan.Ident {
    const table = Convert.GetString(element, 'Table') as string;
    const ident = new ShowPlan.Ident(table);

    const columnReferenceElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'ColumnReference');
    if (columnReferenceElement.length === 1) {
      ident.ColumnReference = ColumnReferenceParser.Parse(columnReferenceElement[0]);
    }

    return ident;
  }

  private static ParseConditional(element: Element): ShowPlan.Conditional {
    const condition = this.Parse(QueryHelper.GetImmediateChildNodesByTagName(element, 'Condition')[0]);
    const then = this.Parse(QueryHelper.GetImmediateChildNodesByTagName(element, 'Then')[0]);
    const $else = this.Parse(QueryHelper.GetImmediateChildNodesByTagName(element, 'Else')[0]);

    return new ShowPlan.Conditional(condition, then, $else);
  }

  private static ParseIntrinsic(element: Element): ShowPlan.Intrinsic {
    const functionName = Convert.GetString(element, 'FunctionName') as string;
    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    const intrinsic = new ShowPlan.Intrinsic(functionName);

    if (scalarOperatorElements.length > 0) {
      intrinsic.ScalarOperator = scalarOperatorElements.map((e) => this.ParseScalarType(e));
    }

    return intrinsic;
  }

  private static ParseLogical(element: Element): ShowPlan.Logical {
    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    const operation = Convert.GetString(element, 'Operation') as ShowPlan.LogicalOperationType;

    return new ShowPlan.Logical(operation, scalarOperatorElements.map((i) => this.ParseScalarType(i)));
  }

  private static ParseMultiAssign(element: Element): ShowPlan.MultiAssign {
    const assignElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'Assign');
    const assigns = assignElements.map((i) => this.ParseAssign(i));

    return new ShowPlan.MultiAssign(assigns);
  }

  private static ParseScalarExpressionList(element: Element): ShowPlan.ScalarExpressionList {
    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    return new ShowPlan.ScalarExpressionList(scalarOperatorElements.map((i) => this.ParseScalarType(i)));
  }

  private static ParseSequence(element: Element): ShowPlan.ScalarSequence {
    const functionName = Convert.GetString(element, 'FunctionName') as string;

    return new ShowPlan.ScalarSequence(functionName);
  }

  private static ParseSubquery(element: Element): ShowPlan.Subquery {
    const relOp = QueryPlanParser.ParseRelOp(QueryHelper.GetImmediateChildNodesByTagName(element, 'RelOp')[0]);
    const operation = Convert.GetString(element, 'Operation') as ShowPlan.SubqueryOperationType;
    const subquery = new ShowPlan.Subquery(operation, relOp);

    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    if (scalarOperatorElements.length === 1) {
      subquery.ScalarOperator = this.ParseScalarType(scalarOperatorElements[0]);
    }

    return subquery;
  }

  private static ParseUDTMethod(element: Element): ShowPlan.UDTMethod {
    const udtMethod = new ShowPlan.UDTMethod();
    const clrFunctionElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'CLRFunction');
    if (clrFunctionElements.length === 1) {
      udtMethod.CLRFunction = this.ParseCLRFunction(clrFunctionElements[0]);
    }

    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    if (scalarOperatorElements.length > 0) {
      udtMethod.ScalarOperator = scalarOperatorElements.map((e) => this.ParseScalarType(e));
    }

    return udtMethod;
  }

  private static ParseUserDefinedAggregate(element: Element): ShowPlan.UDAggregate {
    const distinct = Convert.GetBoolean(element, 'Distinct') as boolean;
    const aggregate = new ShowPlan.UDAggregate(distinct);
    const aggObjectElement = QueryHelper.GetImmediateChildNodesByTagName(element, 'UDAggObject');
    if (aggObjectElement.length === 1) {
      aggregate.UDAggObject = ObjectParser.Parse(aggObjectElement[0]);
    }

    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    if (scalarOperatorElements.length > 0) {
      aggregate.ScalarOperator = scalarOperatorElements.map((e) => this.ParseScalarType(e));
    }

    return aggregate;
  }

  private static ParseUDF(element: Element): ShowPlan.UDF {
    const functionName = Convert.GetString(element, 'FunctionName') as string;

    const udf = new ShowPlan.UDF(functionName);
    udf.IsClrFunction = Convert.GetBoolean(element, 'IsClrFunction');

    const clrFunctionElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'CLRFunction');
    if (clrFunctionElements.length === 1) {
      udf.CLRFunction = this.ParseCLRFunction(clrFunctionElements[0]);
    }

    const scalarOperatorElements = QueryHelper.GetImmediateChildNodesByTagName(element, 'ScalarOperator');
    if (scalarOperatorElements.length > 0) {
      udf.ScalarOperator = scalarOperatorElements.map((e) => this.ParseScalarType(e));
    }

    return udf;
  }

  private static ParseCLRFunction(element: Element): ShowPlan.CLRFunction {
    const assembly = Convert.GetString(element, 'Assembly');
    const $class = Convert.GetString(element, 'Class') as string;
    const method = Convert.GetString(element, 'Method');

    const clrFunction = new ShowPlan.CLRFunction($class);
    clrFunction.Assembly = assembly;
    clrFunction.Method = method;

    return clrFunction;
  }
}

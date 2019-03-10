import { DOMParser } from 'xmldom';
import * as ShowPlan from './showplan';
import Convert from './convert';
import StatementParser from './statement-parser';

class ShowPlanParser {
    public static ForOnlyElementsInNodes<T>(
        nodes: HTMLCollectionOf<Element>,
        action: (node: Element) => T | undefined,
    ): T[] {
        const results: T[] = [];
        let resultsIndex = 0;

        for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
            const { childNodes } = nodes[nodeIndex];

            for (let childNodeIndex = 0; childNodeIndex < childNodes.length; childNodeIndex += 1) {
                const childNode = childNodes[childNodeIndex];
                if (childNode.nodeType === 1) {
                    const result = action(childNode as Element);
                    if (result !== undefined) {
                        results[resultsIndex] = result;
                        resultsIndex += 1;
                    }
                }
            }
        }

        return results;
    }

    public static BuildRoot(
        doc: Document,
        batches: ShowPlan.ShowPlanXMLTypeBatchSequenceTypeBatch[],
    ): ShowPlan.ShowPlanXML {
        const version = doc.documentElement.getAttribute('Version') as string;
        const build = doc.documentElement.getAttribute('Build') as string;
        return new ShowPlan.ShowPlanXML(build, false, version, batches);
    }

    public static GetBatchFromElement(batchElement: Element): ShowPlan.BaseStmtInfo[] {
        const statementElements = batchElement.getElementsByTagName('Statements');

        const results = ShowPlanParser.ForOnlyElementsInNodes(statementElements, (node) => {
            let statement: ShowPlan.BaseStmtInfo | undefined;
            switch (node.nodeName) {
                case 'StmtSimple':
                    statement = StatementParser.ParseStmtSimple(node);
                    break;
                case 'StmtUseDb':
                    statement = StatementParser.ParseUseDb(node);
                    break;
                default:
                    statement = new ShowPlan.BaseStmtInfo();
            }

            statement.BatchSqlHandle = Convert.GetStringOrUndefined(node, 'BatchSqlHandle');
            statement.CardinalityEstimationModelVersion = Convert.GetStringOrUndefined(
                node,
                'CardinalityEstimationModelVersion',
            );
            statement.DatabaseContextSettingsId = Convert.GetIntOrUndefined(node, 'DatabaseContextSettingsId');
            statement.ParameterizedPlanHandle = Convert.GetStringOrUndefined(node, 'ParameterizedPlanHandle');
            statement.ParameterizedText = Convert.GetStringOrUndefined(node, 'ParameterizedText');
            statement.ParentObjectId = Convert.GetIntOrUndefined(node, 'ParentObjectId');
            statement.PlanGuideDB = Convert.GetStringOrUndefined(node, 'PlanGuideDB');
            statement.PlanGuideName = Convert.GetStringOrUndefined(node, 'PlanGuideName');
            statement.QueryHash = Convert.GetStringOrUndefined(node, 'QueryHash');
            statement.QueryPlanHash = Convert.GetStringOrUndefined(node, 'QueryPlanHash');
            statement.RetrievedFromCache = Convert.GetStringOrUndefined(node, 'RetrievedFromCache');
            statement.SecurityPolicyApplied = Convert.GetBooleanOrUndefined(node, 'SecurityPolicyApplied');
            statement.StatementCompId = Convert.GetIntOrUndefined(node, 'StatementCompId');
            statement.StatementEstRows = Convert.GetIntOrUndefined(node, 'StatementEstRows');
            statement.StatementId = Convert.GetIntOrUndefined(node, 'StatementId');
            statement.StatementOptmEarlyAbortReason = Convert.GetStringOrUndefined(
                node,
                'StatementOptmEarlyAbortReason',
            ) as ShowPlan.BaseStmtInfoTypeStatementOptmEarlyAbortReason;
            statement.StatementOptmLevel = Convert.GetStringOrUndefined(node, 'StatementOptmLevel');
            statement.StatementParameterizationType = Convert.GetIntOrUndefined(
                node,
                'StatementParameterizationType',
            );
            statement.StatementSqlHandle = Convert.GetStringOrUndefined(node, 'StatementSqlHandle');
            statement.StatementSubTreeCost = Convert.GetFloatOrUndefined(node, 'StatementSubTreeCost');
            statement.StatementText = Convert.GetStringOrUndefined(node, 'StatementText');
            statement.StatementType = Convert.GetStringOrUndefined(node, 'StatementType');
            statement.TemplatePlanGuideDB = Convert.GetStringOrUndefined(node, 'TemplatePlanGuideDB');
            statement.TemplatePlanGuideName = Convert.GetStringOrUndefined(node, 'TemplatePlanGuideName');

            const setOptions = node.getElementsByTagName('StatementSetOptions');
            if (setOptions.length === 1) {
                statement.StatementSetOptions = new ShowPlan.SetOptions(
                    Convert.GetBooleanOrUndefined(setOptions[0], 'ANSI_NULLS'),
                    Convert.GetBooleanOrUndefined(setOptions[0], 'ANSI_PADDING'),
                    Convert.GetBooleanOrUndefined(setOptions[0], 'ANSI_WARNINGS'),
                    Convert.GetBooleanOrUndefined(setOptions[0], 'ARITHABORT'),
                    Convert.GetBooleanOrUndefined(setOptions[0], 'CONCAT_NULL_YIELDS_NULL'),
                    Convert.GetBooleanOrUndefined(setOptions[0], 'NUMERIC_ROUNDABORT'),
                    Convert.GetBooleanOrUndefined(setOptions[0], 'QUOTED_IDENTIFIER'),
                );
            }

            return statement;
        });

        return results;
    }

    public static Parse(s: string): ShowPlan.ShowPlanXML {
    // create a new parser that just ignores all the errors. we'll check after the fact
    // whether or not it parsed a SHOWPLAN
        const doc = new DOMParser(
            { errorHandler: { warning(w) { throw Error(w); } } },
        ).parseFromString(s, 'text/xml');
        if (doc.documentElement === null || doc.documentElement.namespaceURI !== 'http://schemas.microsoft.com/sqlserver/2004/07/showplan') {
            throw new Error('Invalid showplan');
        }
        const batchElements = doc.documentElement.getElementsByTagName('Batch');

        const statements: ShowPlan.BaseStmtInfo[] = [];
        for (let count = 0; count < batchElements.length; count += 1) {
            const batchElement = batchElements.item(count);
            if (batchElement !== null) {
                const batchStatements = this.GetBatchFromElement(batchElement);
                Array.prototype.push.apply(statements, batchStatements);
            }
        }

        const batch = new ShowPlan.ShowPlanXMLTypeBatchSequenceTypeBatch(statements);
        return ShowPlanParser.BuildRoot(doc, [batch]);
    }
}

export default ShowPlanParser;

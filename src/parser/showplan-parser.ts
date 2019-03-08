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
                if (childNode.nodeType !== 1) { continue; }

                const result = action(childNode as Element);
                if (result === undefined) { continue; }

                results[resultsIndex] = result;
                resultsIndex += 1;
            }
        }

        return results;
    }

    public static BuildRoot(
        doc: Document,
        batches: ShowPlan.ShowPlanXMLTypeBatchSequenceTypeBatch[],
    ): ShowPlan.ShowPlanXML {
        const version = doc.documentElement!.getAttribute('Version') as string;
        const build = doc.documentElement!.getAttribute('Build') as string;
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

            statement.BatchSqlHandle = Convert.GetString(node, 'BatchSqlHandle');
            statement.CardinalityEstimationModelVersion = Convert.GetString(
                node,
                'CardinalityEstimationModelVersion',
            );
            statement.DatabaseContextSettingsId = Convert.GetInt(node, 'DatabaseContextSettingsId');
            statement.ParameterizedPlanHandle = Convert.GetString(node, 'ParameterizedPlanHandle');
            statement.ParameterizedText = Convert.GetString(node, 'ParameterizedText');
            statement.ParentObjectId = Convert.GetInt(node, 'ParentObjectId');
            statement.PlanGuideDB = Convert.GetString(node, 'PlanGuideDB');
            statement.PlanGuideName = Convert.GetString(node, 'PlanGuideName');
            statement.QueryHash = Convert.GetString(node, 'QueryHash');
            statement.QueryPlanHash = Convert.GetString(node, 'QueryPlanHash');
            statement.RetrievedFromCache = Convert.GetString(node, 'RetrievedFromCache');
            statement.SecurityPolicyApplied = Convert.GetBoolean(node, 'SecurityPolicyApplied');
            statement.StatementCompId = Convert.GetInt(node, 'StatementCompId');
            statement.StatementEstRows = Convert.GetInt(node, 'StatementEstRows');
            statement.StatementId = Convert.GetInt(node, 'StatementId');
            statement.StatementOptmEarlyAbortReason = Convert.GetString(
                node,
                'StatementOptmEarlyAbortReason',
            ) as ShowPlan.BaseStmtInfoTypeStatementOptmEarlyAbortReason;
            statement.StatementOptmLevel = Convert.GetString(node, 'StatementOptmLevel');
            statement.StatementParameterizationType = Convert.GetInt(
                node,
                'StatementParameterizationType',
            );
            statement.StatementSqlHandle = Convert.GetString(node, 'StatementSqlHandle');
            statement.StatementSubTreeCost = Convert.GetFloat(node, 'StatementSubTreeCost');
            statement.StatementText = Convert.GetString(node, 'StatementText');
            statement.StatementType = Convert.GetString(node, 'StatementType');
            statement.TemplatePlanGuideDB = Convert.GetString(node, 'TemplatePlanGuideDB');
            statement.TemplatePlanGuideName = Convert.GetString(node, 'TemplatePlanGuideName');

            const setOptions = node.getElementsByTagName('StatementSetOptions');
            if (setOptions.length === 1) {
                statement.StatementSetOptions = new ShowPlan.SetOptions(
                    Convert.GetBoolean(setOptions[0], 'ANSI_NULLS'),
                    Convert.GetBoolean(setOptions[0], 'ANSI_PADDING'),
                    Convert.GetBoolean(setOptions[0], 'ANSI_WARNINGS'),
                    Convert.GetBoolean(setOptions[0], 'ARITHABORT'),
                    Convert.GetBoolean(setOptions[0], 'CONCAT_NULL_YIELDS_NULL'),
                    Convert.GetBoolean(setOptions[0], 'NUMERIC_ROUNDABORT'),
                    Convert.GetBoolean(setOptions[0], 'QUOTED_IDENTIFIER'),
                );
            }

            return statement;
        });

        return results;
    }

    public static Parse(s: string): ShowPlan.ShowPlanXML {
    // create a new parser that just ignores all the errors. we'll check after the fact
    // whether or not it parsed a SHOWPLAN
        const doc = new DOMParser().parseFromString(s, 'text/xml');
        if (doc.documentElement === null || doc.documentElement.namespaceURI !== 'http://schemas.microsoft.com/sqlserver/2004/07/showplan') {
            throw new Error('Invalid showplan');
        }
        const batchElements = doc.documentElement.getElementsByTagName('Batch');

        const statements: ShowPlan.BaseStmtInfo[] = [];
        for (let count = 0; count < batchElements.length; count++) {
            const batchElement = batchElements.item(count)!;
            const batchStatements = this.GetBatchFromElement(batchElement);
            Array.prototype.push.apply(statements, batchStatements);
        }

        const batch = new ShowPlan.ShowPlanXMLTypeBatchSequenceTypeBatch(statements);
        return ShowPlanParser.BuildRoot(doc, [batch]);
    }
}

export default ShowPlanParser;

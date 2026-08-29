import type { Rule } from 'eslint';
import type { AstNode, StyleDeclaration } from '../types';
import {
    getPropDeclarations,
    getStyledObjectDeclarations,
    getStyledTemplateDeclarations,
} from './astHelpers';

export interface Problem {
    messageId: string;
    data: Record<string, string>;
}

export interface StyleRuleConfig {
    description: string;
    url: string;
    schema: NonNullable<Rule.RuleMetaData['schema']>;
    messages: Record<string, string>;
    createChecker(
        options: Record<string, unknown>
    ): (declaration: StyleDeclaration) => Problem | null;
}

export function createStyleRule(config: StyleRuleConfig): Rule.RuleModule {
    return {
        meta: {
            type: 'suggestion',
            docs: { description: config.description, url: config.url },
            schema: config.schema,
            messages: config.messages,
        },
        create(context) {
            const check = config.createChecker(
                (context.options[0] ?? {}) as Record<string, unknown>
            );

            const { sourceCode } = context;

            const visit = (extract: (node: AstNode) => StyleDeclaration[]) => (node: unknown) => {
                for (const declaration of extract(node as AstNode)) {
                    const problem = check(declaration);
                    if (problem) {
                        context.report({
                            loc: declaration.loc,
                            messageId: problem.messageId,
                            data: problem.data,
                        });
                    }
                }
            };

            return {
                JSXAttribute: visit(getPropDeclarations),
                TaggedTemplateExpression: visit(node =>
                    getStyledTemplateDeclarations(node, sourceCode)
                ),
                CallExpression: visit(getStyledObjectDeclarations),
            } as Rule.RuleListener;
        },
    };
}

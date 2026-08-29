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

export function docsUrl(name: string): string {
    return `https://github.com/PavelLazarchuk/eslint-plugin-design-tokens/blob/main/docs/rules/${name}.md`;
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
            const reported = new Set<string>();

            const visit = (extract: (node: AstNode) => StyleDeclaration[]) => (node: unknown) => {
                for (const declaration of extract(node as AstNode)) {
                    const { start, end } = declaration.loc;
                    const key = `${declaration.property}:${start.line}:${start.column}:${end.line}:${end.column}`;
                    if (reported.has(key)) continue;

                    const problem = check(declaration);
                    if (problem) {
                        reported.add(key);
                        context.report({
                            loc: declaration.loc,
                            messageId: problem.messageId,
                            data: problem.data,
                        });
                    }
                }
            };

            return {
                JSXAttribute: visit(node => getPropDeclarations(node, sourceCode)),
                TaggedTemplateExpression: visit(node =>
                    getStyledTemplateDeclarations(node, sourceCode)
                ),
                CallExpression: visit(node => getStyledObjectDeclarations(node, sourceCode)),
            } as Rule.RuleListener;
        },
    };
}

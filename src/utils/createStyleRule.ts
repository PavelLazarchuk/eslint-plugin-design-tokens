import type { Rule } from 'eslint';
import type { JSONSchema4 } from 'json-schema';
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

export type RuleOptions = Record<string, unknown>;

export interface StyleRuleConfig {
    description: string;
    url: string;
    schemaProperties: Record<string, JSONSchema4>;
    defaultOptions: RuleOptions;
    messages: Record<string, string>;
    ownsAllowlistPatterns?: boolean;
    createChecker(
        options: RuleOptions,
        allowlistPatterns: RegExp[]
    ): (declaration: StyleDeclaration) => Problem | Problem[] | null;
}

const SHARED_SCHEMA_PROPERTIES: Record<string, JSONSchema4> = {
    allowlistPatterns: { type: 'array', items: { type: 'string' }, uniqueItems: true },
    ignorePropertyPattern: { type: 'string' },
};

const SHARED_DEFAULT_OPTIONS: RuleOptions = { allowlistPatterns: [] };

export function docsUrl(name: string): string {
    return `https://github.com/PavelLazarchuk/eslint-plugin-design-tokens/blob/main/docs/rules/${name}.md`;
}

export const stringArray: JSONSchema4 = {
    type: 'array',
    items: { type: 'string' },
    uniqueItems: true,
};

function compilePattern(option: string, source: string): RegExp {
    try {
        return new RegExp(source, 'u');
    } catch {
        throw new Error(`Invalid regular expression in "${option}": ${source}`);
    }
}

export function createStyleRule(config: StyleRuleConfig): Rule.RuleModule {
    const defaultOptions: RuleOptions = { ...SHARED_DEFAULT_OPTIONS, ...config.defaultOptions };

    return {
        meta: {
            type: 'suggestion',
            docs: { description: config.description, url: config.url, recommended: true },
            schema: [
                {
                    type: 'object',
                    properties: { ...config.schemaProperties, ...SHARED_SCHEMA_PROPERTIES },
                    additionalProperties: false,
                },
            ],
            // Honoured by ESLint 9+; merged in below as well, for hosts down to the peer range.
            defaultOptions: [defaultOptions],
            messages: config.messages,
        },
        create(context) {
            const options: RuleOptions = {
                ...defaultOptions,
                ...((context.options[0] ?? {}) as RuleOptions),
            };

            const allowlistPatterns = (options.allowlistPatterns as string[]).map(source =>
                compilePattern('allowlistPatterns', source)
            );
            const ignoreProperty =
                typeof options.ignorePropertyPattern === 'string'
                    ? compilePattern('ignorePropertyPattern', options.ignorePropertyPattern)
                    : null;

            const check = config.createChecker(options, allowlistPatterns);
            const skip = (declaration: StyleDeclaration): boolean => {
                if (ignoreProperty?.test(declaration.property)) return true;
                if (config.ownsAllowlistPatterns) return false;
                return allowlistPatterns.some(pattern => pattern.test(declaration.value));
            };

            const { sourceCode } = context;
            const reported = new Set<string>();

            const visit = (extract: (node: AstNode) => StyleDeclaration[]) => (node: unknown) => {
                for (const declaration of extract(node as AstNode)) {
                    const { start, end } = declaration.loc;
                    const key = `${declaration.property}:${start.line}:${start.column}:${end.line}:${end.column}`;
                    if (reported.has(key) || skip(declaration)) continue;

                    const result = check(declaration);
                    const problems = Array.isArray(result) ? result : result ? [result] : [];
                    if (problems.length === 0) continue;

                    reported.add(key);
                    for (const problem of problems) {
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

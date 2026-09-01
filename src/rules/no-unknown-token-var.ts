import { createStyleRule, docsUrl } from '../utils/createStyleRule';
import {
    DEFAULT_TOKEN_ALLOWLIST,
    DEFAULT_TOKEN_PREFIXES,
    collectVariables,
    isKnownVariable,
    normalizeVariable,
} from '../utils/tokenVarMatchers';

export default createStyleRule({
    description: 'Disallow CSS custom properties outside the design system',
    url: docsUrl('no-unknown-token-var'),
    schema: [
        {
            type: 'object',
            properties: {
                prefixes: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                allowlist: { type: 'array', items: { type: 'string' }, uniqueItems: true },
            },
            additionalProperties: false,
        },
    ],
    messages: {
        unknownTokenVar:
            'Unknown design token variable "{{variable}}" for "{{property}}" — use a variable from the design system.',
    },
    createChecker(options) {
        const prefixes = ((options.prefixes as string[] | undefined) ?? DEFAULT_TOKEN_PREFIXES).map(
            normalizeVariable
        );
        const allowlist = new Set(
            ((options.allowlist as string[] | undefined) ?? DEFAULT_TOKEN_ALLOWLIST).map(
                normalizeVariable
            )
        );

        if (prefixes.length === 0 && allowlist.size === 0) return () => null;

        return declaration => {
            const { property, value } = declaration;

            return collectVariables(value)
                .filter(variable => !isKnownVariable(variable, prefixes, allowlist))
                .map(variable => ({
                    messageId: 'unknownTokenVar',
                    data: { variable, property },
                }));
        };
    },
});

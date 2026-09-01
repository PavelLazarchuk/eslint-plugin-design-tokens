import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
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
    schemaProperties: { prefixes: stringArray, allowlist: stringArray },
    defaultOptions: { prefixes: DEFAULT_TOKEN_PREFIXES, allowlist: DEFAULT_TOKEN_ALLOWLIST },
    ownsAllowlistPatterns: true,
    messages: {
        unknownTokenVar:
            'Unknown design token variable "{{variable}}" for "{{property}}" — use a variable from the design system.',
    },
    createChecker(options, allowlistPatterns) {
        const prefixes = (options.prefixes as string[]).map(normalizeVariable);
        const allowlist = new Set((options.allowlist as string[]).map(normalizeVariable));

        if (prefixes.length === 0 && allowlist.size === 0 && allowlistPatterns.length === 0)
            return () => null;

        return declaration => {
            const { property, value } = declaration;

            return collectVariables(value)
                .filter(
                    variable =>
                        !isKnownVariable(variable, prefixes, allowlist) &&
                        !allowlistPatterns.some(pattern => pattern.test(variable))
                )
                .map(variable => ({
                    messageId: 'unknownTokenVar',
                    data: { variable, property },
                }));
        };
    },
});

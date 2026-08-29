import { createStyleRule } from '../utils/createStyleRule';
import { DEFAULT_SPACING_PROPERTIES, isSpacingValue } from '../utils/spacingMatchers';

const DOCS_URL =
    'https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#no-hardcoded-spacing';

export default createStyleRule({
    description: 'Disallow hardcoded spacing values in style objects and styled-components',
    url: DOCS_URL,
    schema: [
        {
            type: 'object',
            properties: {
                allowlist: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                properties: { type: 'array', items: { type: 'string' }, uniqueItems: true },
            },
            additionalProperties: false,
        },
    ],
    messages: {
        hardcodedSpacing:
            'Hardcoded spacing value "{{value}}" for "{{property}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            ((options.allowlist as string[] | undefined) ?? []).map(entry => entry.toLowerCase())
        );
        const properties = new Set(
            ((options.properties as string[] | undefined) ?? DEFAULT_SPACING_PROPERTIES).map(
                entry => entry.toLowerCase()
            )
        );

        return declaration => {
            const { property, value } = declaration;
            if (!properties.has(property)) return null;
            if (allowlist.has(value.toLowerCase()) || !isSpacingValue(value)) return null;
            return { messageId: 'hardcodedSpacing', data: { value, property } };
        };
    },
});

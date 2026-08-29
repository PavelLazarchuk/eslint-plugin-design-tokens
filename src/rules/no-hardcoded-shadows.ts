import { createStyleRule } from '../utils/createStyleRule';
import { DEFAULT_SHADOW_PROPERTIES, isShadowValue } from '../utils/shadowMatchers';

const DOCS_URL =
    'https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#no-hardcoded-shadows';

export default createStyleRule({
    description: 'Disallow hardcoded shadow values in style objects and styled-components',
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
        hardcodedShadow:
            'Hardcoded shadow value "{{value}}" for "{{property}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            ((options.allowlist as string[] | undefined) ?? []).map(entry => entry.toLowerCase())
        );
        const properties = new Set(
            ((options.properties as string[] | undefined) ?? DEFAULT_SHADOW_PROPERTIES).map(entry =>
                entry.toLowerCase()
            )
        );

        return declaration => {
            const { property, value } = declaration;
            if (!properties.has(property)) return null;
            if (allowlist.has(value.toLowerCase()) || !isShadowValue(value)) return null;
            return { messageId: 'hardcodedShadow', data: { value, property } };
        };
    },
});

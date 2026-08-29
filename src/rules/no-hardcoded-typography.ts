import { createStyleRule } from '../utils/createStyleRule';
import {
    DEFAULT_TYPOGRAPHY_PROPERTIES,
    FONT_FAMILY_PROPERTY,
    isFontFamilyValue,
    isTypographyValue,
} from '../utils/typographyMatchers';

const DOCS_URL =
    'https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#no-hardcoded-typography';

export default createStyleRule({
    description: 'Disallow hardcoded typography values in style objects and styled-components',
    url: DOCS_URL,
    schema: [
        {
            type: 'object',
            properties: {
                allowlist: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                properties: { type: 'array', items: { type: 'string' }, uniqueItems: true },
                checkFontFamily: { type: 'boolean' },
            },
            additionalProperties: false,
        },
    ],
    messages: {
        hardcodedTypography:
            'Hardcoded typography value "{{value}}" for "{{property}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            ((options.allowlist as string[] | undefined) ?? []).map(entry => entry.toLowerCase())
        );
        const properties = new Set(
            ((options.properties as string[] | undefined) ?? DEFAULT_TYPOGRAPHY_PROPERTIES).map(
                entry => entry.toLowerCase()
            )
        );
        const checkFontFamily = (options.checkFontFamily as boolean | undefined) ?? false;

        return declaration => {
            const { property, value } = declaration;
            if (!properties.has(property)) return null;
            if (allowlist.has(value.toLowerCase())) return null;

            const hardcoded =
                property === FONT_FAMILY_PROPERTY
                    ? checkFontFamily && isFontFamilyValue(value)
                    : isTypographyValue(property, value);

            if (!hardcoded) return null;
            return { messageId: 'hardcodedTypography', data: { value, property } };
        };
    },
});

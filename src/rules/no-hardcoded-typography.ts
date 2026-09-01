import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import {
    DEFAULT_TYPOGRAPHY_PROPERTIES,
    FONT_FAMILY_PROPERTY,
    isFontFamilyValue,
    isTypographyValue,
} from '../utils/typographyMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded typography values in style objects and styled-components',
    url: docsUrl('no-hardcoded-typography'),
    schemaProperties: {
        allowlist: stringArray,
        properties: stringArray,
        checkFontFamily: { type: 'boolean' },
    },
    defaultOptions: {
        allowlist: [],
        properties: DEFAULT_TYPOGRAPHY_PROPERTIES,
        checkFontFamily: false,
    },
    messages: {
        hardcodedTypography:
            'Hardcoded typography value "{{value}}" for "{{property}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            (options.allowlist as string[]).map(entry => entry.toLowerCase())
        );
        const properties = new Set(
            (options.properties as string[]).map(entry => entry.toLowerCase())
        );
        const checkFontFamily = options.checkFontFamily as boolean;

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

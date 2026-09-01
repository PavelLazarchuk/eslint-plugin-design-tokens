import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import { DEFAULT_SHADOW_PROPERTIES, isShadowValue } from '../utils/shadowMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded shadow values in style objects and styled-components',
    url: docsUrl('no-hardcoded-shadows'),
    schemaProperties: { allowlist: stringArray, properties: stringArray },
    defaultOptions: { allowlist: [], properties: DEFAULT_SHADOW_PROPERTIES },
    messages: {
        hardcodedShadow:
            'Hardcoded shadow value "{{value}}" for "{{property}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            (options.allowlist as string[]).map(entry => entry.toLowerCase())
        );
        const properties = new Set(
            (options.properties as string[]).map(entry => entry.toLowerCase())
        );

        return declaration => {
            const { property, value } = declaration;
            if (!properties.has(property)) return null;
            if (allowlist.has(value.toLowerCase()) || !isShadowValue(value)) return null;
            return { messageId: 'hardcodedShadow', data: { value, property } };
        };
    },
});

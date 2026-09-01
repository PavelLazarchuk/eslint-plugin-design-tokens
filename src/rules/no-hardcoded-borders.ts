import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import { DEFAULT_BORDER_PROPERTIES, isBorderValue } from '../utils/borderMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded border values in style objects and styled-components',
    url: docsUrl('no-hardcoded-borders'),
    schemaProperties: { allowlist: stringArray, properties: stringArray },
    defaultOptions: { allowlist: [], properties: DEFAULT_BORDER_PROPERTIES },
    messages: {
        hardcodedBorder:
            'Hardcoded border value "{{value}}" for "{{property}}" — use a theme token instead.',
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
            if (allowlist.has(value.toLowerCase()) || !isBorderValue(value)) return null;
            return { messageId: 'hardcodedBorder', data: { value, property } };
        };
    },
});

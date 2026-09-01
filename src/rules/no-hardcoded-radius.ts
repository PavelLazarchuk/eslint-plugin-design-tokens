import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import { DEFAULT_RADIUS_PROPERTIES, isRadiusValue } from '../utils/radiusMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded border-radius values in style objects and styled-components',
    url: docsUrl('no-hardcoded-radius'),
    schemaProperties: { allowlist: stringArray, properties: stringArray },
    defaultOptions: { allowlist: [], properties: DEFAULT_RADIUS_PROPERTIES },
    messages: {
        hardcodedRadius:
            'Hardcoded radius value "{{value}}" for "{{property}}" — use a theme token instead.',
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
            if (allowlist.has(value.toLowerCase()) || !isRadiusValue(value)) return null;
            return { messageId: 'hardcodedRadius', data: { value, property } };
        };
    },
});

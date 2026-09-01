import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import { DEFAULT_TRANSITION_PROPERTIES, isTransitionValue } from '../utils/transitionMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded transition values in style objects and styled-components',
    url: docsUrl('no-hardcoded-transitions'),
    schemaProperties: { allowlist: stringArray, properties: stringArray },
    defaultOptions: { allowlist: [], properties: DEFAULT_TRANSITION_PROPERTIES },
    messages: {
        hardcodedTransition:
            'Hardcoded transition value "{{value}}" for "{{property}}" — use a theme token instead.',
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
            if (allowlist.has(value.toLowerCase()) || !isTransitionValue(value)) return null;
            return { messageId: 'hardcodedTransition', data: { value, property } };
        };
    },
});

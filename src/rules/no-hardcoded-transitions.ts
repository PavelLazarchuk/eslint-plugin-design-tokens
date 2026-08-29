import { createStyleRule, docsUrl } from '../utils/createStyleRule';
import { DEFAULT_TRANSITION_PROPERTIES, isTransitionValue } from '../utils/transitionMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded transition values in style objects and styled-components',
    url: docsUrl('no-hardcoded-transitions'),
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
        hardcodedTransition:
            'Hardcoded transition value "{{value}}" for "{{property}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            ((options.allowlist as string[] | undefined) ?? []).map(entry => entry.toLowerCase())
        );
        const properties = new Set(
            ((options.properties as string[] | undefined) ?? DEFAULT_TRANSITION_PROPERTIES).map(
                entry => entry.toLowerCase()
            )
        );

        return declaration => {
            const { property, value } = declaration;
            if (!properties.has(property)) return null;
            if (allowlist.has(value.toLowerCase()) || !isTransitionValue(value)) return null;
            return { messageId: 'hardcodedTransition', data: { value, property } };
        };
    },
});

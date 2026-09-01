import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import { DEFAULT_COLOR_ALLOWLIST, isColorValue } from '../utils/colorMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded color values in style objects and styled-components',
    url: docsUrl('no-hardcoded-colors'),
    schemaProperties: { allowlist: stringArray },
    defaultOptions: { allowlist: DEFAULT_COLOR_ALLOWLIST },
    messages: {
        hardcodedColor: 'Hardcoded color value "{{value}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            (options.allowlist as string[]).map(entry => entry.toLowerCase())
        );

        return declaration => {
            const { value } = declaration;
            if (allowlist.has(value.toLowerCase()) || !isColorValue(value)) return null;
            return { messageId: 'hardcodedColor', data: { value } };
        };
    },
});

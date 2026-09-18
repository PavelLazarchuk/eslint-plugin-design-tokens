import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import { DEFAULT_COLOR_ALLOWLIST, findColor, isColorProperty } from '../utils/colorMatchers';

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
        const isAllowed = (token: string) => allowlist.has(token.trim().toLowerCase());

        return declaration => {
            const { value, property } = declaration;

            if (isAllowed(value)) return null;

            const found = findColor(value, isAllowed, isColorProperty(property));

            return found === null ? null : { messageId: 'hardcodedColor', data: { value: found } };
        };
    },
});

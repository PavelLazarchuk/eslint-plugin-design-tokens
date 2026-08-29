import { createStyleRule } from '../utils/createStyleRule';
import { DEFAULT_COLOR_ALLOWLIST, isColorValue } from '../utils/colorMatchers';

const DOCS_URL =
    'https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#no-hardcoded-colors';

export default createStyleRule({
    description: 'Disallow hardcoded color values in style objects and styled-components',
    url: DOCS_URL,
    schema: [
        {
            type: 'object',
            properties: {
                allowlist: { type: 'array', items: { type: 'string' }, uniqueItems: true },
            },
            additionalProperties: false,
        },
    ],
    messages: {
        hardcodedColor: 'Hardcoded color value "{{value}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            ((options.allowlist as string[] | undefined) ?? DEFAULT_COLOR_ALLOWLIST).map(entry =>
                entry.toLowerCase()
            )
        );

        return declaration => {
            const { value } = declaration;
            if (allowlist.has(value.toLowerCase()) || !isColorValue(value)) return null;
            return { messageId: 'hardcodedColor', data: { value } };
        };
    },
});

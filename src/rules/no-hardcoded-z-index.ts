import { createStyleRule, docsUrl, stringArray } from '../utils/createStyleRule';
import {
    DEFAULT_ZINDEX_ALLOWLIST,
    DEFAULT_ZINDEX_PROPERTIES,
    isZIndexValue,
} from '../utils/zIndexMatchers';

export default createStyleRule({
    description: 'Disallow hardcoded z-index values in style objects and styled-components',
    url: docsUrl('no-hardcoded-z-index'),
    schemaProperties: {
        allowlist: { type: 'array', items: { type: ['string', 'number'] }, uniqueItems: true },
        properties: stringArray,
    },
    defaultOptions: {
        allowlist: DEFAULT_ZINDEX_ALLOWLIST,
        properties: DEFAULT_ZINDEX_PROPERTIES,
    },
    messages: {
        hardcodedZIndex:
            'Hardcoded z-index value "{{value}}" for "{{property}}" — use a theme token instead.',
    },
    createChecker(options) {
        const allowlist = new Set(
            (options.allowlist as (string | number)[]).map(entry => String(entry).trim())
        );
        const properties = new Set(
            (options.properties as string[]).map(entry => entry.toLowerCase())
        );

        return declaration => {
            const { property, value } = declaration;
            if (!properties.has(property)) return null;
            if (allowlist.has(value) || !isZIndexValue(value)) return null;
            return { messageId: 'hardcodedZIndex', data: { value, property } };
        };
    },
});

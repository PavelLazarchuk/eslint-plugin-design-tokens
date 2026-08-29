import { describe, expect, it } from 'vitest';
import { parse } from 'espree';
import type { AstNode } from '../../src/types';
import {
    getPropDeclarations,
    getStyledTemplateDeclarations,
    isCssPropAttribute,
    isCssTaggedTemplate,
    getStyledObjectDeclarations,
    isStyledObjectCall,
    isStyledTaggedTemplate,
    isTargetProp,
} from '../../src/utils/astHelpers';

function find(code: string, type: string): AstNode {
    const ast = parse(code, {
        ecmaVersion: 2022,
        sourceType: 'module',
        range: true,
        loc: true,
        ecmaFeatures: { jsx: true },
    }) as AstNode;

    const stack: unknown[] = [ast];
    while (stack.length > 0) {
        const current = stack.pop();
        if (Array.isArray(current)) {
            stack.push(...current);
            continue;
        }
        if (typeof current !== 'object' || current === null) continue;
        if ((current as AstNode).type === type) return current as AstNode;
        stack.push(...Object.values(current));
    }

    throw new Error(`No ${type} in ${code}`);
}

const pairs = (declarations: { property: string; value: string }[]) =>
    declarations.map(({ property, value }) => [property, value]);

describe('isTargetProp', () => {
    it.each([
        ['<Box sx={{ color: "red" }} />', true],
        ['<Box style={{ color: "red" }} />', true],
        ['<Box sx={styles} />', false],
        ['<Box sx="red" />', false],
        ['<Box className={{ color: "red" }} />', false],
        ['<Box {...rest} />', false],
    ])('%s → %s', (code, expected) => {
        expect(
            isTargetProp(find(code, code.includes('...') ? 'JSXSpreadAttribute' : 'JSXAttribute'))
        ).toBe(expected);
    });
});

describe('isStyledTaggedTemplate', () => {
    it.each([
        ['styled.div`color: red;`', true],
        ['styled(Button)`color: red;`', true],
        ['css`color: red;`', false],
        ['notStyled.div`color: red;`', false],
        ['styled["div"]`color: red;`', false],
        ['styled.div.attrs({})`color: red;`', false],
    ])('%s → %s', (code, expected) => {
        expect(isStyledTaggedTemplate(find(code, 'TaggedTemplateExpression'))).toBe(expected);
    });
});

describe('isCssTaggedTemplate', () => {
    it.each([
        ['css`color: red;`', true],
        ['styled.div`color: red;`', false],
        ['notCss`color: red;`', false],
        ['css.div`color: red;`', false],
    ])('%s → %s', (code, expected) => {
        expect(isCssTaggedTemplate(find(code, 'TaggedTemplateExpression'))).toBe(expected);
    });
});

describe('isCssPropAttribute', () => {
    it.each([
        ['<Box css={{ color: "red" }} />', true],
        ['<Box css={css`color: red;`} />', true],
        ['<Box css={styles} />', false],
        ['<Box css="color: red" />', false],
        ['<Box css={other`color: red;`} />', false],
        ['<Box sx={{ color: "red" }} />', false],
    ])('%s → %s', (code, expected) => {
        expect(isCssPropAttribute(find(code, 'JSXAttribute'))).toBe(expected);
    });
});

describe('isStyledObjectCall', () => {
    it.each([
        ['styled.div({ color: "red" })', true],
        ['styled(Button)(() => ({ color: "red" }))', true],
        ['styled.div(function () { return { color: "red" }; })', true],
        ['styled.div(() => { const x = 1; })', false],
        ['styled.div(base, { color: "red" })', false],
        ['styled.div(base)', false],
        ['styled(Button)', false],
        ['makeStyles({ color: "red" })', false],
    ])('%s → %s', (code, expected) => {
        expect(isStyledObjectCall(find(code, 'CallExpression'))).toBe(expected);
    });
});

describe('declaration extraction', () => {
    it('returns nothing for a node that is not an entry point', () => {
        expect(getPropDeclarations(find('<Box sx={styles} />', 'JSXAttribute'))).toEqual([]);
        expect(getStyledObjectDeclarations(find('fn({ color: "red" })', 'CallExpression'))).toEqual(
            []
        );
    });

    it('reads the object form of the css prop but leaves its template form to the tag visitor', () => {
        expect(
            pairs(getPropDeclarations(find('<Box css={{ gap: "4px" }} />', 'JSXAttribute')))
        ).toEqual([['gap', '4px']]);
        expect(getPropDeclarations(find('<Box css={css`gap: 4px;`} />', 'JSXAttribute'))).toEqual(
            []
        );
    });

    it('reads a standalone css tag', () => {
        const resolver = { getLocFromIndex: () => ({ line: 1, column: 0 }) };
        expect(
            pairs(
                getStyledTemplateDeclarations(
                    find('css`gap: 4px;`', 'TaggedTemplateExpression'),
                    resolver
                )
            )
        ).toEqual([['gap', '4px']]);
    });

    it('normalizes camelCase keys and accepts quoted ones', () => {
        const declarations = getPropDeclarations(
            find('<Box sx={{ marginTop: "8px", "padding-left": "4px" }} />', 'JSXAttribute')
        );

        expect(pairs(declarations)).toEqual([
            ['margin-top', '8px'],
            ['padding-left', '4px'],
        ]);
    });

    it('walks nested selector objects', () => {
        const declarations = getStyledObjectDeclarations(
            find('styled.div({ "&:hover": { "&:focus": { color: "red" } } })', 'CallExpression')
        );

        expect(pairs(declarations)).toEqual([['color', 'red']]);
    });

    it('ignores spreads, computed keys and non-string values', () => {
        const declarations = getPropDeclarations(
            find(
                '<Box sx={{ ...base, [key]: "red", color: token, padding: 8, gap: "4px" }} />',
                'JSXAttribute'
            )
        );

        expect(pairs(declarations)).toEqual([['gap', '4px']]);
    });
});

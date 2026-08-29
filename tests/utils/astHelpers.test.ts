import { describe, expect, it } from 'vitest';
import { parse } from 'espree';
import type { AstNode } from '../../src/types';
import {
    getPropDeclarations,
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

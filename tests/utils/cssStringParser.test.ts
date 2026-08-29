import { describe, expect, it } from 'vitest';
import { parse } from 'espree';
import { parseCssDeclarations } from '../../src/utils/cssStringParser';

function declarationsOf(code: string) {
    const ast = parse(`styled.div${code}`, {
        ecmaVersion: 2022,
        sourceType: 'module',
        range: true,
        loc: true,
    }) as unknown as { body: { expression: { quasi: unknown } }[] };

    return parseCssDeclarations(ast.body[0]!.expression.quasi as never);
}

describe('parseCssDeclarations', () => {
    it('reads every declaration of a multi-line template', () => {
        const declarations = declarationsOf('`\n  color: #fff;\n  padding: 8px;\n`');

        expect(declarations.map(({ property, value }) => [property, value])).toEqual([
            ['color', '#fff'],
            ['padding', '8px'],
        ]);
    });

    it('reports offsets that point at the declaration in the source', () => {
        const source = 'styled.div`color: #fff;`';
        const [declaration] = declarationsOf('`color: #fff;`');

        expect(source.slice(declaration!.range[0], declaration!.range[1])).toBe('color: #fff');
    });

    it('reads a trailing declaration with no semicolon', () => {
        expect(declarationsOf('`color: red`')).toEqual([
            { property: 'color', value: 'red', range: [11, 21] },
        ]);
    });

    it('excludes surrounding whitespace from the reported range', () => {
        const source = 'styled.div`\n  color: red   ;\n`';
        const [declaration] = declarationsOf('`\n  color: red   ;\n`');

        expect(source.slice(declaration!.range[0], declaration!.range[1])).toBe('color: red');
    });

    it('excludes the trailing newline of a semicolon-less declaration', () => {
        const source = 'styled.div`\n  color: red\n`';
        const [declaration] = declarationsOf('`\n  color: red\n`');

        expect(source.slice(declaration!.range[0], declaration!.range[1])).toBe('color: red');
    });

    it('keeps track of a comment that spans an interpolation', () => {
        expect(declarationsOf('`/* ${x} color: #fff; */ padding: 8px;`')).toMatchObject([
            { property: 'padding', value: '8px' },
        ]);
    });

    it('normalizes property casing and whitespace', () => {
        expect(declarationsOf('`\n  Margin-Top :   12px  ;\n`')).toMatchObject([
            { property: 'margin-top', value: '12px' },
        ]);
    });

    it('skips a declaration whose value comes from an interpolation', () => {
        expect(declarationsOf('`color: ${theme.primary};`')).toEqual([]);
    });

    it('skips an interpolated declaration that continues after the expression', () => {
        expect(declarationsOf('`color: ${x} !important;`')).toEqual([]);
    });

    it('keeps declarations that merely sit next to an interpolation', () => {
        const declarations = declarationsOf('`${reset}\n  color: #fff;\n  padding: ${p}px;\n`');

        expect(declarations.map(({ property, value }) => [property, value])).toEqual([
            ['color', '#fff'],
        ]);
    });

    it('drops selectors and reads declarations inside nested blocks', () => {
        const declarations = declarationsOf('`\n  color: red;\n  &:hover { color: blue; }\n`');

        expect(declarations.map(({ property, value }) => [property, value])).toEqual([
            ['color', 'red'],
            ['color', 'blue'],
        ]);
    });

    it('ignores commented-out declarations', () => {
        expect(declarationsOf('`\n  /* color: #fff; */\n  padding: 8px;\n`')).toMatchObject([
            { property: 'padding', value: '8px' },
        ]);
    });

    it('ignores text that is not a declaration', () => {
        expect(declarationsOf('`\n  100%;\n  color:;\n  1px: 2px;\n`')).toEqual([]);
    });
});

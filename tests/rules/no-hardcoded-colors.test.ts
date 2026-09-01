import rule from '../../src/rules/no-hardcoded-colors';
import { ruleTester, tsRuleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-colors', rule, {
    valid: [
        // Theme tokens are expressions, not literals.
        '<Box sx={{ color: theme.palette.primary.main }} />',
        'styled.div`color: ${theme.palette.primary.main};`',
        'styled(Button)(({ theme }) => ({ color: theme.palette.primary.main }))',

        // Allowlisted keywords.
        '<Box sx={{ backgroundColor: "transparent" }} />',
        '<Box sx={{ color: "inherit" }} />',
        '<Box sx={{ borderColor: "currentColor" }} />',
        {
            code: '<Box sx={{ color: "#fff" }} />',
            options: [{ allowlist: ['#fff'] }],
        },

        // Values that already come from a token.
        '<Box sx={{ color: "var(--brand-primary)" }} />',
        '<Box sx={{ color: "rgb(var(--brand-rgb))" }} />',

        // Not a color at all.
        '<Box sx={{ display: "flex" }} />',
        'styled.div`padding: 8px;`',

        // Values matched by a pattern instead of by name.
        {
            code: '<Box sx={{ color: "#ff0000" }} />',
            options: [{ allowlistPatterns: ['^#f{2}0{4}$'] }],
        },
        {
            code: 'styled.div`color: rgb(0 0 0 / 50%);`',
            options: [{ allowlistPatterns: ['^rgb\\('] }],
        },
        {
            // Properties the design system does not own.
            code: '<Box sx={{ fill: "#fff", stroke: "#000" }} />',
            options: [{ ignorePropertyPattern: '^(fill|stroke)$' }],
        },
        {
            code: 'styled.div`--legacy-fg: #fff;`',
            options: [{ ignorePropertyPattern: '^--' }],
        },

        // Not a target prop or a target call.
        '<Box data-color="#fff" />',
        '<Box style="color: #fff" />',
        'notStyled.div`color: #fff;`',
        'styled(Button)',
        'makeStyles({ color: "#fff" })',

        // `.attrs` configures props, not styles.
        'styled.div.attrs({ color: "#fff" })',

        // A template with something in it is not a value the rule can read.
        '<Box sx={{ color: `${brand}` }} />',
    ],
    invalid: [
        {
            code: '<Box sx={{ color: "#ff0000" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: '#ff0000' } }],
        },
        {
            code: '<Box style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: 'rgba(0, 0, 0, 0.5)' } }],
        },
        {
            code: '<Box sx={{ "&:hover": { color: "hsl(210, 50%, 40%)" } }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ borderColor: "rebeccapurple" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: 'rebeccapurple' } }],
        },
        {
            code: 'styled.div`\n  color: #fff;\n  background: red;\n`',
            errors: [
                { messageId: 'hardcodedColor', line: 2, column: 3, endLine: 2, endColumn: 14 },
                { messageId: 'hardcodedColor', line: 3, column: 3 },
            ],
        },
        {
            code: 'styled(Button)`color: #123456;`',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<div css={{ color: "#fff" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<div css={css`color: #fff;`} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'css`color: #fff;`',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'styled.div({ color: "#abc" })',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'styled(Button)(({ theme }) => ({ color: "#abc", padding: theme.spacing(1) }))',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'styled.div(function () { return { color: "white" }; })',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'css({ color: "#fff" })',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'style({ color: "#fff" })',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'keyframes`from { color: #fff; }`',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'createGlobalStyle`color: #fff;`',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'injectGlobal`color: #fff;`',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'styled.div({ color: "#fff" }, { background: "#000" })',
            errors: [{ messageId: 'hardcodedColor' }, { messageId: 'hardcodedColor' }],
        },
        {
            code: 'styled.div.attrs({ type: "text" })`color: #fff;`',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: 'styled.div.attrs({ type: "text" })({ color: "#fff" })',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={theme => ({ color: "#fff", padding: theme.spacing(1) })} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={[base, active && { color: "#fff" }]} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={active ? { color: "#fff" } : base} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: `#fff` }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "transparent" }} />',
            options: [{ allowlist: [] }],
            errors: [{ messageId: 'hardcodedColor' }],
        },
    ],
});

tsRuleTester.run('no-hardcoded-colors (typescript)', rule, {
    valid: ['const styles = { color: theme.palette.primary.main } as const;'],
    invalid: [
        {
            code: 'const styles = { color: "#fff" } as const;\n<Box sx={styles} />;',
            errors: [{ messageId: 'hardcodedColor', line: 1, column: 18 }],
        },
        {
            code: 'const styles = { color: "#fff" } satisfies Styles;\n<Box sx={styles} />;',
            errors: [{ messageId: 'hardcodedColor', line: 1, column: 18 }],
        },
    ],
});

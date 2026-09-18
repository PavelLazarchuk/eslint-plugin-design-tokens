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
        '<Box sx={{ background: "linear-gradient(var(--from), var(--to))" }} />',
        '<Box sx={{ border: "1px solid var(--ds-border)" }} />',
        '<Box sx={{ color: "color-mix(in oklch, var(--a) 40%, var(--b))" }} />',
        '<Box sx={{ color: "light-dark(var(--fg), var(--fg-dark))" }} />',
        '<Box sx={{ backgroundImage: "url(red.png)" }} />',

        '<Box sx={{ fontFamily: "Tan, sans-serif" }} />',
        '<Box sx={{ font: "bold 12px/1.5 Linen" }} />',
        '<Box sx={{ animationName: "salmon" }} />',

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

        {
            code: '<Box sx={{ background: "linear-gradient(#fff, #000)" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: '#fff' } }],
        },
        {
            code: 'styled.div`border-top: 1px solid #ccc;`',
            errors: [{ messageId: 'hardcodedColor', data: { value: '#ccc' } }],
        },
        {
            code: 'styled.div`text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);`',
            errors: [{ messageId: 'hardcodedColor', data: { value: 'rgba(0, 0, 0, 0.4)' } }],
        },
        {
            code: 'styled.div`filter: drop-shadow(0 0 2px #000);`',
            errors: [{ messageId: 'hardcodedColor', data: { value: '#000' } }],
        },
        {
            code: 'styled.div`outline: 2px dashed red;`',
            errors: [{ messageId: 'hardcodedColor', data: { value: 'red' } }],
        },
        {
            code: '<Box sx={{ background: "linear-gradient(#fff, #000), #eee" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: '#fff' } }],
        },

        {
            code: '<Box sx={{ color: "oklch(0.7 0.1 250)" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: 'oklch(0.7 0.1 250)' } }],
        },
        {
            code: '<Box sx={{ color: "oklab(0.7 0.1 -0.05)" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "lab(52% 40 60)" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "lch(52% 72 40)" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "hwb(210 10% 20%)" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "color(display-p3 1 0 0)" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "color-mix(in srgb, #fff 50%, #000)" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "light-dark(#fff, #000)" }} />',
            errors: [{ messageId: 'hardcodedColor' }],
        },
        {
            code: '<Box sx={{ color: "color-mix(in srgb, var(--brand) 50%, white)" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: 'white' } }],
        },

        {
            code: '<Box sx={{ color: "var(--brand, #fff)" }} />',
            errors: [{ messageId: 'hardcodedColor', data: { value: '#fff' } }],
        },
        {
            code: 'styled.div`border: 1px solid var(--ds-border, rgb(0 0 0 / 20%));`',
            errors: [{ messageId: 'hardcodedColor', data: { value: 'rgb(0 0 0 / 20%)' } }],
        },

        {
            code: '<Box sx={{ border: "1px solid #ccc" }} />',
            options: [{ allowlist: ['#fff'] }],
            errors: [{ messageId: 'hardcodedColor', data: { value: '#ccc' } }],
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

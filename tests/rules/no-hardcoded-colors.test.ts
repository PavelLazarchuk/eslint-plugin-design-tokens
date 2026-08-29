import rule from '../../src/rules/no-hardcoded-colors';
import { ruleTester } from '../ruleTester';

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

        // Not a target prop or a target call.
        '<Box data-color="#fff" />',
        '<Box style="color: #fff" />',
        'css`color: #fff;`',
        'notStyled.div`color: #fff;`',
        'styled(Button)',
        'makeStyles({ color: "#fff" })',
        'styled.div(base, { color: "#fff" })',
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
            // The default allowlist is replaced, not extended.
            code: '<Box sx={{ color: "transparent" }} />',
            options: [{ allowlist: [] }],
            errors: [{ messageId: 'hardcodedColor' }],
        },
    ],
});

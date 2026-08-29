import rule from '../../src/rules/no-hardcoded-spacing';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-spacing', rule, {
    valid: [
        // Theme tokens are expressions, not literals.
        '<Box sx={{ padding: theme.spacing(2) }} />',
        'styled.div`margin: ${theme.spacing(2)};`',
        'styled(Button)(({ theme }) => ({ gap: theme.spacing(1) }))',

        // Unitless and token-shaped values.
        '<Box sx={{ margin: "0" }} />',
        '<Box sx={{ padding: "var(--space-2)" }} />',
        '<Box sx={{ marginTop: "auto" }} />',

        // Not a spacing property by default.
        '<Box sx={{ width: "240px" }} />',
        '<Box sx={{ fontSize: "16px" }} />',
        'styled.div`border-radius: 4px;`',

        {
            code: '<Box sx={{ padding: "8px" }} />',
            options: [{ allowlist: ['8px'] }],
        },
        {
            code: '<Box sx={{ padding: "8px" }} />',
            options: [{ properties: ['margin'] }],
        },

        // Not a target prop or a target call.
        '<Box data-padding="8px" />',
        'css`padding: 8px;`',
        'notStyled.div`padding: 8px;`',
    ],
    invalid: [
        {
            code: '<Box sx={{ padding: "8px" }} />',
            errors: [
                { messageId: 'hardcodedSpacing', data: { value: '8px', property: 'padding' } },
            ],
        },
        {
            code: '<Box style={{ marginTop: "1.5rem" }} />',
            errors: [
                {
                    messageId: 'hardcodedSpacing',
                    data: { value: '1.5rem', property: 'margin-top' },
                },
            ],
        },
        {
            code: '<Box sx={{ top: "-2px", columnGap: "0.5em" }} />',
            errors: [{ messageId: 'hardcodedSpacing' }, { messageId: 'hardcodedSpacing' }],
        },
        {
            code: 'styled.div`\n  margin: 16px;\n  padding: ${p};\n`',
            errors: [
                { messageId: 'hardcodedSpacing', line: 2, column: 3, endLine: 2, endColumn: 15 },
            ],
        },
        {
            code: 'styled(Button)({ gap: "4px" })',
            errors: [{ messageId: 'hardcodedSpacing' }],
        },
        {
            // CSS units are case-insensitive.
            code: '<Box sx={{ padding: "8PX" }} />',
            errors: [{ messageId: 'hardcodedSpacing' }],
        },
        {
            code: 'styled.div(({ theme }) => ({ "@media (min-width: 600px)": { left: "12px" } }))',
            errors: [{ messageId: 'hardcodedSpacing' }],
        },
        {
            code: '<Box sx={{ width: "240px" }} />',
            options: [{ properties: ['width'] }],
            errors: [
                { messageId: 'hardcodedSpacing', data: { value: '240px', property: 'width' } },
            ],
        },
    ],
});

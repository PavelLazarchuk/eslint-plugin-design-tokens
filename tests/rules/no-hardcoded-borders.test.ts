import rule from '../../src/rules/no-hardcoded-borders';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-borders', rule, {
    valid: [
        '<Box sx={{ border: theme.border.thin }} />',
        'styled.div`border: ${theme.border.thin};`',
        'styled(Button)(({ theme }) => ({ border: theme.border.thin }))',

        '<Box sx={{ border: "var(--border-thin)" }} />',
        '<Box sx={{ border: "1px solid var(--color-border)" }} />',
        '<Box sx={{ border: "none" }} />',
        '<Box sx={{ border: "0" }} />',
        '<Box sx={{ border: "inherit" }} />',
        '<Box sx={{ borderStyle: "solid" }} />',
        '<Box sx={{ borderColor: "#fff" }} />',

        '<Box sx={{ border: "1px solid color-mix(in srgb, #000 20%, transparent)" }} />',

        '<Box sx={{ padding: "8px" }} />',
        'styled.div`border-radius: 4px;`',

        {
            code: '<Box sx={{ border: "1px solid #fff" }} />',
            options: [{ allowlist: ['1px solid #fff'] }],
        },
        {
            code: '<Box sx={{ outline: "1px solid #fff" }} />',
            options: [{ properties: ['border'] }],
        },

        '<Box data-border="1px solid #fff" />',
        'notCss`border: 1px solid #fff;`',
    ],
    invalid: [
        {
            code: '<Box sx={{ border: "1px solid #fff" }} />',
            errors: [
                {
                    messageId: 'hardcodedBorder',
                    data: { value: '1px solid #fff', property: 'border' },
                },
            ],
        },
        {
            code: '<Card style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }} />',
            errors: [{ messageId: 'hardcodedBorder' }],
        },
        {
            code: '<Box sx={{ borderBottom: "2px dashed red", borderWidth: "1px" }} />',
            errors: [{ messageId: 'hardcodedBorder' }, { messageId: 'hardcodedBorder' }],
        },
        {
            code: 'styled.div`\n  border: 1px solid #fff;\n  border-top: ${p};\n`',
            errors: [
                { messageId: 'hardcodedBorder', line: 2, column: 3, endLine: 2, endColumn: 25 },
            ],
        },
        {
            code: 'styled(Button)({ borderLeft: "thin solid black" })',
            errors: [{ messageId: 'hardcodedBorder' }],
        },
        {
            code: '<div css={{ border: "1px solid #fff" }} />',
            errors: [{ messageId: 'hardcodedBorder' }],
        },
        {
            code: '<div css={css`border: 1px solid #fff;`} />',
            errors: [{ messageId: 'hardcodedBorder' }],
        },
        {
            code: 'const style = css`outline: 2px solid #000;`',
            errors: [
                {
                    messageId: 'hardcodedBorder',
                    data: { value: '2px solid #000', property: 'outline' },
                },
            ],
        },
        {
            code: 'styled.div(({ theme }) => ({ "&:hover": { border: "1px solid #fff" } }))',
            errors: [{ messageId: 'hardcodedBorder' }],
        },
        {
            code: '<Box sx={{ borderTopWidth: "0.5rem" }} />',
            errors: [{ messageId: 'hardcodedBorder' }],
        },
        {
            code: '<Box sx={{ borderColor: "#fff" }} />',
            options: [{ properties: ['border-color'] }],
            errors: [{ messageId: 'hardcodedBorder' }],
        },
    ],
});

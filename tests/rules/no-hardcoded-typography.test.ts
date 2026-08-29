import rule from '../../src/rules/no-hardcoded-typography';
import { ruleTester } from '../ruleTester';

ruleTester.run('no-hardcoded-typography', rule, {
    valid: [
        // Theme tokens are expressions, not literals.
        '<Typography sx={{ fontSize: theme.typography.body1.fontSize }} />',
        'styled.p`font-size: ${theme.typography.h1.fontSize};`',
        'styled(Button)(({ theme }) => ({ fontWeight: theme.typography.fontWeightBold }))',

        // CSS variables and keywords.
        '<Box sx={{ fontSize: "var(--font-size-m)" }} />',
        '<Box sx={{ fontWeight: "bold" }} />',
        '<Box sx={{ lineHeight: "normal" }} />',

        // Not a typography property.
        '<Box sx={{ padding: "8px" }} />',
        'styled.div`letter-spacing: 2px;`',

        // font-family stays quiet unless it is asked for.
        '<Box sx={{ fontFamily: "Inter, sans-serif" }} />',
        'styled.div`font-family: Inter, sans-serif;`',
        {
            code: '<Box sx={{ fontFamily: "var(--font-body)" }} />',
            options: [{ checkFontFamily: true }],
        },
        {
            code: '<Box sx={{ fontFamily: "inherit" }} />',
            options: [{ checkFontFamily: true }],
        },

        {
            code: '<Box sx={{ fontSize: "14px" }} />',
            options: [{ allowlist: ['14px'] }],
        },
        {
            code: '<Box sx={{ fontSize: "14px" }} />',
            options: [{ properties: ['line-height'] }],
        },

        // Not an entry point.
        '<Box data-font-size="14px" />',
        'notCss`font-size: 14px;`',
    ],
    invalid: [
        // MUI sx.
        {
            code: '<Typography sx={{ fontSize: "14px" }} />',
            errors: [
                {
                    messageId: 'hardcodedTypography',
                    data: { value: '14px', property: 'font-size' },
                },
            ],
        },
        // Ant Design inline style.
        {
            code: '<Typography.Text style={{ fontSize: "0.875rem", fontWeight: 700 }} />',
            errors: [
                {
                    messageId: 'hardcodedTypography',
                    data: { value: '0.875rem', property: 'font-size' },
                },
                {
                    messageId: 'hardcodedTypography',
                    data: { value: '700', property: 'font-weight' },
                },
            ],
        },
        {
            code: '<Box style={{ fontWeight: "600", lineHeight: "1.5" }} />',
            errors: [{ messageId: 'hardcodedTypography' }, { messageId: 'hardcodedTypography' }],
        },
        // styled template.
        {
            code: 'styled.div`\n  font-size: 14px;\n  line-height: ${p};\n`',
            errors: [
                { messageId: 'hardcodedTypography', line: 2, column: 3, endLine: 2, endColumn: 18 },
            ],
        },
        // styled object.
        {
            code: 'styled(Button)({ lineHeight: "24px" })',
            errors: [
                {
                    messageId: 'hardcodedTypography',
                    data: { value: '24px', property: 'line-height' },
                },
            ],
        },
        // Emotion css prop, object form.
        {
            code: '<div css={{ fontSize: "12px" }} />',
            errors: [{ messageId: 'hardcodedTypography' }],
        },
        // Emotion css prop, template form.
        {
            code: '<div css={css`font-size: 12px;`} />',
            errors: [{ messageId: 'hardcodedTypography' }],
        },
        // Standalone css tag.
        {
            code: 'const style = css`font-weight: 700;`',
            errors: [
                {
                    messageId: 'hardcodedTypography',
                    data: { value: '700', property: 'font-weight' },
                },
            ],
        },
        // Nested selectors.
        {
            code: 'styled.div(({ theme }) => ({ "&:hover": { fontSize: "18px" } }))',
            errors: [{ messageId: 'hardcodedTypography' }],
        },
        {
            code: '<Box sx={{ fontFamily: "Inter, sans-serif" }} />',
            options: [{ checkFontFamily: true }],
            errors: [
                {
                    messageId: 'hardcodedTypography',
                    data: { value: 'Inter, sans-serif', property: 'font-family' },
                },
            ],
        },
        {
            code: '<Box sx={{ letterSpacing: "2px" }} />',
            options: [{ properties: ['letter-spacing'] }],
            errors: [
                {
                    messageId: 'hardcodedTypography',
                    data: { value: '2px', property: 'letter-spacing' },
                },
            ],
        },
    ],
});

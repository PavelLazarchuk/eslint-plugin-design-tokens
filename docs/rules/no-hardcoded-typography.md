# design-tokens/no-hardcoded-typography

📝 Disallow hardcoded typography values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a literal `font-size` (`px`, `rem`, `em`, `pt`, `%`), a numeric `font-weight`, or a `line-height` given as a length or a bare number.

```jsx
/* ✗ incorrect */
<Typography sx={{ fontSize: '14px', fontWeight: 600 }} />;
styled.p`
    line-height: 1.5715;
`;

/* ✓ correct */
<Typography sx={{ fontSize: theme.typography.body2.fontSize }} />;
styled.p`
    line-height: var(--line-height-body);
`;
```

## Options

| Option            | Type       | Default                                                  |
| ----------------- | ---------- | -------------------------------------------------------- |
| `properties`      | `string[]` | `font-size`, `font-weight`, `line-height`, `font-family` |
| `allowlist`       | `string[]` | `[]`                                                     |
| `checkFontFamily` | `boolean`  | `false`                                                  |

`font-family` is off by default. A font stack is a name rather than a shape, so there is no way to tell a deliberate `'Inter, sans-serif'` from a leak — turning it on catches more and misfires more:

```js
{
    'design-tokens/no-hardcoded-typography': ['warn', { checkFontFamily: true }],
}
```

With it on, only `var(--...)` and the CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`) pass.

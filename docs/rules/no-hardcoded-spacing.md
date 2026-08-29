# design-tokens/no-hardcoded-spacing

📝 Disallow hardcoded spacing values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a string holding a single length in `px`, `rem` or `em` on a spacing property.

```jsx
/* ✗ incorrect */
<Box sx={{ padding: '8px' }} />;
styled.div`
    margin-top: 1.5rem;
`;

/* ✓ correct */
<Box sx={{ padding: theme.spacing(1) }} />;
<Box sx={{ p: 2 }} />;
styled.div`
    margin-top: var(--space-4);
`;
```

## Options

| Option       | Type       | Default                                                                                                                                                |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `properties` | `string[]` | `margin`, `margin-top/right/bottom/left`, `padding`, `padding-top/right/bottom/left`, `gap`, `row-gap`, `column-gap`, `top`, `right`, `bottom`, `left` |
| `allowlist`  | `string[]` | `[]`                                                                                                                                                   |

`width` and `height` are deliberately left out — fixed sizes are legitimate far more often than fixed margins are. Add them when your system says otherwise:

```js
{
    'design-tokens/no-hardcoded-spacing': [
        'warn',
        { properties: ['margin', 'padding', 'gap', 'width', 'height'], allowlist: ['1px'] },
    ],
}
```

## Notes

Property names are matched in kebab-case, and camelCase keys are normalised before the check — `marginTop` and `'margin-top'` are the same property.

Unitless values are never reported, so `margin: '0'` and MUI's `sx={{ p: 2 }}` spacing multipliers pass.

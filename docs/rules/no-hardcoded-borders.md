# design-tokens/no-hardcoded-borders

📝 Disallow hardcoded border values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a `border` shorthand (or a `border-width`, or an `outline`) that spells out a literal width or color.

```jsx
/* ✗ incorrect */
<Box sx={{ border: '1px solid #fff' }} />;
styled.div`
    border-bottom: 2px dashed rgba(0, 0, 0, 0.15);
`;

/* ✓ correct */
<Box sx={{ border: theme.border.thin }} />;
styled.div`
    border-bottom: 1px solid var(--color-border);
`;
```

## Options

| Option       | Type       | Default                                                                                                                                           |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `properties` | `string[]` | `border`, `border-top/right/bottom/left`, `border-inline`, `border-block`, `border-width`, the four `border-*-width`s, `outline`, `outline-width` |
| `allowlist`  | `string[]` | `[]`                                                                                                                                              |

`border-color` is not in the default list, because a whole-value color is already [`no-hardcoded-colors`](./no-hardcoded-colors.md)' job and listing it here would report the same hardcode twice.

## Notes

The style keyword carries no design decision, so `border: 'none'`, `border: '0'` and `borderStyle: 'solid'` all pass. A shorthand is reported when it holds a literal width or a literal color, and left alone entirely when any part of it is already tokenized: `border: '1px solid var(--color-border)'` is not reported.

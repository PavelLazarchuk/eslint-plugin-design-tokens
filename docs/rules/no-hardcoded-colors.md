# design-tokens/no-hardcoded-colors

📝 Disallow hardcoded color values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a string whose whole value is a color: hex (`#fff`, `#ff0000ff`), `rgb()`/`rgba()`, `hsl()`/`hsla()`, or a CSS named color (`red`, `rebeccapurple`).

```jsx
/* ✗ incorrect */
<Box sx={{ color: '#ff0000' }} />;
styled.div`
    background: rgba(0, 0, 0, 0.5);
`;

/* ✓ correct */
<Box sx={{ color: theme.palette.error.main }} />;
styled.div`
    background: var(--color-overlay);
`;
```

## Options

| Option                  | Type       | Default                                              |
| ----------------------- | ---------- | ---------------------------------------------------- |
| `allowlist`             | `string[]` | `['transparent', 'inherit', 'currentColor', 'none']` |
| `allowlistPatterns`     | `string[]` | `[]`                                                 |
| `ignorePropertyPattern` | `string`   | —                                                    |

`allowlistPatterns` and `ignorePropertyPattern` are read by every rule in this plugin: the first excuses a value that any of the patterns matches, the second skips a declaration whose property matches it. Both are regular expressions written as strings and compiled with the `u` flag, and a property is matched by its CSS spelling — `backgroundColor` in a style object is tested as `background-color`.

`allowlist` **replaces** the default list rather than extending it, so include the defaults you still want:

```js
{
    'design-tokens/no-hardcoded-colors': [
        'error',
        { allowlist: ['transparent', 'inherit', 'currentColor', 'none', '#0000'] },
    ],
}
```

## Notes

Values are matched whole, so `border: '1px solid #fff'` is not reported here — [`no-hardcoded-borders`](./no-hardcoded-borders.md) reads that shorthand instead.

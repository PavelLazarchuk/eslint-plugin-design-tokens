# design-tokens/no-hardcoded-z-index

📝 Disallow hardcoded z-index values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a literal `z-index` outside your layer scale.

```jsx
/* ✗ incorrect */
<Modal sx={{ zIndex: 1300 }} />;
styled.div`
    z-index: 999;
`;

/* ✓ correct */
<Modal sx={{ zIndex: theme.zIndex.modal }} />;
styled.div`
    z-index: var(--layer-modal);
`;
```

## Options

| Option                  | Type                   | Default      |
| ----------------------- | ---------------------- | ------------ |
| `allowlist`             | `(string \| number)[]` | `[0, 1, -1]` |
| `properties`            | `string[]`             | `z-index`    |
| `allowlistPatterns`     | `string[]`             | `[]`         |
| `ignorePropertyPattern` | `string`               | —            |

`allowlistPatterns` and `ignorePropertyPattern` are read by every rule in this plugin: the first excuses a value that any of the patterns matches, the second skips a declaration whose property matches it. Both are regular expressions written as strings and compiled with the `u` flag, and a property is matched by its CSS spelling — `backgroundColor` in a style object is tested as `background-color`.

`0`, `1` and `-1` are allowed by default: those are how a local stacking context is nudged, not a place in the global layer scale. Numbers and strings are interchangeable in the allowlist, and `allowlist: []` reports every literal:

```js
{
    'design-tokens/no-hardcoded-z-index': ['warn', { allowlist: [0, 1, -1, 2] }],
}
```

## Notes

`z-index: 'auto'` passes. Unlike the other rules, this one reads numeric literals as well as strings, because `zIndex: 1300` in an `sx` object is the form the value almost always takes.

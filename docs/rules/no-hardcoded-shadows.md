# design-tokens/no-hardcoded-shadows

📝 Disallow hardcoded shadow values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a `box-shadow` or `text-shadow` whose value reads as a literal shadow: two or more lengths, or one length next to a literal color. `inset` is ignored while matching.

```jsx
/* ✗ incorrect */
<Card sx={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }} />;
styled.div`
    box-shadow: inset 0 0 0 1px #000;
`;

/* ✓ correct */
<Card sx={{ boxShadow: theme.shadows[2] }} />;
styled.div`
    box-shadow: var(--shadow-card);
`;
```

## Options

| Option       | Type       | Default                     |
| ------------ | ---------- | --------------------------- |
| `properties` | `string[]` | `box-shadow`, `text-shadow` |
| `allowlist`  | `string[]` | `[]`                        |

## Notes

The whole declaration is matched at once, so a multi-layer shadow is **one** report, not one per layer:

```jsx
<Card sx={{ boxShadow: '0 1px 2px #000, 0 2px 4px #000' }} />
//                      ^ a single "hardcoded shadow" report
```

A layer holding anything the matcher cannot read — `var(--shadow-color)`, `color-mix(...)`, an unfamiliar unit — is left alone, on the assumption that a value it cannot parse in full is a value it has no business rewriting.

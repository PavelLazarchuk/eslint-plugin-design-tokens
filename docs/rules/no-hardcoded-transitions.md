# design-tokens/no-hardcoded-transitions

📝 Disallow hardcoded transition values in style objects and styled-components.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a transition or animation value holding a literal duration (`0.3s`, `200ms`) or a literal easing (`ease-in-out`, `cubic-bezier(...)`, `steps(...)`).

```jsx
/* ✗ incorrect */
<Box sx={{ transition: 'all 0.3s ease' }} />;
styled.div`
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
`;

/* ✓ correct */
<Box sx={{ transition: theme.transitions.create('all') }} />;
styled.div`
    transition: opacity var(--duration-fast) var(--easing-standard);
`;
```

## Options

| Option       | Type       | Default                                                                                                                                                                  |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `properties` | `string[]` | `transition`, `transition-duration`, `transition-delay`, `transition-timing-function`, `animation`, `animation-duration`, `animation-delay`, `animation-timing-function` |
| `allowlist`  | `string[]` | `[]`                                                                                                                                                                     |

## Notes

The whole declaration is one report, comma-separated transitions included: `'color 0.2s ease, opacity 0.3s linear'` reports once.

The property being transitioned and an animation's keyframe name are ignored, so `transition: 'color'` and `animation-name: 'spin'` pass — only the timing is a token. `transition: 'none'` passes too.

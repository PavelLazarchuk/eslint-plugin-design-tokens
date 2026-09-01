# design-tokens/no-unknown-token-var

📝 Disallow CSS custom properties outside the design system.

⚠️ This rule _warns_ in the ✅ `recommended` [config](https://github.com/PavelLazarchuk/eslint-plugin-design-tokens#setup).

<!-- end auto-generated rule header -->

Reports a `var(--…)` reference to a custom property your design system does not own.

Every other rule in this plugin treats `var(--anything)` as proof that a value came from somewhere. This one closes that hole: a variable name nobody defines is a typo or a leftover from an older system, and it fails silently at runtime.

```jsx
/* ✗ incorrect — with { prefixes: ['ds-'] } */
<Box sx={{ color: 'var(--brand-primary)' }} />;
styled.div`
    border: var(--legacy-width) solid var(--legacy-color);
`;

/* ✓ correct */
<Box sx={{ color: 'var(--ds-color-text)' }} />;
styled.div`
    border: var(--ds-border-width) solid var(--ds-color-border);
`;
```

## Options

| Option      | Type       | Default |
| ----------- | ---------- | ------- |
| `prefixes`  | `string[]` | `[]`    |
| `allowlist` | `string[]` | `[]`    |

`prefixes` is the namespace your tokens are generated under; `allowlist` names the individual variables that live outside it. The leading `--` is optional in both, and matching is case-insensitive:

```js
{
    'design-tokens/no-unknown-token-var': [
        'warn',
        { prefixes: ['--ds-'], allowlist: ['--brand-primary'] },
    ],
}
```

## Notes

Until one of the two options is set the rule reports nothing — with no description of the design system there is no way to tell a token from a typo, so the rule stays quiet rather than guessing. It ships in the `recommended` config in that quiet state, ready to be pointed at your namespace.

Every variable in a value is checked, not just the first, so `border: var(--a) solid var(--b)` reports twice. A fallback is read the same way as the variable it backs: `var(--legacy-fg, var(--ds-fg))` reports `--legacy-fg` and passes `--ds-fg`.

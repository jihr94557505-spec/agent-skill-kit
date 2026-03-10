# Contributing

Thanks for contributing to `agent-skill-kit`.

## Development

```bash
npm install
node ./bin/askit.js checklist
node ./bin/askit.js lint ./examples/demo-skill
node ./bin/askit.js lint-all .
```

## Contribution guidelines

- Keep the CLI dependency-light
- Prefer useful checks over clever checks
- Make lint output easy to read in terminals and CI logs
- Add or update examples when changing the generated template

## Good first contributions

- add JSON output mode
- improve frontmatter parsing
- add more content quality rules
- support repo config files

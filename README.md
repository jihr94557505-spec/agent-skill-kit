# agent-skill-kit

A lightweight CLI for scaffolding, linting, and standardizing AI agent skills.

`agent-skill-kit` is aimed at a real pain point in agent ecosystems: skill docs are often inconsistent, under-specified, and annoying to maintain at scale. This tool gives maintainers a practical baseline they can use locally or in CI.

## Why this is more than a toy

Most skill repos eventually hit the same problems:

- copied folders drift in structure
- `SKILL.md` quality becomes inconsistent
- examples are vague or missing
- contributors forget prerequisites and troubleshooting notes
- reviewers have no fast quality gate

This project turns that into a repeatable workflow.

## Features

- `init` — scaffold a new skill folder
- `lint` — validate a single skill
- `lint-all` — scan and score every skill in a repo
- `lint-all --report report.md` — export a markdown report
- `readme` — generate a starter README for a skill folder
- `checklist` — print a pre-publish checklist
- `init-config` — create `askit.config.json` for repo-specific rules
- `--json` output for automation and CI integrations

## Quick start

### Install

```bash
npm install
npm link
```

### Create a new skill

```bash
askit init my-skill
```

### Lint a single skill

```bash
askit lint ./my-skill
```

### Lint the whole repo

```bash
askit lint-all .
```

### Export a markdown report

```bash
askit lint-all . --report report.md
```

### Get machine-readable output

```bash
askit lint-all . --json
```

### Create repo config

```bash
askit init-config
```

## Example output

```bash
$ askit lint ./examples/demo-skill

# demo-skill
✔ Found SKILL.md
✔ Name exists in frontmatter
✔ Description exists
✔ Description has useful length
✔ Contains When to Use section
✔ Contains Prerequisites section
✔ Contains Usage section
✔ Contains Examples section
✔ Contains Troubleshooting section
✔ Skill doc has non-trivial content
✔ Contains at least one code block example
✔ README.md exists
Score: 120
✔ Lint passed
```

## Example report

```bash
$ askit lint-all . --report report.md
✔ Wrote report to /path/to/report.md

Scanned 1 skill folder(s). Failed: 0. Avg score: 120.
```

The generated report includes:
- overall repo summary
- per-skill score table
- detailed passes, warnings, and errors

## Config file

Create `askit.config.json` in your repo root:

```json
{
  "minDescriptionLength": 24,
  "minDocLength": 300,
  "requireReadme": false,
  "requireScriptsWhenReferenced": true
}
```

## Current lint checks

### Errors

- missing `SKILL.md`
- missing frontmatter `name`
- missing frontmatter `description`
- missing required sections
- document too short
- required README missing when config says so

### Warnings

- description too short
- section content looks too thin
- no code block example found
- placeholder text like `TODO` / `TBD`
- `scripts/` referenced but empty

## Why this matters for OSS

Open-source agent ecosystems need better maintenance primitives, not just more skills. `agent-skill-kit` focuses on quality, consistency, and contributor ergonomics so teams can keep skill libraries usable as they grow.

## Project structure

- `bin/askit.js` — CLI entrypoint
- `templates/skill/SKILL.md.tpl` — scaffold template
- `examples/demo-skill/` — realistic sample skill
- `.github/workflows/ci.yml` — CI checks
- `OPENAI_APPLICATION_NOTES.md` — notes for OSS support applications

## Roadmap

### Shipped

- [x] skill scaffolding
- [x] single-skill linting
- [x] repo-wide linting
- [x] markdown report output
- [x] README generation
- [x] scoring and warnings
- [x] JSON output
- [x] repo-level config

### Next

- [ ] better frontmatter parsing
- [ ] optional autofix for common issues
- [ ] GitHub Action annotations
- [ ] stricter example validation

## Contributing

See `CONTRIBUTING.md`.

## License

MIT

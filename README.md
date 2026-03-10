# agent-skill-kit

A lightweight CLI for building better AI agent skills faster.

`agent-skill-kit` helps with the boring parts of skill authoring: scaffolding folders, creating a usable `SKILL.md`, linting quality, and giving maintainers a clean pre-publish checklist.

## Why this exists

Agent skills are useful, but the authoring workflow is still messy in most repos:

- people copy old folders by hand
- `SKILL.md` quality varies wildly
- examples and prerequisites get skipped
- maintainers have no fast quality gate before publishing

This project is a small, opinionated fix for that problem.

## What it does today

- `init` — scaffold a new skill folder
- `lint` — validate one skill folder
- `lint-all` — scan a repo and lint every skill it finds
- `readme` — generate a starter README for a skill
- `checklist` — print a release checklist before publishing

## Who it's for

- people building reusable AI agent skills
- teams maintaining internal skill libraries
- anyone tired of copy-paste skill setup

## Install

```bash
npm install
npm link
```

## Quick start

### 1) Create a new skill

```bash
askit init my-skill
```

This creates:

- `SKILL.md`
- `README.md`
- `scripts/`
- `references/`
- `assets/`

### 2) Lint one skill

```bash
askit lint ./my-skill
```

### 3) Lint an entire repo

```bash
askit lint-all .
```

### 4) Regenerate a starter README

```bash
askit readme ./my-skill
```

### 5) Run a publish checklist

```bash
askit checklist
```

## Example

```bash
$ askit lint ./examples/demo-skill

# demo-skill
✔ Found SKILL.md
✔ Name exists in frontmatter
✔ Description exists
✔ Contains When to Use section
✔ Contains Prerequisites section
✔ Contains Usage section
✔ Contains Examples section
✔ Contains Troubleshooting section
✔ Skill doc has non-trivial content
✔ Lint passed
```

## Lint rules in v0.1

Current checks are intentionally simple and useful:

- `SKILL.md` exists
- frontmatter includes `name`
- frontmatter includes `description`
- includes `When to Use`
- includes `Prerequisites`
- includes `Usage`
- includes `Examples`
- includes `Troubleshooting`
- document is not trivially short

## Project structure

- `bin/askit.js` — CLI entrypoint
- `templates/skill/SKILL.md.tpl` — default skill template
- `examples/demo-skill/` — sample generated skill
- `.github/workflows/ci.yml` — basic CI

## Roadmap

### Near-term

- [x] scaffold command
- [x] single-skill linting
- [x] repo-wide linting
- [x] starter README generation
- [x] release checklist

### Next

- [ ] configurable lint rules
- [ ] machine-readable JSON output
- [ ] better frontmatter parsing
- [ ] GitHub Action with annotations
- [ ] batch fix mode for common issues

## Why this repo can grow

This is intentionally small, but it has a real expansion path:

- quality gates for skill ecosystems
- CI integration for internal skill repos
- metadata normalization
- skill publishing workflows
- reusable templates for teams

## Contributing

PRs are welcome, especially for:

- better lint rules
- skill metadata validation
- template improvements
- CI/reporting support

See `CONTRIBUTING.md` for the current workflow.

## License

MIT

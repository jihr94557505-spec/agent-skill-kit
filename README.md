# agent-skill-kit

A tiny CLI to scaffold and lint AI agent skills.

## Why

Building agent skills is still annoyingly manual: create folders, remember `SKILL.md`, write a decent description, add examples, then check whether the skill is actually publishable.

`agent-skill-kit` gives you a simple starting point:

- `init` — generate a new skill folder
- `lint` — validate the skill structure and content quality
- `checklist` — print a release checklist before publishing

## MVP goals

- Fast local scaffolding
- Opinionated but readable `SKILL.md` template
- Useful lint output, not vague errors
- Zero dependencies for the first release

## Install

```bash
npm install
npm link
```

## Usage

### Create a skill

```bash
askit init my-skill
```

### Lint a skill folder

```bash
askit lint ./my-skill
```

### Show release checklist

```bash
askit checklist
```

## Example output

```bash
$ askit lint ./my-skill
✔ Found SKILL.md
✔ Description exists
✔ Contains usage section
⚠ Missing examples section
```

## Roadmap

- [x] CLI scaffold
- [x] Basic lint rules
- [x] Publish checklist
- [ ] Config file support
- [ ] Batch linting for multi-skill repos
- [ ] README generation
- [ ] GitHub Action for skill linting

## Who it's for

- People building reusable AI agent skills
- Teams maintaining internal skill libraries
- Anyone who wants a cleaner workflow than copying random folders around

## License

MIT

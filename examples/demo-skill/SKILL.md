---
name: demo-skill
description: A realistic example skill showing how to document triggers, prerequisites, usage, and troubleshooting for an agent capability.
---

# Demo Skill

## When to Use

Use this skill when an agent needs a clean example of a well-structured skill document. It is meant for testing scaffolds, lint rules, and contributor guidance in repositories that maintain reusable agent skills.

## Prerequisites

- A repository that stores skills as folders
- A maintainer who wants a repeatable documentation standard
- Optional: helper scripts inside `scripts/` for real automation flows

## Usage

### Basic Usage

Read this file as a reference for the minimum level of detail a reusable skill should have. The document should explain when the skill triggers, what it depends on, and how someone can safely use or extend it.

```bash
askit lint ./examples/demo-skill
```

### Extended Usage

Use this example as a seed when writing internal team skills. Replace the placeholder behavior with specific workflows, commands, examples, and failure cases that match the actual task the skill handles.

## Examples

### Example 1

A team maintaining ten internal skills can use this as a baseline format and then run lint checks in CI before merging changes.

### Example 2

A contributor can scaffold a new skill, compare the generated result with this file, and then fill in sections with real commands and examples.

## Troubleshooting

If lint complains that a section is thin, expand it with concrete details rather than filler. If the skill references `scripts/`, make sure the corresponding helper files actually exist so contributors are not sent on a scavenger hunt.

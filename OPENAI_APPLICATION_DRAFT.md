# OpenAI Codex for Open Source application draft

Project: `agent-skill-kit`
Repo: https://github.com/jihr94557505-spec/agent-skill-kit

## 1) What does your project do?

`agent-skill-kit` is an open-source CLI for scaffolding, linting, and standardizing AI agent skills. It helps maintainers create reusable skill folders with a predictable structure, validate documentation quality, and scan multi-skill repositories for consistency problems.

Today the project already supports:
- skill scaffolding
- single-skill linting
- repo-wide linting
- quality scoring and warnings
- JSON output for automation/CI
- repo-level configuration

The goal is to improve the quality and maintainability of open-source agent skill ecosystems.

## 2) Why is this project useful to the open-source community?

A lot of open-source AI tooling is focused on models, frameworks, and inference, but reusable agent capabilities also need infrastructure. In practice, skill repositories often become inconsistent very quickly: weak metadata, missing examples, thin documentation, and unclear prerequisites.

`agent-skill-kit` addresses that maintenance gap. It gives contributors a better default starting point and gives maintainers a lightweight quality gate they can use locally or in CI. That lowers the barrier to publishing higher-quality skills and makes larger skill collections easier to review and reuse.

## 3) How would OpenAI support help?

OpenAI support would help accelerate the next stage of the project:
- semantic evaluation of weak or vague skill descriptions
- automatic suggestions for missing examples and prerequisites
- repo-wide quality summarization for large skill collections
- autofix suggestions for common documentation problems
- stronger CI integrations and quality reporting workflows

API credits would let me build and test these higher-value features faster, especially the parts that benefit from model-based analysis rather than simple rule checks.

## 4) What are you planning to build next?

Planned next steps include:
- markdown report export for repo-wide lint runs
- autofix support for common documentation gaps
- better frontmatter parsing and validation
- GitHub Action annotations
- stricter validation for examples and usage sections

## 5) Why are you the right maintainer for this?

I am actively building in the agent tooling space and created this project to solve a real workflow problem: skill authoring and maintenance is still too manual and inconsistent. I already shipped the first public version with working CLI functionality, public source code, release history, and a clear roadmap. I plan to keep iterating on it as a practical tool for open-source agent ecosystems.

## Short version / 2-3 sentence summary

`agent-skill-kit` is an open-source CLI that helps developers scaffold, lint, and standardize AI agent skills. It improves documentation quality and maintainability for skill repositories, and I want to use OpenAI support to add semantic linting, better reporting, and higher-leverage maintainer workflows.

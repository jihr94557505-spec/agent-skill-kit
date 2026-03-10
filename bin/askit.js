#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [, , command, targetArg] = process.argv;

function log(message) {
  console.log(message);
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function exists(p) {
  return fs.existsSync(p);
}

function readFileSafe(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeFileSafe(p, content) {
  fs.writeFileSync(p, content, 'utf8');
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

function toTitle(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveTemplatePath() {
  const local = path.resolve(process.cwd(), 'templates/skill/SKILL.md.tpl');
  const bundled = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../templates/skill/SKILL.md.tpl');
  if (exists(local)) return local;
  if (exists(bundled)) return bundled;
  return null;
}

function getTemplate() {
  const templatePath = resolveTemplatePath();
  const fallbackTemplate = `---\nname: {{name}}\ndescription: A short description of what this skill does and when to use it.\n---\n\n# {{title}}\n\n## When to Use\n\nDescribe when this skill should be triggered.\n\n## Prerequisites\n\nList required tools or accounts.\n\n## Usage\n\n### Basic Usage\n\nExplain the workflow.\n\n## Examples\n\n### Example 1\n\nAdd a concrete example.\n\n## Troubleshooting\n\nDocument common failure cases and fixes.\n`;
  return templatePath ? readFileSafe(templatePath) : fallbackTemplate;
}

function initSkill(name) {
  if (!name) fail('Please provide a skill folder name. Example: askit init my-skill');
  const root = path.resolve(process.cwd(), name);
  if (exists(root)) fail(`Target already exists: ${root}`);

  mkdirp(root);
  mkdirp(path.join(root, 'scripts'));
  mkdirp(path.join(root, 'references'));
  mkdirp(path.join(root, 'assets'));

  const skillMd = render(getTemplate(), {
    name,
    title: toTitle(name),
    description: `Describe what ${name} does and when to use it.`
  });

  writeFileSafe(path.join(root, 'SKILL.md'), skillMd);
  writeFileSafe(path.join(root, 'README.md'), generateReadme(name));

  log(`✔ Created skill scaffold at ${root}`);
  log('Next: edit SKILL.md, then run askit lint <folder>');
}

function analyzeSkill(root) {
  const skillPath = path.join(root, 'SKILL.md');
  const result = { root, issues: [], passes: [] };

  if (!exists(root)) {
    result.issues.push(`Path not found: ${root}`);
    return result;
  }

  if (!exists(skillPath)) {
    result.issues.push('Missing SKILL.md');
    return result;
  }

  result.passes.push('Found SKILL.md');
  const content = readFileSafe(skillPath);

  if (/^---[\s\S]*name:\s*.+[\s\S]*---/i.test(content)) {
    result.passes.push('Name exists in frontmatter');
  } else {
    result.issues.push('Missing frontmatter name');
  }

  if (/description:\s*.+/i.test(content)) {
    result.passes.push('Description exists');
  } else {
    result.issues.push('Missing frontmatter description');
  }

  if (/##\s+When to Use/i.test(content)) {
    result.passes.push('Contains When to Use section');
  } else {
    result.issues.push('Missing "When to Use" section');
  }

  if (/##\s+Prerequisites/i.test(content)) {
    result.passes.push('Contains Prerequisites section');
  } else {
    result.issues.push('Missing "Prerequisites" section');
  }

  if (/##\s+Usage/i.test(content)) {
    result.passes.push('Contains Usage section');
  } else {
    result.issues.push('Missing "Usage" section');
  }

  if (/##\s+Examples/i.test(content)) {
    result.passes.push('Contains Examples section');
  } else {
    result.issues.push('Missing "Examples" section');
  }

  if (/##\s+Troubleshooting/i.test(content)) {
    result.passes.push('Contains Troubleshooting section');
  } else {
    result.issues.push('Missing "Troubleshooting" section');
  }

  if (content.length >= 300) {
    result.passes.push('Skill doc has non-trivial content');
  } else {
    result.issues.push('SKILL.md is too short to be useful');
  }

  return result;
}

function printLintResult(result) {
  log(`\n# ${path.basename(result.root)}`);
  for (const pass of result.passes) log(`✔ ${pass}`);
  for (const issue of result.issues) log(`⚠ ${issue}`);
}

function lintSkill(target = '.') {
  const result = analyzeSkill(path.resolve(process.cwd(), target));
  printLintResult(result);
  if (result.issues.length === 0) {
    log('✔ Lint passed');
    return;
  }
  process.exitCode = 1;
}

function findSkillDirs(root) {
  const found = [];
  const visited = new Set();

  function walk(dir) {
    const resolved = path.resolve(dir);
    if (visited.has(resolved)) return;
    visited.add(resolved);

    if (!exists(resolved)) return;
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    const hasSkill = entries.some(entry => entry.isFile() && entry.name === 'SKILL.md');
    if (hasSkill) {
      found.push(resolved);
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      walk(path.join(resolved, entry.name));
    }
  }

  walk(root);
  return found.sort();
}

function lintAll(target = '.') {
  const root = path.resolve(process.cwd(), target);
  const dirs = findSkillDirs(root);
  if (dirs.length === 0) fail(`No skill directories found under ${root}`);

  let failed = 0;
  for (const dir of dirs) {
    const result = analyzeSkill(dir);
    printLintResult(result);
    if (result.issues.length > 0) failed += 1;
  }

  log(`\nScanned ${dirs.length} skill folder(s). Failed: ${failed}.`);
  if (failed > 0) process.exitCode = 1;
}

function generateReadme(name = path.basename(process.cwd())) {
  return `# ${name}\n\nShort summary: explain what this skill does in one sentence.\n\n## What it does\n\n- Problem it solves\n- Who it helps\n- Why it exists\n\n## Files\n\n- \`SKILL.md\` — skill definition\n- \`scripts/\` — optional helper scripts\n- \`references/\` — docs and references\n- \`assets/\` — optional media and assets\n\n## Development\n\nEdit \`SKILL.md\`, then run:\n\n\`\`\`bash\naskit lint .\n\`\`\`\n\n## License\n\nMIT\n`;
}

function readme(target = '.') {
  const root = path.resolve(process.cwd(), target);
  if (!exists(root)) fail(`Path not found: ${root}`);
  const output = path.join(root, 'README.md');
  writeFileSafe(output, generateReadme(path.basename(root)));
  log(`✔ Wrote ${output}`);
}

function checklist() {
  const items = [
    'SKILL.md has clear name and description',
    'Usage flow is concrete, not hand-wavy',
    'At least one real example exists',
    'Prerequisites are documented',
    'Troubleshooting section covers likely failure cases',
    'Any helper scripts are included',
    'README explains value in plain language',
    'License is present',
    'Repo is ready for public readers'
  ];

  log('Release checklist:');
  for (const item of items) log(`- ${item}`);
}

switch (command) {
  case 'init':
    initSkill(targetArg);
    break;
  case 'lint':
    lintSkill(targetArg);
    break;
  case 'lint-all':
    lintAll(targetArg);
    break;
  case 'readme':
    readme(targetArg);
    break;
  case 'checklist':
    checklist();
    break;
  default:
    log('agent-skill-kit');
    log('Usage:');
    log('  askit init <name>');
    log('  askit lint [path]');
    log('  askit lint-all [path]');
    log('  askit readme [path]');
    log('  askit checklist');
}

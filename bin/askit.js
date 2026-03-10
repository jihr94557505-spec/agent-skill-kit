#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const command = args[0];
const positionals = [];
const flags = new Map();

for (let i = 1; i < args.length; i += 1) {
  const arg = args[i];
  if (arg.startsWith('--')) {
    const [key, inlineValue] = arg.split('=');
    if (inlineValue !== undefined) {
      flags.set(key, inlineValue);
      continue;
    }
    const next = args[i + 1];
    if (next && !next.startsWith('--')) {
      flags.set(key, next);
      i += 1;
    } else {
      flags.set(key, 'true');
    }
  } else {
    positionals.push(arg);
  }
}

const targetArg = positionals[0];
const jsonMode = flags.get('--json') === 'true';

function log(message) {
  console.log(message);
}

function outputJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

function fail(message, extra = {}) {
  if (jsonMode) {
    outputJson({ ok: false, error: message, ...extra });
  } else {
    console.error(`✖ ${message}`);
  }
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

function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readRepoConfig(cwd) {
  const configPath = path.join(cwd, 'askit.config.json');
  if (!exists(configPath)) return {};
  try {
    return JSON.parse(readFileSafe(configPath));
  } catch {
    return {};
  }
}

function getLintConfig(cwd) {
  const config = readRepoConfig(cwd);
  return {
    minDescriptionLength: Number(config.minDescriptionLength ?? 24),
    minDocLength: Number(config.minDocLength ?? 300),
    requireReadme: Boolean(config.requireReadme ?? false),
    requireScriptsWhenReferenced: Boolean(config.requireScriptsWhenReferenced ?? true)
  };
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
  const fallbackTemplate = `---\nname: {{name}}\ndescription: A short description of what this skill does and when to use it.\n---\n\n# {{title}}\n\n## When to Use\n\nDescribe when this skill should be triggered.\n\n## Prerequisites\n\nList required tools or accounts.\n\n## Usage\n\n### Basic Usage\n\nExplain the workflow.\n\n## Examples\n\n### Example 1\n\nAdd a concrete example with real inputs and outputs.\n\n## Troubleshooting\n\nDocument common failure cases and fixes.\n`;
  return templatePath ? readFileSafe(templatePath) : fallbackTemplate;
}

function generateReadme(name = path.basename(process.cwd())) {
  return `# ${name}\n\nShort summary: explain what this skill does in one sentence.\n\n## What it does\n\n- Problem it solves\n- Who it helps\n- Why it exists\n\n## Files\n\n- \`SKILL.md\` — skill definition\n- \`scripts/\` — optional helper scripts\n- \`references/\` — docs and references\n- \`assets/\` — optional media and assets\n\n## Development\n\nEdit \`SKILL.md\`, then run:\n\n\`\`\`bash\naskit lint .\n\`\`\`\n\n## License\n\nMIT\n`;
}

function initSkill(name) {
  if (!name) fail('Please provide a skill folder name. Example: askit init my-skill');
  const normalizedName = slugify(name);
  if (!normalizedName) fail('Skill name must contain letters or numbers');
  const root = path.resolve(process.cwd(), normalizedName);
  if (exists(root)) fail(`Target already exists: ${root}`);

  mkdirp(root);
  mkdirp(path.join(root, 'scripts'));
  mkdirp(path.join(root, 'references'));
  mkdirp(path.join(root, 'assets'));

  const skillMd = render(getTemplate(), {
    name: normalizedName,
    title: toTitle(normalizedName),
    description: `Describe what ${normalizedName} does and when to use it.`
  });

  writeFileSafe(path.join(root, 'SKILL.md'), skillMd);
  writeFileSafe(path.join(root, 'README.md'), generateReadme(normalizedName));

  const result = {
    ok: true,
    command: 'init',
    root,
    created: ['SKILL.md', 'README.md', 'scripts/', 'references/', 'assets/']
  };

  if (jsonMode) {
    outputJson(result);
    return;
  }

  log(`✔ Created skill scaffold at ${root}`);
  log('Next: edit SKILL.md, then run askit lint <folder>');
}

function extractFrontmatterValue(content, key) {
  const match = content.match(new RegExp(`^---[\\s\\S]*?^${key}:\\s*(.+)$[\\s\\S]*?^---`, 'mi'));
  return match ? match[1].trim() : '';
}

function sectionBody(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`##\\s+${escaped}\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i'));
  return match ? match[1].trim() : '';
}

function analyzeSkill(root, config = getLintConfig(process.cwd())) {
  const skillPath = path.join(root, 'SKILL.md');
  const readmePath = path.join(root, 'README.md');
  const scriptsDir = path.join(root, 'scripts');
  const result = { root, issues: [], warnings: [], passes: [], score: 0 };

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
  const name = extractFrontmatterValue(content, 'name');
  const description = extractFrontmatterValue(content, 'description');

  if (name) {
    result.passes.push('Name exists in frontmatter');
  } else {
    result.issues.push('Missing frontmatter name');
  }

  if (description) {
    result.passes.push('Description exists');
    if (description.length < config.minDescriptionLength) {
      result.warnings.push(`Description is short (${description.length} chars). Aim for at least ${config.minDescriptionLength}.`);
    } else {
      result.passes.push('Description has useful length');
    }
  } else {
    result.issues.push('Missing frontmatter description');
  }

  const requiredSections = ['When to Use', 'Prerequisites', 'Usage', 'Examples', 'Troubleshooting'];
  for (const heading of requiredSections) {
    const body = sectionBody(content, heading);
    if (body) {
      result.passes.push(`Contains ${heading} section`);
      if (body.length < 30) {
        result.warnings.push(`${heading} section looks very thin`);
      }
    } else {
      result.issues.push(`Missing "${heading}" section`);
    }
  }

  if (content.length >= config.minDocLength) {
    result.passes.push('Skill doc has non-trivial content');
  } else {
    result.issues.push(`SKILL.md is too short to be useful (min ${config.minDocLength} chars)`);
  }

  if (/```(?:bash|sh|json|yaml|yml|python|js)?/i.test(content)) {
    result.passes.push('Contains at least one code block example');
  } else {
    result.warnings.push('No code block example found');
  }

  if (/TODO|TBD|FIXME/i.test(content)) {
    result.warnings.push('Contains placeholder text like TODO/TBD/FIXME');
  }

  if (/scripts\//i.test(content) && config.requireScriptsWhenReferenced) {
    if (exists(scriptsDir) && fs.readdirSync(scriptsDir).length > 0) {
      result.passes.push('Referenced scripts/ and helper files exist');
    } else {
      result.warnings.push('SKILL.md references scripts/ but scripts/ is empty');
    }
  }

  if (config.requireReadme) {
    if (exists(readmePath)) {
      result.passes.push('README.md exists');
    } else {
      result.issues.push('README.md is required by config but missing');
    }
  } else if (exists(readmePath)) {
    result.passes.push('README.md exists');
  }

  const passWeight = result.passes.length;
  const warningPenalty = result.warnings.length * 0.5;
  const issuePenalty = result.issues.length * 2;
  result.score = Math.max(0, Math.round((passWeight - warningPenalty - issuePenalty) * 10));

  return result;
}

function printLintResult(result) {
  log(`\n# ${path.basename(result.root)}`);
  for (const pass of result.passes) log(`✔ ${pass}`);
  for (const warning of result.warnings) log(`⚠ ${warning}`);
  for (const issue of result.issues) log(`✖ ${issue}`);
  log(`Score: ${result.score}`);
}

function lintSkill(target = '.') {
  const result = analyzeSkill(path.resolve(process.cwd(), target));
  if (jsonMode) {
    outputJson({ ok: result.issues.length === 0, command: 'lint', result });
    if (result.issues.length > 0) process.exitCode = 1;
    return;
  }
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

  const results = [];
  let failed = 0;
  for (const dir of dirs) {
    const result = analyzeSkill(dir);
    results.push(result);
    if (!jsonMode) printLintResult(result);
    if (result.issues.length > 0) failed += 1;
  }

  const summary = {
    ok: failed === 0,
    command: 'lint-all',
    scanned: dirs.length,
    failed,
    averageScore: Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length),
    results
  };

  if (jsonMode) {
    outputJson(summary);
  } else {
    log(`\nScanned ${dirs.length} skill folder(s). Failed: ${failed}. Avg score: ${summary.averageScore}.`);
  }

  if (failed > 0) process.exitCode = 1;
}

function readme(target = '.') {
  const root = path.resolve(process.cwd(), target);
  if (!exists(root)) fail(`Path not found: ${root}`);
  const output = path.join(root, 'README.md');
  writeFileSafe(output, generateReadme(path.basename(root)));
  const result = { ok: true, command: 'readme', output };
  if (jsonMode) {
    outputJson(result);
    return;
  }
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

  if (jsonMode) {
    outputJson({ ok: true, command: 'checklist', items });
    return;
  }

  log('Release checklist:');
  for (const item of items) log(`- ${item}`);
}

function initConfig() {
  const output = path.resolve(process.cwd(), 'askit.config.json');
  if (exists(output)) fail(`Config already exists: ${output}`);
  const config = {
    minDescriptionLength: 24,
    minDocLength: 300,
    requireReadme: false,
    requireScriptsWhenReferenced: true
  };
  writeFileSafe(output, `${JSON.stringify(config, null, 2)}\n`);
  if (jsonMode) {
    outputJson({ ok: true, command: 'init-config', output, config });
    return;
  }
  log(`✔ Wrote ${output}`);
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
  case 'init-config':
    initConfig();
    break;
  default:
    log('agent-skill-kit');
    log('Usage:');
    log('  askit init <name>');
    log('  askit lint [path] [--json]');
    log('  askit lint-all [path] [--json]');
    log('  askit readme [path] [--json]');
    log('  askit checklist [--json]');
    log('  askit init-config [--json]');
}

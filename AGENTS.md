# Agent Instructions

## Agent skills

### Issue tracker

Issues and PRDs are tracked as local markdown under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The default five-label vocabulary is used. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain-doc layout. See `docs/agents/domain.md`.

### Skills

Skill definitions live in `.agents/skills/`. When the user invokes a skill by name (e.g. "use the commit skill", "run triage"), read the corresponding `.agents/skills/<name>/SKILL.md` and follow its instructions.

### Reference checkout

The original Python twikit repo may be cloned at `.reference/twikit/`. It is ignored by git and is for behavioral reference only; do not copy source from it.

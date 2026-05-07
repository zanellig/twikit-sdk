# Domain Docs

This repo currently uses a single-context domain-doc layout.

## Layout

- Global project context: `CONTEXT.md` at the repo root, when present.
- Architectural decisions: `docs/adr/`, when present.
- Local issue tracker and PRDs: `.scratch/`.

## Consumer Rules

- Read `CONTEXT.md` before doing architecture-heavy work when it exists.
- Read relevant ADRs before changing decisions captured there.
- If `CONTEXT.md` or ADRs are absent, infer cautiously from the codebase and current PRDs.

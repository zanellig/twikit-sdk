---
name: bump
description: Create and push version tags for this package. Use when adding missing version tags or when the user asks to tag a commit.
---

# Version Tags

Use semver tags named `vX.Y.Z`.

## Flow

1. Confirm clean intent:
   - Check `package.json` version. Update if needed.
   - Check existing tags with `git tag --list --sort=version:refname`.
   - Do not move an existing tag unless the user explicitly asks.
2. Create a bump commit:
   - `git add package.json`
   - `git commit -m "chore: bump to vX.Y.Z"`
3. Create the tag:
   - Current commit: `git tag vX.Y.Z`
   - Specific commit: `git tag vX.Y.Z <sha>`
4. Push the tag:
   - One tag: `git push origin vX.Y.Z`
   - Multiple tags: `git push origin vA.B.C vX.Y.Z`

Pushing a tag alone does not publish to npm.

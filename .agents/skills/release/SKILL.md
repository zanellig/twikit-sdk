---
name: release
description: Create GitHub Releases for this package and understand the npm publish workflow. Use when publishing a new npm version or when the user asks to create a release.
---

# GitHub Releases

This repo publishes to npm when a GitHub Release is created for a tag named `vX.Y.Z`.

## Flow

1. Confirm the tag exists locally and remotely:
   - `git tag --list --sort=version:refname`
   - `git ls-remote --tags origin`
2. Create a GitHub Release for `vX.Y.Z`.
3. Verify the `Publish to npm` action runs.

## What Happens

`.github/workflows/publish.yml` runs on `release.created`. It checks out the release tag, then:

- strips the `v`
- validates semver
- runs `npm version X.Y.Z --no-git-tag-version --allow-same-version`
- runs `pnpm typecheck` and `pnpm test`
- publishes to npm through Trusted Publishing

The workflow uses GitHub OIDC and does not require an npm token. It requires npm Trusted Publisher configuration for this repo and workflow.

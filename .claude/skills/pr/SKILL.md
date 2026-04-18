---
name: pr
description: Push current branch and open a PR targeting develop with Summary, Changes, and Test Plan
argument-hint: "[optional PR title hint]"
allowed-tools: Bash(git status), Bash(git log*), Bash(git diff*), Bash(git push*), Bash(git branch*), Bash(gh pr*)
---

You are creating a GitHub pull request for this project. Follow these steps precisely:

## 1. Gather context

Run in parallel:
- `git status` — confirm no uncommitted changes (warn user if there are any)
- `git branch --show-current` — current branch name
- `git log --oneline develop..HEAD` — commits that will be in this PR
- `git diff develop...HEAD` — full diff against the base branch

## 2. Push the branch

```
git push -u origin <current-branch>
```

## 3. Draft the PR

**Title:** Conventional Commits format, same rules as /commit — describe the feature, not the files. Max 70 chars.

**Body** — use this exact template:

```markdown
## Summary

- <bullet: what this PR adds/fixes at a user-visible level>
- <bullet: key design decision or constraint worth knowing>
- <bullet: anything non-obvious about the implementation>

## Changes

| File | Description |
|------|-------------|
| `path/to/file.ts` | What this file does in the context of this PR |
| ... | ... |

## Test Plan

- [ ] <manual step to verify the happy path>
- [ ] <edge case or auth check>
- [ ] <regression: existing feature that could break>
- [ ] `pnpm typecheck && pnpm lint` pass cleanly
```

Rules:
- Summary: 2–4 bullets, user/product level — not implementation details
- Changes table: every non-trivial file touched; group by layer if many files
- Test Plan: concrete, actionable steps — not vague "test it works"
- Include an auth/role check step if any API routes are involved
- Include a CI check step always

## 4. Create the PR

```
gh pr create --base develop --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Return the PR URL to the user.

If $ARGUMENTS was provided, treat it as a hint for the PR title or scope.

---
name: commit
description: Stage feature changes and commit with a Conventional Commits message that describes the feature
argument-hint: "[optional scope or hint]"
allowed-tools: Bash(git status), Bash(git diff*), Bash(git log*), Bash(git add*), Bash(git commit*), Bash(pnpm typecheck*), Bash(pnpm lint*), Bash(pnpm format:check*), Bash(pnpm format*)
---

You are creating a git commit for this project. Follow these steps precisely:

## 1. Understand the changes

Run these in parallel:
- `git status` — see what's staged and unstaged
- `git diff HEAD` — full diff of all changes
- `git log --oneline -5` — recent commit style to match tone

## 2. Quality gate

Run `pnpm format:check` first. If it fails, run `pnpm format` to fix, then re-check.
Then run `pnpm typecheck && pnpm lint`. If either fails, report the errors to the user and stop — do NOT commit broken code.

## 3. Select files to stage

Stage only files relevant to the feature or fix being committed. Do NOT stage:
- Unrelated `.gitignore` edits
- Leftover debug files
- Unrelated config changes

Use `git add <specific files>` — never `git add -A` or `git add .`.

## 4. Write the commit message

Follow **Conventional Commits** format:

```
<type>(<scope>): <short imperative description>

<optional body: why, not what — only if non-obvious>
```

**Types:** `feat` | `fix` | `refactor` | `chore` | `docs` | `test` | `perf`

Rules:
- The subject line must describe **what the feature does**, not which files changed
- Max 72 characters on the subject line
- Use imperative mood: "add analytics dashboard" not "added" or "adds"
- Scope = the affected area, e.g. `analytics`, `auth`, `batch`, `delivery`
- Body only when motivation is non-obvious

Good examples:
- `feat(analytics): add admin order analytics dashboard with pharmacy breakdown`
- `fix(delivery): prevent double OTP submission on network retry`
- `chore(db): export new analytics query helper`

## 5. Commit

```
git commit -F - <<'MSG'
<your message here>
MSG
```

After committing, show the user the commit hash and subject line.
If $ARGUMENTS was provided, treat it as a hint about the scope or feature name.

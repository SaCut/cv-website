---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name: cv-website-agent
description: agent to work on the cv-website repo
---

# cv-website-agent

## ! Git Operations

NEVER run git commit, git push, git add, or ANY git command that modifies repository state.

User handles ALL git operations.

## ! Problem Solving

SOLVE THE ROOT CAUSE. NOT PATCHES.

Fix underlying problems, not symptoms. No workarounds, wrappers, or plasters on top.

## ! Document Editing

EDIT what exists. DO NOT ADD lines.

- Reorganise = move/condense existing content
- Restructure = reorder what's there
- Improve = clarify, not expand

Default: edit over add. Only add when genuinely required.

Avoid: summaries, appendices, TOCs, expanding sentences, "helpful" bloat.

## Communication Style

- No emojis in any output, code, comments, scripts, or documentation
- ANSI colour codes in shell scripts and terminal output are fine
- Keep responses concise and direct

## Code Style

**Naming:** Short but expressive. Avoid cryptic abbreviations.

**Comments:** Purposeful only - clarify intent/invariants, not obvious code.

**Imports:** After JSDoc headers, ordered by descending line length.

**Vertical spacing:**
- Blank line before/after `return`, `await`, `break`, `continue` BLOCKS (entire unit including callbacks)
- Exception: not after function opening or before closing
- Comments are part of their block
- Consecutive statements = one block
- Blank line before `if`, `for`, `while`, `switch` (except after function declaration)
- Group related variable declarations, blank line after block before next step

**Lines:** ~100 chars max, no trailing whitespace. Prefer early returns over nesting.

**Symbols:** Monochrome unicode only {✓, ✗, !, →, ...}, no colored emojis.

## Code Quality

- Remove redundant data structure rebuilding; accept parameters directly
- Cache API results to avoid duplicate calls
- Use synchronous operations for critical workflows (e.g., resource cleanup)
- Add verification steps for operations where failure must be detected

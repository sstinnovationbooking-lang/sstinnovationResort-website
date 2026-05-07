# New Chat Bootstrap

Use this message when starting a new chat so context stays consistent:

```text
Continue from this repository context.
Primary goal: finish WEBSITE UI first (not backend feature expansion).
Use docs/PROJECT-CONTEXT.md and docs/UI-BACKLOG.md as source of truth.
Preserve multi-tenant identity contract (tenantSlug, ownerId, resortId and BFF headers).
Before major edits, summarize what will be changed and keep design direction consistent.
```

## Rule
- Update `docs/PROJECT-CONTEXT.md` and `docs/UI-BACKLOG.md` whenever scope changes.
- Do not start a new direction without recording the decision in these files.


# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

- GitHub: use "Report a vulnerability" under this repository's Security tab
  (Private vulnerability reporting) —
  https://github.com/dkautomation23/n8n-workflow-reliability-kit/security/advisories/new
- Email: hello@dkautomation.dev

Include which workflow is involved, what you expected, what happened
instead, and — if you can share it — the exported JSON with your own
instance details already replaced by placeholders.

We aim to send a first response within 3 business days.

## Supported versions

There are no tagged releases. The workflow exports on the `main` branch at
HEAD are the only supported version — re-import the current files from
`workflows/` before reporting.

## Scope

This repository ships n8n workflow *definitions*, not a service: nothing
here runs, stores, or transmits data on its own. It only does that once you
import it into your own n8n instance. So the questions that matter are
about what the shipped definitions do and don't leak, not about runtime
security of code we don't control.

In scope:

- A committed file under `workflows/` that contains a live credential,
  private endpoint, email address, or chat ID — the thing
  `tests/validate-workflows.mjs` scans for (`secretPatterns`) and should
  have caught before merge. A pattern that gets past that scan is a real
  gap even without a live secret attached.
- A change to `Reliability Kit — Error Intake` or
  `Reliability Kit — Heartbeat Monitor` that makes the alert payload carry
  request headers, user data, or credential values — the README's
  "Alert payload contract" and `docs/architecture.md` are explicit that it
  must not.
- Documentation that instructs a reader to paste a live API key, webhook
  URL, or other secret into a workflow export, an issue, or a commit,
  rather than into an n8n variable as the README describes.

Out of scope:

- The security of your own n8n instance, its credential store, network, or
  reverse proxy. This kit never sees them.
- The behavior or security of whatever endpoint you point
  `RELIABILITY_ALERT_WEBHOOK_URL` at.
- Infrastructure-level monitoring — the n8n database, queues, containers.
  `docs/architecture.md` lists this as a deliberate boundary of the kit,
  not a gap in it.

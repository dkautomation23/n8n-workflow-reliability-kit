# n8n Workflow Reliability Kit

[![CI](https://github.com/dkautomation23/n8n-workflow-reliability-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/dkautomation23/n8n-workflow-reliability-kit/actions/workflows/ci.yml)

Three importable n8n workflows for automations that already run in production:
see a failure the moment it happens, catch the workflow that quietly stopped
running, and prove the alert route works before you need it.

This is not a template library. It is the reliability layer that production n8n
instances are usually missing.

## What's inside

| Workflow | Problem it solves | When you need it |
| --- | --- | --- |
| `01-error-intake.json` | Normalises the context of a failure and sends it to an alert endpoint | Any workflow exposed to an external API, dependency or credential failure |
| `02-heartbeat-monitor.json` | Finds workflows with no successful run inside a given window | Schedule/webhook processes where silence is the dangerous failure |
| `03-reliability-smoke-test.json` | Produces one controlled failure on demand | While setting the alert route up, and after every change to it |

Each workflow imports on its own. The exports carry no credentials, private
endpoints, email addresses or chat IDs — that is enforced in CI by
`tests/validate-workflows.mjs`.

## Quick start

1. Import every JSON file from `workflows/` into n8n.
2. Create the n8n variables listed below. You create and enter the secret values
   yourself; nothing in this repository contains them.
3. Open `Reliability Kit — Error Intake`, save it, and select it as the
   **Error Workflow** in the settings of each workflow that should report failures.
4. Configure `Reliability Kit — Heartbeat Monitor`: list the IDs of the critical
   workflows, save, and activate it.
5. Run `Reliability Kit — Smoke Test` manually. Exactly one alert carrying a
   controlled error should arrive at the endpoint.

If the smoke test produces no alert, do not activate the heartbeat yet — fix the
delivery route first, using the [troubleshooting guide](docs/troubleshooting.md).

## Configuration

| n8n variable | Example format | What it is for |
| --- | --- | --- |
| `RELIABILITY_ALERT_WEBHOOK_URL` | `https://<your-alert-endpoint>` | Receives the alert as a JSON POST. An internal relay or the gateway of whichever channel you use. |
| `RELIABILITY_N8N_BASE_URL` | `https://<your-n8n-host>` | Base address of the same n8n instance, used by the Heartbeat Monitor. |
| `RELIABILITY_N8N_API_KEY` | `<create-in-n8n-settings>` | n8n Public API key with the minimum access needed to read executions. |
| `RELIABILITY_STALE_AFTER_MINUTES` | `60` | How long after its last successful run a workflow counts as silent. |
| `RELIABILITY_MONITORED_WORKFLOW_IDS` | `12,34,56` | Comma-separated IDs of the workflows worth alerting on. |

Never write the real values into a JSON export, the README, an issue or a commit.
Variables are what keeps instance configuration out of a portable workflow.

## Alert payload contract

Error Intake always sends the same JSON shape:

```json
{
  "event": "n8n.execution.failed",
  "severity": "error",
  "detectedAt": "ISO-8601 timestamp",
  "workflow": { "id": "workflow id", "name": "workflow name" },
  "execution": { "id": "execution id", "url": "execution link", "lastNodeExecuted": "node name" },
  "error": { "message": "error message", "stack": "stack or null" },
  "runbook": "first diagnostic action"
}
```

The heartbeat sends one aggregated payload, and only when it actually found a
stale workflow. With nothing wrong it stays silent rather than producing noise.

The full schema and the boundaries of what this kit covers are in
[architecture](docs/architecture.md).

## Production checklist

Work through the [deployment checklist](docs/deployment-checklist.md) before
activating anything. The minimum bar:

- [ ] The smoke test produces exactly one readable alert.
- [ ] The alert names the workflow, the execution and the last node that ran.
- [ ] Every critical automation has an owner and an expected run frequency.
- [ ] The stale threshold is at least twice the workflow's normal interval.
- [ ] The alert payload contains no user data, headers or credential values.

## Deliberately not included

There are no Slack, Telegram or PagerDuty adapters. A generic webhook keeps the
kit independent of any one vendor: swap the transport layer and every team and
client still gets the same diagnostic contract.

The kit also does not replace infrastructure monitoring, n8n backups or an
incident response process. It covers the application layer of workflow
reliability, and nothing beyond it.

## License

MIT. Use it, adapt it, improve it — but always check the configuration against
your own instance before importing.

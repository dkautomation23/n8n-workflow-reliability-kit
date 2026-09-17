# Production deployment checklist

## Before importing

- [ ] The exports have been tried in a separate test/staging instance.
- [ ] Only genuinely critical workflows are listed in `RELIABILITY_MONITORED_WORKFLOW_IDS`.
- [ ] The expected frequency of successful runs is written down for each of them.
- [ ] A dedicated alert endpoint exists, and it does not publish execution payloads into a public channel.

## Setting the variables

- [ ] `RELIABILITY_ALERT_WEBHOOK_URL` points at the team's endpoint.
- [ ] `RELIABILITY_N8N_BASE_URL` matches the current instance and carries no path to a specific workflow.
- [ ] `RELIABILITY_N8N_API_KEY` was created separately and is stored only inside n8n.
- [ ] `RELIABILITY_STALE_AFTER_MINUTES` is at least twice the workflow's normal interval.
- [ ] `RELIABILITY_MONITORED_WORKFLOW_IDS` contains nothing but comma-separated numeric IDs.

## Acceptance

- [ ] `Error Intake` is saved and selected as the error workflow of every critical process.
- [ ] `Smoke Test` has been run manually and produced one alert carrying execution context.
- [ ] The recipient can open the execution and name the last node that ran, without searching for it.
- [ ] A normal run produces no heartbeat alert.
- [ ] An artificially stale ID produces exactly one aggregated heartbeat alert.

## After activation

- [ ] An owner is assigned to respond to alerts.
- [ ] The window in which an alert is expected, or ignored, is agreed.
- [ ] Running the smoke test is part of the procedure for changing the alert route.
- [ ] The monitored list and the stale thresholds are reviewed every quarter.

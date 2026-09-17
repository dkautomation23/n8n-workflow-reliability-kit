# Troubleshooting

| Symptom | Likely cause | Check this first |
| --- | --- | --- |
| Smoke test failed and no alert arrived | `Error Intake` is not selected as the error workflow, or the endpoint is missing | Open the settings of Smoke Test and Error Intake; confirm `RELIABILITY_ALERT_WEBHOOK_URL` is set. |
| The alert has no `workflow` or `execution` | The error was raised manually, without the standard context | Open the Error Intake execution and compare the incoming item against the contract in the README. |
| Heartbeat fails before the API call | One of the `RELIABILITY_` variables is empty | Read the message from the `Validate Reliability Variables` node — it lists exactly which values are missing. |
| Heartbeat alerts every single time | Threshold too low, wrong workflow ID, or the workflow produces no successful executions | Compare the ID against the last successful execution, then raise `RELIABILITY_STALE_AFTER_MINUTES`. |
| Heartbeat never alerts on a workflow that is clearly stuck | The workflow is not in the monitored list, or the API returned a truncated history | Check `RELIABILITY_MONITORED_WORKFLOW_IDS`, then raise the limit or split monitoring into groups. |
| The alert arrives twice | One workflow both reports failures itself and uses Error Intake | Keep a single source of production alerts per event type. |

## Diagnostic rule

Do not start by re-running it. Establish three facts first: what the input was,
which node the execution stopped at, and whether the external dependency is
reachable. A retry without a reason is how you get duplicate messages, double
charges and half-written data.

# Reliability Kit architecture

## Principle

Watching the workflows is kept separate from delivering the alerts. n8n produces
a stable JSON contract; an external endpoint decides where it goes — a messenger,
an incident system, or an internal log. That keeps the kit independent of any one
vendor and keeps the payload auditable.

```text
Workflow failure
      |
      v
Error Trigger -> Normalize Failure Context -> generic webhook -> alert destination

Every 15 minutes
      |
      v
Public API executions -> stale filter -> generic webhook -> alert destination
```

## Error Intake

`Error Trigger` only receives an event when this workflow is selected as the error
workflow of the production process that failed. `Normalize Failure Context` builds
the payload before anything is sent, so the details of the original failure still
exist even when the alert transport is temporarily unavailable.

The `HTTP Request` node continues on the normal branch after a transport error.
That does not make delivery successful — it stops a second error from masking the
first. Watch the failed executions of Error Intake itself separately.

## Heartbeat Monitor

The monitor does not guess which workflows matter. `RELIABILITY_MONITORED_WORKFLOW_IDS`
is an explicit production contract: it should list only the processes where a
missing successful run is genuinely an incident.

Every 15 minutes it reads successful executions, finds the latest run per ID and
compares it against `RELIABILITY_STALE_AFTER_MINUTES`. Everything found in one
pass is aggregated into a single alert. When nothing is stale, the downstream
nodes receive no items and the endpoint is never called.

## Minimum permissions

The key behind `RELIABILITY_N8N_API_KEY` should belong to the instance owner or a
service account with access to nothing but the API it needs. Do not reuse an admin
key from a personal browser session, do not place it in an export, and do not
paste it into an issue.

## Boundaries

The kit observes the state of specific workflows. It does not check the n8n
database, the queues, the containers or the reverse proxy. Those need
infrastructure monitoring of their own.

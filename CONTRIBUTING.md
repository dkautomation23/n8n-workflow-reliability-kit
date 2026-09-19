# Contributing

This repository has no package.json and no build step — it's n8n workflow
exports plus one validation script. Node.js is only needed to run that
script.

## Setup

Nothing to install. Node.js 20+ is enough to run the validator (CI uses
20).

## Test

    node tests/validate-workflows.mjs

Checks every file listed in `workflows/`:

- it exists and parses as JSON with a non-empty `nodes` array
- node ids and node names are unique, and ids are UUIDs
- every node type is on the allow-list (`allowedNodeTypes`)
- the workflow has the trigger type it's supposed to (`requiredTriggers`)
- the serialized workflow matches none of the secret/live-URL patterns
  (`secretPatterns`) — tokens, private keys, cloud credentials, bare URLs
- `README.md` documents every key in `configurationKeys`

## What CI checks

`.github/workflows/ci.yml` runs the same command on every push to `main`
and on every pull request:

    node tests/validate-workflows.mjs

That is the whole gate — there is no separate build or lint step.

## Adding a new check

A check is a rule inside `tests/validate-workflows.mjs` itself —
`allowedNodeTypes`, `requiredTriggers`, `secretPatterns`, or
`configurationKeys`. There's no fixture suite to add a case to, so prove a
new rule works by hand: point it at a workflow file that should fail it
(a scratch copy with a live-looking URL, an unlisted node type, and so on),
confirm `node tests/validate-workflows.mjs` throws, then confirm it still
passes against the real files in `workflows/`.

## Editing a workflow

Export the workflow from n8n as JSON, overwrite the matching file in
`workflows/`, and run the validator before committing. Replace any instance
URL, credential, chat ID, or email the export captured with the n8n
variable that belongs there (see the Configuration table in README.md) —
the validator's `secretPatterns` check is the backstop, not the first line
of defense.

## Commit messages

One line, sentence case, no trailing period, says what the commit does for
the kit rather than how it does it — for example, from this repo's own
history:

    Run the tests in CI on every push
    Rewrite the documentation in English
    Three reliability workflows for n8n in production

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workflowFiles = [
  'workflows/01-error-intake.json',
  'workflows/02-heartbeat-monitor.json',
  'workflows/03-reliability-smoke-test.json',
];

const allowedNodeTypes = new Set([
  'n8n-nodes-base.errorTrigger',
  'n8n-nodes-base.scheduleTrigger',
  'n8n-nodes-base.manualTrigger',
  'n8n-nodes-base.set',
  'n8n-nodes-base.code',
  'n8n-nodes-base.httpRequest',
  'n8n-nodes-base.stopAndError',
  'n8n-nodes-base.noOp',
]);

const requiredTriggers = new Map([
  ['workflows/01-error-intake.json', 'n8n-nodes-base.errorTrigger'],
  ['workflows/02-heartbeat-monitor.json', 'n8n-nodes-base.scheduleTrigger'],
  ['workflows/03-reliability-smoke-test.json', 'n8n-nodes-base.manualTrigger'],
]);

const secretPatterns = [
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /xoxb-[A-Za-z0-9-]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/,
  /(?:api[_-]?key|token|password)\s*[:=]\s*['\"][^${'\"]{8,}/i,
  /https?:\/\/[^\s'\"]+/i,
];

const configurationKeys = [
  'RELIABILITY_ALERT_WEBHOOK_URL',
  'RELIABILITY_N8N_BASE_URL',
  'RELIABILITY_N8N_API_KEY',
  'RELIABILITY_STALE_AFTER_MINUTES',
  'RELIABILITY_MONITORED_WORKFLOW_IDS',
];

for (const file of workflowFiles) {
  const path = resolve(file);
  if (!existsSync(path)) {
    throw new Error(`Missing workflow export: ${file}`);
  }

  const workflow = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    throw new Error(`Workflow has no nodes: ${file}`);
  }

  const nodeIds = workflow.nodes.map((node) => node.id);
  const nodeNames = workflow.nodes.map((node) => node.name);
  if (new Set(nodeIds).size !== nodeIds.length || new Set(nodeNames).size !== nodeNames.length) {
    throw new Error(`Workflow has duplicate node ids or names: ${file}`);
  }

  for (const node of workflow.nodes) {
    if (!allowedNodeTypes.has(node.type)) {
      throw new Error(`Unsupported node type in ${file}: ${node.type}`);
    }
  }

  if (!nodeIds.every((id) => /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))) {
    throw new Error(`Workflow has a non-UUID node id: ${file}`);
  }

  if (!workflow.nodes.some((node) => node.type === requiredTriggers.get(file))) {
    throw new Error(`Workflow has the wrong trigger: ${file}`);
  }

  const serialized = JSON.stringify(workflow);
  for (const pattern of secretPatterns) {
    if (pattern.test(serialized)) {
      throw new Error(`Workflow contains a possible secret or live URL: ${file}`);
    }
  }
}

const readme = readFileSync(resolve('README.md'), 'utf8');
for (const key of configurationKeys) {
  if (!readme.includes(key)) {
    throw new Error(`README is missing configuration key: ${key}`);
  }
}

console.log(`Validated ${workflowFiles.length} workflow exports`);
console.log('README configuration contract passed');

# Decision — Create Backlink Strategy Agents

## Context
The user requested a backlink strategy and explicitly asked the orchestrator to deploy agents for research and strategy development.

## Decision
Create three persistent UDO agents:
- `backlink-local-researcher.md`
- `backlink-competitor-analyst.md`
- `backlink-assets-strategist.md`

## Rationale
Backlink strategy requires multiple specializations:
- Local/citation opportunity research.
- Competitor/link-pattern analysis.
- Linkable asset and outreach strategy.

This satisfies UDO agent creation requirements and keeps research scopes auditable.

## Constraints
- No product code changes.
- No outreach, purchases, submissions, or account creation without user approval.
- Avoid link spam and paid link schemes.


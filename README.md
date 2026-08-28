# Formation Pilot — V4 Foundation

Formation is a Christian spiritual-formation discernment experience designed to help people notice how they are receiving the love of God, responding to the Spirit, and increasingly becoming like Jesus for the sake of others.

Participant pathways:
- **Formation Assessment** — 56 questions
- **Deeper Discernment** — adaptive, 84–112 questions

Developmental language remains: Emerging → Establishing → Deepening → Sustaining. These are reflective descriptors, not grades or measures of spiritual worth.

## Canonical V4 runtime

- `formation-schema-v4.js` — theological and data contract
- `engine.js` — pure interpretation engine
- `adaptive-long.js` — canonical adaptive long-form controller
- `formation-plan-v4.js` — structured plan generator
- `formation-result-v4.js` — canonical `FormationResult`
- `formation-renderer-v4.js` — profile renderer
- `formation-controller-v4.js` — participant assessment controller
- `pilot-v4.html` — participant application shell

`pilot.html` remains the public compatibility route and redirects into `pilot-v4.html` while preserving query parameters.

See `ARCHITECTURE_V4.md` for the architecture and legacy migration notes.

## Public routes

- Participant experience: `index.html`
- Assessment: `pilot.html?mode=quick` / `pilot.html?mode=deep`
- Post-assessment sample: `sample.html`
- Development suite: `development.html`
- Algorithm simulator and stress tests: `algorithm.html#sim` / `algorithm.html#stress`

## Release hardening

```bash
npm ci
npx playwright install chromium webkit
npm test
npm run check:links
```

The browser suite verifies the canonical V4 assessment flow, adaptive Deeper Discernment, Back/Next state, context capture, the `FormationResult` contract, profile rendering, resources, sharing, mobile overflow and JavaScript errors.

## Validation status

The adaptive v1.1 rules have engineering/sensitivity validation against complete 112-item synthetic profiles. This is not psychometric validation. Real participant data remains required before claiming validated measurement properties.

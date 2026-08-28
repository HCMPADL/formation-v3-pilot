# Formation Pilot — V4.1

Formation is a Christian spiritual-formation discernment experience designed to help people notice how they are receiving the love of God, responding to the Spirit, and increasingly becoming like Jesus for the sake of others.

Participant pathways:
- **Formation Assessment** — 56 questions
- **Deeper Discernment** — adaptive, 84–112 questions

The assessment now deliberately maps every domain through **Practice → Posture → Integration → Fruit**. Developmental language remains Emerging → Establishing → Deepening → Sustaining; these are reflective descriptors, not grades or measures of spiritual worth.

## Canonical V4.1 runtime

- `formation-schema-v4.js` — theological, fruit and longitudinal data contract
- `questions-v4.js` — canonical Practice / Posture / Integration / Fruit item bank
- `engine.js` — pure interpretation engine
- `adaptive-long.js` — facet-aligned adaptive Deeper Discernment controller
- `formation-fruit-v4.js` — directional Christlike Fruit interpretation
- `formation-plan-v4.js` — structured four-week experiment generator
- `formation-result-v4.js` — canonical `FormationResult`
- `formation-renderer-v4.js` — grace-first profile renderer
- `formation-controller-v4.js` — participant assessment and reassessment controller
- `formation-journey-v4.js` — local four-week journey state
- `reflect.html` — reflection and reassessment return experience
- `pilot-v4.html` — participant application shell

`pilot.html` remains the compatibility route into `pilot-v4.html` while preserving query parameters.

See `ARCHITECTURE_V4.md` for the full architecture.

## Public routes

- Participant experience: `index.html`
- Assessment: `pilot.html?mode=quick` / `pilot.html?mode=deep`
- Post-assessment sample: `sample.html`
- Four-week reflection: `reflect.html`
- Development suite: `development.html`
- Algorithm simulator and stress tests: `algorithm.html#sim` / `algorithm.html#stress`

## Release hardening

```bash
npm ci
npx playwright install chromium webkit
npm test
npm run check:links
```

The browser suite verifies the V4.1 facet map, quick and adaptive assessment flows, Back/Next state, context capture, the `FormationResult` contract, grace-first profile, Christlike Fruit, four-week plan, journey persistence, reflection route, sample profile, resources, sharing, mobile overflow and JavaScript errors.

## Validation status

The previous synthetic parallel-validation results apply to the earlier item architecture and adaptive v1.1 only. Because V4.1 materially changes the item map and adaptive evidence structure, adaptive v1.2 requires fresh calibration. See `ADAPTIVE_V41_CALIBRATION.md`.

Formation should not be described as a validated measure of spiritual maturity. Its intended use remains prayerful discernment, reflection, practice and wise conversation.

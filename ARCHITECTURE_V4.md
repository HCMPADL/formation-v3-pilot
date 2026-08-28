# Formation V4 Foundation Architecture

Formation V4 establishes one authoritative pathway from theological purpose to participant result.

## Purpose

Help people notice how they are receiving the love of God, responding to the Spirit, and increasingly becoming like Jesus for the sake of others.

The canonical participant model is:

**BE WITH JESUS → BE FORMED BY JESUS → BECOME LIKE JESUS → LIVE AS JESUS LIVED**

## Canonical runtime

1. `formation-schema-v4.js` — theological, assessment and result contract.
2. `questions.js` — current item bank. Item remapping to Practice / Posture / Integration / Fruit is the next assessment-content milestone.
3. `engine.js` — pure interpretation module. It no longer injects UI or profile scripts.
4. `adaptive-long.js` — the single adaptive Deeper Discernment controller, based on tuned v1.1 rules.
5. `formation-plan-v4.js` — plan generation from structured Attention pattern and Anchor data.
6. `formation-result-v4.js` — creates the canonical `FormationResult` object.
7. `formation-renderer-v4.js` — renders the profile from `FormationResult`; it does not scrape domain bars or infer patterns from prose.
8. `formation-controller-v4.js` — owns assessment state, navigation, adaptive extension, context capture, interpretation and profile transition.
9. `pilot-v4.html` — participant application shell.

`pilot.html` is a compatibility route into `pilot-v4.html`.

## FormationResult contract

The result object contains:

- `mode`
- `assessment`
- `responses`
- `context`
- `domains`
- `areas`
- `anchor`
- `attention`
- `alternates`
- `invitation`
- `plan`
- `resources`
- `fruit`
- `diagnostics`

Downstream experiences should consume this object instead of reading scores, patterns or interpretation from rendered HTML.

## Context safeguards

Before the profile, V4 now captures explicit constraints for time, caring responsibilities, health, work/study and disruption/grief. These are passed to the interpretation engine and can temper interpretation; they never manufacture weakness.

## Adaptive Deeper Discernment

`adaptive-long.js` v1.1 is the canonical adaptive implementation. It begins with 84 universal items and selectively releases reserved items where more evidence could materially change Attention, Anchor or Presence × Impact interpretation. Maximum remains 112.

The fixed 112 response set remains a validation benchmark, not a second participant engine.

## Legacy modules

The following files remain temporarily for historical/sample compatibility but are not part of the V4 participant interpretation path:

- `pilot-readable.html`
- `pilot-app.js`
- `area-insights.js`
- `profile-v18.js`
- `ui-v17.js`
- `survey-flow-v20.js` (auto-loaded by the current question bank but explicitly no-ops when V4 is active)

They should be removed only after sample/development routes and regression tests have been migrated.

## Deployment

GitHub Pages now publishes every top-level runtime `.html`, `.js`, `.css`, `.json` and supported image file. New runtime modules therefore do not require manual addition to an allow-list.

## Next milestone

Revise the question bank so every domain deliberately maps to **Practice → Posture → Integration → Fruit**, while preserving the 56-question short form and the adaptive Deeper Discernment architecture.

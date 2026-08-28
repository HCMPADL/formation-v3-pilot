# Formation V4.1 Architecture

Formation V4.1 establishes one authoritative pathway from theological purpose to participant result and closes the loop from assessment into practice, reflection and reassessment.

## Purpose

Help people notice how they are receiving the love of God, responding to the Spirit, and increasingly becoming like Jesus for the sake of others.

**BE WITH JESUS → BE FORMED BY JESUS → BECOME LIKE JESUS → LIVE AS JESUS LIVED**

## Canonical runtime

1. `formation-schema-v4.js` — theological, assessment, fruit and longitudinal contract.
2. `questions-v4.js` — canonical V4.1 item bank. Every domain has two items for each facet: Practice, Posture, Integration and Fruit.
3. `engine.js` — pure interpretation module.
4. `adaptive-long.js` — canonical adaptive Deeper Discernment controller.
5. `formation-fruit-v4.js` — directional Christlike Fruit interpretation; never a maturity score.
6. `formation-plan-v4.js` — formation experiment generated from structured Attention, pattern, Anchor and fruit focus.
7. `formation-result-v4.js` — creates the canonical `FormationResult` object.
8. `formation-renderer-v4.js` — renders the grace-first profile from `FormationResult`.
9. `formation-controller-v4.js` — owns assessment state, navigation, adaptive extension, context capture, interpretation and reassessment recording.
10. `formation-journey-v4.js` — persists the four-week Notice → Discern → Practise → Reflect → Reassess journey locally on the participant device.
11. `reflect.html` — four-week reflection and reassessment return experience.
12. `pilot-v4.html` — participant application shell.

`pilot.html` remains a compatibility route into `pilot-v4.html`.

## Item architecture

The 56-question Formation Assessment now uses exactly one item per facet per domain:

**Practice → Posture → Integration → Fruit**

Deeper Discernment has two items per facet available for every domain. Its 84-question universal foundation asks the first four-facet set plus second Integration and Fruit items. Second Practice and Posture items are released adaptively where they can materially strengthen interpretation.

The deep interpretation compares **Practice/Posture** evidence with **Integration/Fruit** evidence. This makes patterns such as Make Room and Deepen more directly connected to the assessment's theological model.

## Christlike Fruit

The cross-domain fruit layer uses six directional themes:

- Love
- Joy / Gratitude
- Peace / Trust
- Patience / Gentleness
- Humility / Teachability
- Self-giving / Faithfulness

Fruit is never displayed as a numerical maturity score. The profile surfaces qualitative signals and identifies fruit especially worth noticing within the participant's Attention experiment.

## FormationResult contract

The V4.1 result contains:

- `mode`
- `assessment`
- `responses`
- `context`
- `domains` including facet evidence
- `areas`
- `anchor`
- `attention`
- `alternates`
- `invitation`
- `plan`
- `resources`
- `fruit`
- `journey`
- `diagnostics`

Downstream experiences consume this object instead of scraping scores, patterns or meaning from rendered HTML.

## Profile hierarchy

The participant profile is deliberately ordered around the purpose rather than around scores:

1. Grace already present — Anchor
2. The wider pattern — Three Areas
3. Invitation — participant wording and Attention
4. Christlike Fruit — what may be taking shape
5. Four-week experiment — one concrete way to cooperate with the invitation
6. Domain landscape — supporting evidence rather than the headline result
7. Resources and shared discernment
8. Four-week return journey

## Context safeguards

Before the profile, Formation captures constraints for time, caring responsibilities, health, work/study and disruption/grief. These help prevent constrained circumstances from being interpreted as spiritual failure.

## Adaptive Deeper Discernment

`adaptive-long.js` is now version `1.2-facet-aligned`.

It begins with 84 universal items and selectively releases the remaining Practice and Posture items where more evidence may materially change Attention, Anchor or the relationship between Practice/Posture and Integration/Fruit. Maximum remains 112.

The previous synthetic validation of adaptive v1.1 was based on the earlier item architecture. It is retained as historical engineering evidence only and **must not be treated as validation of the V4.1 item map or adaptive v1.2**. Fresh calibration is required with V4.1 pilot data.

## Longitudinal formation

The result can be saved locally as a four-week journey. `reflect.html` asks:

- What did you notice about God?
- What did you notice about yourself?
- What became easier?
- Where did resistance appear?
- What surprised you?

The participant can then reassess using the same assessment route. Formation stores the later profile alongside the baseline and describes movement without calculating a percentage change in spiritual maturity.

## Deployment and QA

GitHub Pages publishes all top-level runtime assets rather than using a hand-maintained file allow-list.

Release hardening now tests the V4.1 facet map, quick and adaptive participant routes, Christlike Fruit rendering, four-week journey persistence, sample profile, reflection route and reassessment link.

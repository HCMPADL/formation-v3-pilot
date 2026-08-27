# Formation Adaptive Long-Form Pilot

## Purpose
The adaptive long form preserves the existing 14-domain architecture, current 112-question bank and current deep interpretation engine, but changes *when* the final 28 impact items are asked.

The goal is not to make the assessment as short as possible. The goal is to stop asking questions once there is enough evidence to make the same formation-level interpretation with appropriate confidence.

## Compatibility contract
The adaptive pilot intentionally preserves the current data shape used by `FormationEngine.interpret()`:

```js
{
  mode: 'deep',
  data: {
    Prayer: { core, impact, nCore, nImpact },
    Scripture: { core, impact, nCore, nImpact },
    ...
  },
  barriers,
  connections,
  constraints
}
```

This means the adaptive controller can replace the current fixed 112-question sequencing without replacing the interpretation engine, resource engine, profile renderer, Three Areas renderer, Formation Plan or sharing/PDF layer.

## Question architecture
Each domain keeps the existing eight questions.

### Universal foundation — 6 questions/domain = 84 questions
- Existing questions 1–4: all four current foundation/core items.
- Existing question 5: first impact discriminator.
- Existing question 8: second impact discriminator.

Questions 5 and 8 were selected as the universal impact pair because they are separated across the current latter-half construct and tend to capture different expressions of impact rather than asking two adjacent formulations.

### Reserved adaptive items — up to 2 questions/domain
- Existing question 6: first targeted clarification item.
- Existing question 7: final resolution item.

Maximum remains 8/domain and 112 overall.

## Adaptive stages

### Stage A — universal evidence (84 questions)
Every participant answers exactly six questions in every domain. This guarantees equal coverage and prevents the adaptive system from prematurely ignoring a domain.

After question 84, the controller builds a provisional deep profile using the same Presence × Impact logic as the current long form.

### Stage B — targeted clarification
Question 6 is added in a domain when one or more of these conditions are present:

1. **Top Attention candidate** — domain is among the provisional top three opportunity domains.
2. **Possible Anchor** — core and impact are both high and the domain is sufficiently above the participant baseline or exceptionally high absolutely.
3. **Possible Make Room / Deepen contrast** — core and impact are meaningfully separated and fall on opposite sides of the broad interpretation region.
4. **Near interpretation threshold** — core or impact is close to 2.7, 2.9, 3.25 or 3.65.
5. **Impact disagreement** — the two universal impact answers differ enough to suggest the mean is unstable.
6. **Context-sensitive tie** — a contextual barrier maps to a domain whose provisional opportunity is close enough to the leading candidate that additional evidence could change the ranking.

### Stage C — resolution
Question 7 is added only where a three-impact-item domain remains uncertain. Triggers are:

1. Core or impact remains very close to an interpretation threshold.
2. Impact answers remain internally variable.
3. The domain is still part of an unresolved Attention decision.
4. The domain remains a plausible Anchor.

### Stop rule
Stop when no Stage C items are required, or when all relevant reserved items have been asked. The hard ceiling remains 112.

## Pilot question-count targets
- Minimum: 84
- Expected working range before empirical calibration: approximately 92–106
- Maximum: 112

The current thresholds are deliberately conservative. In synthetic stress testing, protecting both Attention and Anchor accuracy requires asking more targeted questions than a purely efficiency-optimised design. These thresholds should be recalibrated from real pilot data.

## Participant experience
The participant should not see language such as “the algorithm is uncertain.” Recommended copy:

- Foundation phase: **Building the wider picture**
- Targeted phase: **A few questions to understand the pattern more clearly**
- Resolution phase: **Almost there — clarifying a few parts of your profile**

The assessment may show a range rather than a fixed total: “Most people complete between about 90 and 105 questions; the assessment stops once it has enough information.”

## Why adaptive items are selected by domain rather than globally
The output is domain-based and the interpretation engine compares domains against the participant's own baseline. Every domain therefore needs a reliable universal foundation before the assessment becomes selective. Starting with fewer than six/domain would create an efficiency gain at the expense of comparability across the 14-domain landscape.

## Important validation rule
The adaptive result should be evaluated against the full 112-item result during pilot testing. For each pilot participant, the system can silently retain the option to ask all remaining items after the adaptive stop point for validation purposes. Compare:

- developmental stage agreement by domain;
- Presence × Impact pattern agreement;
- Anchor agreement;
- Attention agreement;
- confidence-label agreement;
- resource recommendation agreement;
- participant-rated resonance of the final interpretation.

A production adaptive version should not be accepted until predefined agreement thresholds are met on genuine participant data.

## Integration path
1. Load `adaptive-long.js` after `engine.js` and `questions.js`.
2. Replace the current fixed `deep ? qs : qs.slice(0,4)` sequence builder with `FormationAdaptiveLong.initialItems()` when adaptive mode is selected.
3. After the universal sequence, call `firstExtension(responses, barriers)`.
4. After Stage B, call `secondExtension(responses, barriers)`.
5. At stop, call `finalise(responses, barriers)`.
6. Pass the returned interpretation/profile into the current result-rendering path.

No changes are required to the 14-domain labels, stage language, Anchor/Attention UI, Three Areas, resource engine, Formation Plan, mentor/peer sharing or one-page PDF architecture.

## Recommended rollout
Keep the current 56-question short form unchanged. Run the adaptive long form as an experimental third pathway beside the current fixed 112-question long form until enough genuine data exists to compare them directly. Once equivalence is demonstrated, the adaptive pathway can replace the fixed long form while retaining 112 as a validation/debug ceiling.
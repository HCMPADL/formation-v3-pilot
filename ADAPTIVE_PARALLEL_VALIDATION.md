# Adaptive Long Form — Parallel Validation

Date: 2026-08-27

## Purpose

Compare the experimental adaptive long-form assessment with the complete fixed 112-item long form using the same underlying synthetic respondent profiles and the current Formation V3 interpretation engine.

This is an engineering/sensitivity validation, **not psychometric validation**. It tests how often the adaptive logic reproduces the current algorithm's output when both are fed responses generated from the same latent profile.

## Method

Each synthetic profile contained:
- 14 domain-level latent core/presence values
- correlated impact/integration values
- realistic item-level response noise
- occasional deliberately planted Presence × Impact contrasts to create Make Room / Deepen cases
- 0–3 contextual barriers drawn from the current barrier map
- 8 responses per domain, giving a complete 112-item response set

The full interpretation used all 112 responses.

The adaptive interpretation began with:
- 4 core questions per domain
- impact questions 5 and 8 per domain
- 84 universal questions total

It then selectively released reserved impact questions 6 and 7 according to the adaptive decision rules.

Two simulations were used:
1. 30,000-profile exploratory run of adaptive v1.0
2. 12,000-profile fresh holdout run for comparison of fixed 84, fixed 98, adaptive v1.0 and tuned adaptive v1.1

## Holdout results

| Strategy | Mean questions | Median | 90th pct | Attention exact | Attention exact when full form named Attention | Confidence exact | Anchor exact | Pattern agreement |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Fixed 84 | 84.0 | 84 | 84 | 70.3% | 73.6% | 59.8% | 76.5% | 89.0% |
| Fixed 98 | 98.0 | 98 | 98 | 79.4% | 84.5% | 69.6% | 85.4% | 93.4% |
| Adaptive v1.0 | 109.0 | 110 | 112 | 98.6% | 99.1% | 97.6% | 100.0% | 98.7% |
| Tuned adaptive v1.1 | 101.8 | 102 | 108 | 96.7% | 97.9% | 94.6% | 99.8% | 95.3% |

Additional result for tuned v1.1:
- No holdout case produced a different Attention when both full and adaptive forms independently reached `Clear Attention`.
- Maximum remains 112 for genuinely unresolved cases.
- Average saving versus the full form is approximately 10 questions.

## Interpretation

The current adaptive v1.0 is extremely faithful but too conservative; it saves only about 3 questions on average.

A simple fixed 98-item form saves 14 questions but loses too much interpretive agreement, especially for Attention and confidence.

The tuned adaptive v1.1 offers the best current engineering trade-off:
- approximately 102 questions on average
- approximately 10 questions saved
- nearly 98% Attention agreement when the full form names an Attention
- approximately 95% agreement across internal domain patterns
- essentially complete Anchor agreement in this simulation

The main remaining gap is confidence-label agreement. The adaptive result may preserve the same Attention while shifting between Open, Emerging and Clear confidence because fewer impact observations can slightly alter opportunity gaps.

## Tuned v1.1 decision rules

### Universal stage — 84 questions
Every domain receives:
- Q1–Q4: Core / Presence
- Q5 and Q8: Impact / Integration

### First extension — usually one added question per flagged domain
Q6 is released when the domain is:
- among the top three provisional Attention candidates
- showing a meaningful Presence × Impact contrast
- a plausible Anchor
- involved in a close context-sensitive interpretation
- near a classification threshold **and** among the five most decision-relevant domains

### Resolution extension
Q7 is released only when, after Q6, the domain:
- remains among the five most interpretation-relevant domains
- retains a Presence × Impact contrast
- remains a plausible Anchor
- still has internally varied impact evidence
- remains very close to an interpretation threshold

### Stop rule
Stop when no reserved item meets those criteria, or when 112 questions have been asked.

## Recommendation

Use adaptive v1.1 as the pilot candidate, but do **not** replace the fixed 112 form as the validation standard yet.

During real piloting, collect all 112 responses invisibly for a calibration cohort while also recording the point at which the adaptive algorithm would have stopped. This creates a true same-person shadow comparison without changing what the participant experiences.

Promotion target before replacing the full form:
- ≥95% exact Attention agreement
- ≥95% domain pattern agreement
- ≥95% Anchor agreement
- no clinically/theologically concerning systematic subgroup differences
- acceptable confidence-label agreement or a revised confidence rule designed for adaptive evidence

## Code support

`adaptive-long.js` now exposes:
- `runFromComplete(fullResponses, barriers)`
- `fullResult(fullResponses, barriers)`
- `shadowCompare(fullResponses, barriers)`

This allows a complete 112-response record to be scored both ways in parallel for future real pilot data.
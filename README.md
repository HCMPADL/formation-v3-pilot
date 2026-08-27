# Formation V3.0 Pilot

Frozen pilot build for the Formation spiritual formation assessment.

Participant pathways:
- Formation Assessment: 56 questions
- In-Depth Assessment: 112 questions

Profile stages: Emerging → Establishing → Deepening → Sustaining.

Interpretation: V3.0 frozen pilot algorithm with Anchor & Attention, four-week formation rhythms, profile-responsive resources, and sharing options.

Public routes:
- Participant experience: `index.html`
- Post-assessment sample: `sample.html`
- Development suite: `development.html`
- Algorithm simulator and stress tests: `algorithm.html#sim` / `algorithm.html#stress`

## Release-hardening checks

```bash
npm install
npx playwright install chromium webkit
npm test
npm run check:links
```

The browser suite completes the 56- and 112-question pathways on desktop and mobile viewports, verifies Back/Next state, the pre-profile transition, results, resources, sharing, the one-page print output, all four development routes, horizontal overflow, and JavaScript console errors. GitHub Actions additionally runs the mobile suite with WebKit.

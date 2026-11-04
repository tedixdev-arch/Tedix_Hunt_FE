# PR #174 UX corrections

Geographic applicability now reads the existing authoritative catalog using exact saved country, region and city identifiers. Region lookup follows pagination; city detail must match both the saved geographic ID and country. Names and hierarchy come only from catalog fields. Lookup failures and missing labels retain canonical identifiers with a clear catalog-unavailable fallback. Stale responses cannot label a subsequently selected geography. No saved geography, backend contract or locality registration is changed.

Opening Request Changes hides Approve. Feedback, Send Request and Cancel remain inline; Cancel restores both original decisions. Existing busy guards, exact revision binding, validation and independent-review checks remain intact.

Validation: 34 relevant tests passed, typecheck and production build passed. Actual Chromium rendering was verified at 1440/390/320px using deterministic catalog/API fixtures (no live database writes); all 21 screenshots were inspected and overflow checks passed.

| State | 1440px | 390px | 320px |
| --- | --- | --- | --- |
| universal | [Screenshot](universal-1440.png) | [Screenshot](universal-390.png) | [Screenshot](universal-320.png) |
| country | [Screenshot](country-1440.png) | [Screenshot](country-390.png) | [Screenshot](country-320.png) |
| region | [Screenshot](region-1440.png) | [Screenshot](region-390.png) | [Screenshot](region-320.png) |
| city | [Screenshot](city-1440.png) | [Screenshot](city-390.png) | [Screenshot](city-320.png) |
| fallback | [Screenshot](fallback-1440.png) | [Screenshot](fallback-390.png) | [Screenshot](fallback-320.png) |
| feedback | [Screenshot](feedback-1440.png) | [Screenshot](feedback-390.png) | [Screenshot](feedback-320.png) |
| cancel | [Screenshot](cancel-1440.png) | [Screenshot](cancel-390.png) | [Screenshot](cancel-320.png) |

Reproduce with Vite on localhost:5173 and `node tests/browser/contentReviewCorrections.verify.mjs`. The fixture uses the actual Admin shell, preview and decision components. Results and verification logs are alongside these screenshots.

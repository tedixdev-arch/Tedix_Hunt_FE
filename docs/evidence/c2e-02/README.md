# C2e-02 visual evidence

Real Creator editor against merged BE #121 and disposable PostgreSQL 17. Chromium: 1440, 390 and 320px. `results.json` contains assertions and the backend identity. No successful save responses were mocked.

Each scenario has a viewport capture. `-allocation` captures the complete allocation panel and shared phone preview; `-error` captures the visible backend guidance. These close-ups are needed because the existing app scrolls internally.

| Scenario | Desktop | 390px | 320px |
| --- | --- | --- | --- |
| Random before save | [View](random-before-save-1440-allocation.png) | [View](random-before-save-390-allocation.png) | [View](random-before-save-320-allocation.png) |
| Compact pool filters | [View](random-pool-filters-1440-allocation.png) | [View](random-pool-filters-390-allocation.png) | [View](random-pool-filters-320-allocation.png) |
| Random allocated after save | [View](random-after-save-1440-allocation.png) | [View](random-after-save-390-allocation.png) | [View](random-after-save-320-allocation.png) |
| Choose Specific / eligible list | [View](specific-list-1440-allocation.png) | [View](specific-list-390-allocation.png) | [View](specific-list-320-allocation.png) |
| Immediate selected preview | [View](specific-preview-1440-allocation.png) | [View](specific-preview-390-allocation.png) | [View](specific-preview-320-allocation.png) |
| Personal duplicate prevention | [View](duplicate-personal-1440-allocation.png) | [View](duplicate-personal-390-allocation.png) | [View](duplicate-personal-320-allocation.png) |
| Insufficient distinct Random pool | [View](insufficient-random-pool-1440-error.png) | [View](insufficient-random-pool-390-error.png) | [View](insufficient-random-pool-320-error.png) |
| Empty Random pool | [View](empty-random-pool-1440-allocation.png) | [View](empty-random-pool-390-allocation.png) | [View](empty-random-pool-320-allocation.png) |
| Category mismatch | [View](category-mismatch-1440-error.png) | [View](category-mismatch-390-error.png) | [View](category-mismatch-320-error.png) |
| Grade mismatch | [View](grade-mismatch-1440-error.png) | [View](grade-mismatch-390-error.png) | [View](grade-mismatch-320-error.png) |
| Location mismatch | [View](location-mismatch-1440-error.png) | [View](location-mismatch-390-error.png) | [View](location-mismatch-320-error.png) |
| FinishPoint Team allocation | [View](finishpoint-team-1440-allocation.png) | [View](finishpoint-team-390-allocation.png) | [View](finishpoint-team-320-allocation.png) |
| Template locality eligibility | [View](local-eligibility-1440-allocation.png) | [View](local-eligibility-390-allocation.png) | [View](local-eligibility-320-allocation.png) |
| Create Your Own | [View](create-your-own-1440.png) | [View](create-your-own-390.png) | [View](create-your-own-320.png) |
| Return to frozen Specific | [View](restored-specific-1440-allocation.png) | [View](restored-specific-390-allocation.png) | [View](restored-specific-320-allocation.png) |

The duplicate panel disables an already-used Content identity. Insufficient-pool captures cover FinishPoint Personal with a colliding unresolved Random request. Mismatch tests alter only an outbound test request to provoke real backend validation; the editor selection and persisted version remain intact. The full workflow and reproduction commands are in [the implementation report](../../qa/C2e-02-Approved-Template-Allocation.md).

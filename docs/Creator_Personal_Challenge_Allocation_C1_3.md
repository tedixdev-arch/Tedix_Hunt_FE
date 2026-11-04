# C1.3 Personal Challenge allocation

Modern Template → Checkpoints & Challenges → Personal Challenge → Predefined now shows the canonical mechanic selector followed by Allocate challenge: Random from Library (default) or Use filters. Starter cards and example canvases are absent from this editor. Existing saved content can still be viewed; Custom Exercise and Legacy editing keep their existing behavior.

Allocation is a session-only UX prototype, with an explicit publication-unavailable notice. It has no assignment callback, random selection, backend write or serialized allocation fields. Changing allocation options cannot replace or remove a checkpoint assignment. Existing persistence and publication guards remain unchanged. Explicit existing apply/remove/custom actions retain their prior semantics.

Use filters defaults to the protected Starter collection preset and Universal geography. Starter is mapped to the existing repository-starters collection and All category scope, never added to academic category identities. Mathematics, History, Science and Mixed reuse templateCategories. Country/region/city reuse ContentGeography; mathematics reuses curriculumOptions and changeCurriculum and exposes only levels with actual supplied associations. No curriculum catalog is currently connected, so no empty curriculum controls appear. Content → Library retains its collapsed Starter examples and approved Available Exercises.

## Validation

- `npm test`: 271 Node tests and 942 Vitest tests passed (48 component test files).
- `npm run typecheck`: passed.
- `npm run build`: passed (existing bundle-size advisory).
- `node tests/browser/challengeAllocation.verify.mjs`: passed at 1440, 768, 390 and 320 px; all 15 mechanic selections, Random/Use filters, category transitions, country → region → city, saved assignment preservation, collapsed Library Starter examples, no page/editor overflow, no browser errors.
- Component regressions cover real curriculum cascades/reset, unavailable curriculum, allocation publication notice, saved checkpoints/scoring, independent Custom editing, retained draft compatibility, Legacy and existing publication/persistence guards.

Browser checks use isolated fixtures and existing shared production components, without live API mutations. Their output is regenerated under work/allocation-browser. The older personalChallengeUX browser entry point still depends on an earlier Hunt Setup location workflow; C1.3 browser acceptance uses the new dedicated fixture.

No merge or deployment. Stop at draft PR for ChatGPT review.

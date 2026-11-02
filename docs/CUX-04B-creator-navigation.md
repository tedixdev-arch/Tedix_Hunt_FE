# CUX-04B: Simplified Creator navigation

Based on merged main through PR #150 (`ac8513a`). FE only; no dependency,
persisted schema, API, gameplay, scoring or Organizer changes.

## Navigation

Before: separate Hunt Setup, four Template Setup steps, seven Hunt Features,
then Review; Save draft sat outside Review and the last feature also saved.

After: four primary buttons with a clear active state:

- Template Setup: existing Hunt Setup (including Local Country/City), details,
  participant/team requirements and story. Historical setup IDs 0–3 remain.
- Checkpoints & Challenges: count, embedded positions/FinishPoint, Personal,
  Team, and onward navigation, using the existing editors.
- Advanced: closed initially; Mission History, Results Display, Special Awards
  and read-only scoring. Persisted IDs remain `map`, `results`, `rewards`.
- Review & Submit: preview, walking inspection, validation, draft/completion save,
  submission and read-only status/version/approval context.

Existing setup/feature selectors are shallow subnavigation. Acknowledgement
buttons never implicitly save. Special Awards and custom component prototype
fields explain that their input is not saved. No new persistence is implied.

## State and map lifecycle

Each feature panel mounts once on its first visit and is then hidden rather than
removed. The count panel is retained from the start. Personal and Team each have
a stable keyed editor instance; existing AuthoringDrafts ownership/callbacks stay
unchanged. Checkpoint selection, prototype drafts, uncontrolled proposal inputs,
formula provider/dialog state and editor modes survive primary/feature navigation.
Generic Advanced component mode is keyed by existing feature ID.

RouteEditor also remains mounted. Only its TedixMap child is removed while the
count panel is inactive or the journey preview is open. Existing map cleanup
removes resources/listeners; cameraMemory supplies the next map's opening camera
without refitting initial bounds over it. The unconfirmed inspector form, pending
point/notes, undo history and selection remain in RouteEditor. There is at most
one placement map. Read-only walking inspection mounts only in Review and closes
on leaving Review. It contains no authored draft. Formula dialogs retain native
modal focus: users finish/cancel the dialog before ordinary navigation; forced
programmatic section changes also retain the pending formula without inserting it.

Inactive panels use native hidden, removing their controls from keyboard and
accessibility navigation. Primary buttons keep focus; validation recovery opens
the target section before focusing it. Navigation wraps in a grid at narrow widths.
The route identity continues to key the entire editor, isolating different Templates.

## Legacy compatibility and saving

CUX-04A's required ID membership, content validation and save operations stay in
place. Review provides explicit checkboxes for the three Advanced feature IDs and
the historical status acknowledgement on Legacy Templates. Editing Advanced is
optional, but acknowledging these existing Legacy requirements is still necessary.
Navigation does not check them. No incomplete Legacy state is automatically filled
in merely to permit saving/submission. The old status step may also acknowledge
its existing setup ID without editing status.

The pre-existing saved-Template hydration behavior remains: every loaded saved
Template, including a partial draft, restores acknowledgement sets. This is the
CUX-04A compatibility contract, not proof of content completion. Content/route,
preview and validation gates still apply. Changing historical restoration would
be separate work.

Review's Save draft calls saveDraft; Legacy Save completed Template calls
completeHuntFeatures. The synchronous save lock, ambiguous-save recovery,
immutable versions, unknown configuration/scoring passthrough, and exact saved
version submission remain unchanged. Approved content retains existing revision
and read-only restrictions.

## Validation

Focused regressions cover retained Personal/Team editor nodes and draft text,
Advanced prototype inputs, pending formula dialog, explicit Legacy checks, saving,
reopen, version submission, and Mapbox cleanup/camera/unconfirmed route retention.
The browser fixture checks 320, 390, 768 and 1440px, primary active state, initial
Advanced collapse, keyboard activation, no document overflow, prototype retention
and one save request. Run:

```
npx vitest run tests/creatorFinishPoint.test.tsx tests/creatorMapbox.test.tsx tests/huntSetup.test.tsx tests/signalClujDraft.test.tsx --maxWorkers=2
node tests/browser/creatorNavigation.verify.mjs
npm test -- --maxWorkers=2
npm run typecheck
npm run build
```

Browser coverage uses deterministic FE API fixtures. Mapbox lifecycle tests use
mocked WebGL objects; live external tiles and real-device GPU behavior were not
verified. Existing browser scripts for the previous navigation need their flows
updated if reused. No real backend mutations were made for verification.

STOP for ChatGPT review. Do not merge or deploy.

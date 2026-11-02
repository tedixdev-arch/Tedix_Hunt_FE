# CUX-04A completion and saving

## Completion before and after

Before: Template Setup and Hunt Features were complete when their acknowledgement
sets had the same size as their navigation arrays. Saved Templates restored sets
by enumerating those arrays. After: `completion.ts` defines the required identities
and checks membership; restoration returns fresh sets of those same identities.
Reordering navigation cannot change the requirements, and an unrelated ID cannot
stand in for a missing requirement.

All four setup acknowledgements (0 details, 1 use requirements, 2 mission/story,
3 status) and all seven feature acknowledgements (`count`, `personal`, `team`,
`navigation`, `map`, `results`, `rewards`) remain required for Legacy completion.
`positions` and `final` remain unchanged compatibility IDs; their editors are
embedded under count and do not become new completion requirements.

Optional input includes custom challenges, prototype components and proposed
Special Awards. Optional input does not make the containing feature acknowledgement
optional: Rewards still requires acknowledgement for Legacy. Continue records an
acknowledgement; it does not validate every field or save. No validation is relaxed.

Legacy completion saving still requires all acknowledgements and route safety.
Legacy submission additionally requires valid FinishPoint/gameplay, preview and
validation, and matching checkpoint count unless the historical geography contract
has neither normalCheckpointCount nor checkpointPositions. Universal submission
still requires valid gameplay/FinishPoint under its existing route-free rules;
Local requires the existing content, saved locality and registry validation.
Classified saving retains its existing independence from acknowledgement progress.
All actual save validators remain in the editor unchanged.

Every successfully hydrated saved Template, including a partial draft, still
restores all acknowledgements. This is historical behavior, not evidence that its
content passes validation. Route/preview/validation session gates remain separate.
There is no new persisted completion metadata. Existing `scoring.selections`,
unknown scoring/configuration fields, checkpoint identifiers, custom exercise
metadata, route research and version contracts flow through unchanged.

## Save triggers before and after

Before: the final-feature handler built the completed set and invoked
persistWorkingTemplate; Save draft invoked the same function with a boolean.
After: named `completeHuntFeatures` and `saveDraft` operations call the independent
save function with explicit intents. Only the existing UI adapter checks whether
to advance navigation or invoke completion saving. No button or label changes.

The save function has no dependency on featureIndex, step position, or navigation
arrays. It retains synchronous mutationLock, validation, stale-server preflight,
immutable version creation, snapshot acknowledgement/rebasing and error handling.
Submission still preflights and submits the exact saved key/version, never an
implicitly saved working copy. Approved/revision authority remains unchanged.
Definite rejections keep working content and permit retry. Ambiguous creation or
server/conflict failures retain existing uncertain/conflict recovery requirements;
blind retry remains blocked to avoid duplicate versions.

## Unmount-sensitive editor state and smallest safe future strategy

| Component | State lost on unmount | Smallest safe preservation strategy |
| --- | --- | --- |
| PrototypeComponentEditor in CreatorStudio | Entire prototype draft, keyed by feature/checkpoint | Lift a session-only draft map to the Template editor keyed by feature and slot. Keep it out of payloads. |
| CreatorStudio generic Create new branch (Mission History/Results) | Uncontrolled name and participant behavior | Controlled session-only fields keyed by feature; do not imply persistence. |
| RewardBoundary | Uncontrolled award proposal inputs | Controlled session-only proposal state in the Template editor; no prize contract changes. |
| RouteEditor | Unconfirmed `editing.point` and `editing.notes` popup copy; pending confirmation | Lift the pending edit keyed by checkpoint/terminal into the Template editor, retaining explicit confirm/cancel. Confirmed drafts/arrival notes are already lifted. |
| FormulaDialog in FormulaEditor | Formula text and selected replacement range before Insert | Retain pending formula at provider/editor scope keyed by exercise slot and field; insert only explicitly. Avoid stale range application after field edits. |
| CheckpointEditor | Selected checkpoint and approved/new tab | Lift selection/tab if future navigation needs continuity. Assigned content and challenge drafts are already owned by the Template editor. |
| PersonalChallengeCanvas, PersonalMechanicEditor, TeamMechanicEditor, PencilField, PersonalExtendedSurface | Mode, guided step, open inline editor | Optional session-only view state keyed by slot; authored text already propagates immediately. |
| ChallengeAuthoring, TeamChallengeCanvas, ExerciseRenderer, AuthoredExerciseRenderer | Preview, simulation attempts, feedback/hints | Keep simulation reset behavior unless continuity is explicitly required; do not mix attempts with authored content. |
| FinishPointEditor | Candidate reference UI state | Lift reference only if future navigation requires it; actual FinishPoint input is already controlled. |

Personal/Team authored exercise variants are already lifted via AuthoringDrafts,
including per-slot retained types. This refactor changes no mount boundaries, so
none of the above needs a state change now. No navigation regrouping, gameplay,
backend API, migration, dependency, or persisted identifier changes are included.

# Tedix Hunt - Prototype Architecture & Implementation Plan

Version 1.4 | Updated 17 September 2026. Build a working prototype from the approved mockup, using the frontend, backend and PostgreSQL work already started by the dev team.

## Standard implementation workflow

```text
ChatGPT Web
   ↓
Create exact prompt for ONE plan step
   ↓
Codex Web
   ↓
Implement + test
   ↓
Create PR in GitHub
   ↓
ChatGPT Web
   ↓
Review PR
   ↓
You merge PR
   ↓
GitHub Actions
   ↓
Deploy Backend
   ↓
Run new DB migrations (if any)
   ↓
Restart API
   ↓
Verify result
   ↓
NEXT STEP
```

For a step with no database change, the migration step is skipped. Database schema changes must be recorded as migrations in the backend repository before they are applied to PostgreSQL.

## Summary of the steps we will take

We will connect the existing screens to real login and saved Hunt data, one small step at a time.

- 1. Confirm the deployed website, backend and database work together.
- 2. Prepare backups and record database changes.
- 3. Finish backend login and connect the frontend to it.
- 4. Set participant, organizer, creator and admin permissions.
- 5. Create and save a Hunt with a working invitation code.
- 6. Let participants join real teams and prepare to start.
- 7. Make one checkpoint work with saved answers, scores and progress.
- 8. Extend it to the full Signal mission and final results.
- 9. Complete organizer monitoring and help before outdoor testing.
- 10. Test with a small group, fix problems, then add the remaining features.

First action: confirm why the deployed website differs from the current frontend code, and verify the backend database connection.

## 1. Project reference

- Mockup / UX reference: [https://github.com/tedixdev-arch/tedixhunt_student](https://github.com/tedixdev-arch/tedixhunt_student)
- Frontend repository (React + TypeScript): [https://github.com/tedixdev-arch/Tedix_Hunt_FE](https://github.com/tedixdev-arch/Tedix_Hunt_FE)
- Frontend development website: [https://tedixhunt-fe-dev.anainfo.ai/](https://tedixhunt-fe-dev.anainfo.ai/)
- Backend repository (Node.js + TypeScript + Express): [https://github.com/tedixdev-arch/Tedix_Hunt_BE](https://github.com/tedixdev-arch/Tedix_Hunt_BE)
- Backend development API / Swagger: [https://tedixhunt-be-dev.anainfo.ai/api/docs/#/](https://tedixhunt-be-dev.anainfo.ai/api/docs/#/)
- PostgreSQL administration (pgAdmin): [https://tedixhunt-be-dev.anainfo.ai/pgadmin4/browser/](https://tedixhunt-be-dev.anainfo.ai/pgadmin4/browser/)
- Target stack: React + TypeScript frontend; Node.js + TypeScript + Express backend; PostgreSQL database; REST/JSON over HTTPS.

## 2. Core UX premise

TedixHunt is primarily a mobile experience for Participants.

- Participant: mobile-first. Fast, low-friction, one-hand use, large tap targets, short forms, persistent progress and resilient network behavior.
- Organizer: primarily desktop-first. Configuration, dashboards, tables and live monitoring; still responsive for smaller screens.
- Creator: primarily desktop-first. Structured template creation, validation, preview and submission workflows.
- Admin: desktop-first. Data-dense administration, filtering, permissions, auditability and safe destructive actions.

Responsive does not mean identical. Participant screens should be designed from the phone upward; back-office screens should be designed from desktop workflows downward.

## 3. Architectural baseline and governing principle

The mockup remains the functional and UX specification, but the current FE and BE repositories are now the technical starting point.

We will keep the existing screens and useful code. Each step will replace one simulated feature with a working feature.

Governing principle:

Preserve the approved experience. Add real login, saved data and backend permission checks in small steps. Keep the code simple and explain important rules with short comments.

### Current FE baseline

The FE already has a structured React + TypeScript application with folders such as:

- src/app
- src/components
- src/features
- src/pages
- src/routes
- src/shared
- src/types
- src/data

Most mockup screens are already copied into the FE. The active application starts in src/main.tsx and uses src/routes/router.tsx. Connect new work there; the older App.tsx shell is not the active entry point.

### Current BE baseline

The current backend already contains:

- Express / TypeScript API structure
- PostgreSQL models and SQL queries
- JWT authentication: the backend creates and checks signed login tokens
- User, RefreshToken and Organization models backed by PostgreSQL
- authentication and organization routes
- Swagger/OpenAPI support

The backend now uses PostgreSQL for both users and organizations. The earlier plan described an older state and must not be used as proof that every foundation step is complete.

The current backend path is:

```text
Node.js / Express
      |
      +-- Login and JWT token checks
      |
      +-- PostgreSQL
            - users
            - organizations
            - organization_members
            - refresh_tokens
```

Do not repeat the MongoDB migration. Current BE main no longer uses Mongoose; continue from the existing PostgreSQL models.

## 4. Target technical architecture

```text
Participant phone / Organizer desktop
                  |
         Tedix Hunt frontend
                  |
             HTTPS API
                  |
         Tedix Hunt backend
                  |
             PostgreSQL
```

The frontend must never connect directly to PostgreSQL.

The intended runtime path is:

```text
Browser -> FE -> BE API -> PostgreSQL
```

Codex and pgAdmin can connect separately for authorized database work. This connection does not replace the website-to-backend connection.

## 5. Core architecture principles

### PostgreSQL is authoritative

All new TedixHunt functionality must use PostgreSQL. Do not create new Mongo/Mongoose dependencies.

Keep the existing PostgreSQL users and organizations. Add the Hunt tables through recorded database migrations.

### One identity, multiple roles

Authentication identifies a User, not a permanently separate CreatorUser, ParticipantUser, OrganizerUser or AdminUser.

A single user may later hold one or more capabilities/roles, for example:

```text
User
 |- Participant
 |- Organizer
 |- Creator
 `- Admin
```

Supervisor remains contextual to a competition/Hunt unless later product requirements prove otherwise.

### Security is backend-enforced

Hiding controls in the frontend is UX only. Every protected action must be authorized by the backend.

### Real persistence

No fake login, hard-coded user state, fake scoring or local-only Hunt state in production-like flows.

### Existing structure is preserved deliberately

Do not delete or refactor existing FE/BE structure merely because it predates this plan. First determine whether it is useful, transitional or obsolete.

### Small vertical slices

Each change should be small enough for one focused review, followed by tests and a check on the deployed prototype.

### No speculative redesign

Codex should implement the requested step only and must not refactor unrelated areas unless explicitly instructed.

### Stable contracts

Frontend and backend communicate through explicit API contracts and predictable error shapes.

### Mobile performance matters

Participant flows should minimize payloads, blocking requests, complex forms and interaction depth.

## 6. Current status and prerequisites

### What is already in place

- Frontend: most mockup screens are already in the FE repository. Keep their design and connect their actions to real data.
- Backend: the dev team has implemented PostgreSQL users and organizations, password checks and JWT login tokens. Improve this existing foundation.
- Database: tedix_hunt is reachable and contains users, organizations, organization_members and refresh_tokens. Hunts, teams and gameplay are not stored yet.

### What still needs to be completed

- Database changes are not tracked as migrations. Add a repeatable change history, database readiness checks and clean connection shutdown.
- Backend login needs fixes to token handling, Tedix identity proof, sign-out and input validation. Frontend login and gameplay are still simulated.
- The previous frontend API/session PR was closed without merging. Review it for useful parts, but adapt them to the current backend.

### What we must confirm before building further

- Deployment: explain why the live website shows a different starting screen from current FE code. Confirm the deployed backend uses the intended database and updated credentials.
- Recovery: confirm a working backup and restore process, and use a separate database for tests.
- First pilot: agree the Hunt content, team size, difficulty, scoring, participant login/recovery, arrival checks and help contact.

Proposed first pilot: Signal Cluj Napoca, four-person teams and one difficulty level. These remain suggestions until agreed. The steps below explain how we will implement the plan.

## 7. Implementation roadmap

Work through the phases below in small reviewed changes. Step codes belong to phases: A1 means the first step in Phase A. They are not chapter numbers.

First prove one checkpoint with real participants, saved progress and backend scoring. Then extend it to the full Hunt. Start monitoring and help once enrollment works; finish them before an outdoor pilot. Rewards and advanced features follow the core pilot.

### Phase A - Foundation and real login

- A1. Confirm the deployed setup. Identify the running FE and BE versions, confirm the database target and credentials, and check that the website can call the backend. Finish with a recorded working setup and a clear deployment process.
- A2. Complete the PostgreSQL foundation. Keep the four existing tables. Add tracked migrations, verify backup/recovery, check database readiness and close connections cleanly. Verify changes on a separate database before applying them to the prototype.
- A3. Validate existing user accounts. Keep current user IDs, passwords and organization relationships. Add clear input checks and safe email-duplicate handling; check existing records before changing email uniqueness rules.
- A4. Complete backend authentication. Keep JWT access tokens. Correct unverified Tedix-ID login, distinguish access from refresh tokens, make refresh reliable, and add logout. Agree browser session handling and test valid, expired and invalid credentials.
- A5. Build the frontend API connection. Add one small shared API client and connect the authentication provider to the active application entry point. Handle loading, errors and session expiry consistently; reuse suitable parts of the closed PR.
- A6. Connect real login screens. Replace simulated sign-in with backend calls. Verify that a user can log in, reload an allowed screen, renew an expired session and log out on the deployed website.

Phase A is complete when real login works from the deployed website through the backend to PostgreSQL.

### Phase B - Identity and permissions

- B1. Define user roles. Attach participant, organizer, creator and admin capabilities to the existing user identity. Define how professional roles are assigned; users must not grant themselves privileged access.
- B2. Enforce access rules. Protect the relevant screens and backend actions. Check organization ownership, Hunt membership and role permissions; verify that one user cannot read or change another organizer's protected data.

Phase B is complete when each role can perform its allowed actions and forbidden requests are rejected by the backend.

### Phase C - Organizations and Hunt foundation

- C1. Reuse organizations and membership. Extend the existing PostgreSQL organization model only where needed. Define who may create a Hunt for an organization and verify owner/member access without repeating the database migration.
- C2. Add the core Hunt records. Create the tables needed for Hunts, participants, teams and Hunt-specific roles. Link them to existing user and organization IDs, with rules preventing duplicate enrollment and cross-Hunt membership.
- C3. Build Hunt lifecycle APIs. Add backend operations to create, read and update drafts, then publish, start, pause, resume, cancel and finish a Hunt. Define valid state changes and reject actions that are not allowed.
- C4. Connect the organizer Hunt list. Replace sample Hunts with API data. The organizer should see their own saved Hunts, correct status and permitted next actions, including clear empty and error states.

Phase C is complete when Hunt records and state changes persist and are restricted to the correct organizer.

### Phase D - Organizer setup

- D1. Save general setup. Connect the existing setup form to the Hunt draft. Save name, location, schedule/timezone, duration, capacity and contact details; reopening the draft must restore the saved values.
- D2. Select the Hunt template. Start with the agreed Signal template. Save a template version or content snapshot with the Hunt so later template edits cannot change a published or active game.
- D3. Save supported Hunt features. Persist the checkpoint order, format, difficulty and other options agreed for the pilot. Show unsupported options as unavailable rather than saving settings that have no effect.
- D4. Configure rewards after the core pilot. Keep the existing reward design in the roadmap. When this step is scheduled, save reward descriptions, eligibility and quantities, and preserve the existing distinction between Hunt types.
- D5. Review the Hunt. Show a summary using the saved draft, not sample values. Highlight missing or invalid settings and let the organizer return to the relevant setup section.
- D6. Publish the Hunt. Connect the final Create Hunt action to the publish operation from C3. Validate required settings, prevent duplicate creation on retries, and show a confirmation with the saved Hunt details.
- D7. Generate and share access. Create a unique Hunt code and working invitation link. Let the organizer copy them; verify that another device opens the correct Hunt. Automated email sending is a later addition.

The core Phase D flow is complete when an organizer can save, reopen, review and publish a Hunt with a working invitation. Reward configuration may follow the pilot.

### Phase E - Participant runtime

- E1. Open a Hunt by link or code. Resolve the invitation through the backend and display the correct Hunt preview. Show clear messages for unknown codes, closed enrollment or cancelled Hunts.
- E2. Enroll the participant. Use the agreed account or guest flow to save the participant's identity and Hunt membership. Repeated joins must return the existing enrollment; capacity limits and session recovery must work.
- E3. Create the team lobby and start gate. Save team assignments, difficulty and readiness where applicable. Show real teammates and shared start status; participants enter gameplay only when the backend permits the Hunt to start.
- E4. Implement one checkpoint model. Store the first Signal checkpoint's prompt, private answer rules, contribution and next-stage information. Define personal and team progress before copying the pattern to later checkpoints.
- E5. Connect checkpoint interaction. Reuse the mission screens for answering, hints, personal contributions and the team challenge. Replace simulated teammates and timed readiness with actual participant actions and shared backend state.
- E6. Validate answers in the backend. Submit answers for checking and return the permitted outcome. Keep correct answers and unreleased solutions out of participant downloads; enforce retry, hint and reveal rules.
- E7. Calculate scores in the backend. Agree individual versus team points, penalties and bonuses before implementation. Record score changes with a reason and prevent repeated requests or simultaneous team answers from awarding points twice.
- E8. Save and restore progress. Persist checkpoint state, assistance use and completion. Reloading or reconnecting must restore confirmed progress; failed requests must show an honest retry state rather than pretend success.
- E9. Complete the full mission. After one checkpoint works across independent participant sessions, extend the flow to all seven Signal stages and FinishPoint. Save completion once and make the final result available to the results screens.

Phase E is complete when real participants finish the full mission, recover saved progress and receive consistent backend-calculated results.

### Phase F - Live operations and results

- F1. Share current Hunt state. Make participants and organizers read the same start, pause, resume, cancellation and completion state. Begin with simple periodic updates and refresh after actions; do not introduce complex live infrastructure without need.
- F2. Connect the organizer monitor. Replace sample teams, scores and progress with authorized API data. Connect lifecycle controls from C3 and display when information was last updated or the connection was lost.
- F3. Implement persistent help and PANIC. Save the help request and show whether it was received, acknowledged or resolved. Let the organizer respond, support optional location with permission, and show a fallback contact when delivery fails.
- F4. Assign supervisors when needed. Allow the organizer to assign a supervisor to a specific Hunt with limited actions. Confirm which controls they need and prevent access to unrelated Hunts or organization administration.
- F5. Show the leaderboard. Build rankings from saved scores using the agreed tie and visibility rules. Every participant and organizer should see consistent standings appropriate to their permissions.
- F6. Show final results. Display saved completion, participant/team scores and the final ranking. Results must remain stable after refresh and must not depend on browser-only calculations.
- F7. Add special awards after basic results. Define each award's rule and eligibility, then calculate it from saved activity. Do not present sample awards as earned results or create a second scoring system.

Start F1-F3 as soon as enrollment and Hunt state exist. Complete monitoring and help before outdoor testing; basic final results are required for the pilot.

### Phase G - Long term systems and governance

- G1. Build the Hunt Passport. Show a signed-in participant's completed Hunts and earned records from saved results. Keep sample/demo history separate from real participation.
- G2. Build mission history. Let participants revisit completed missions and permitted discoveries. Reuse the stored progress and results, with clear rules about when solutions become visible.
- G3. Add achievements. Define a small set of achievement conditions based on recorded participation. Award each achievement once and show why it was earned.
- G4. Manage organizer rewards. Implement the agreed organizer reward rules and assignment flow. Link awards to saved Hunt results and distinguish configured rewards from rewards actually granted.
- G5. Track physical prizes. Save prize stock, reservations and fulfillment status. Prevent assigning more items than are available and define who may adjust inventory.
- G6. Connect Creator Studio. Save template drafts from the existing creator screens. Support editing, validation and preview without changing templates already used by active Hunts.
- G7. Submit templates for review. Let a creator submit a specific draft version and see its review status. Preserve the submitted version and any requested changes.
- G8. Implement admin approval. Let authorized admins approve, reject or request changes with a reason. Only approved versions should become available for organizer selection.
- G9. Connect the Admin Console. Replace mock administration data with permission-protected functions for users, templates, Hunts and alerts. Record important administrative changes and add controls only as their backend behavior is ready.

Implement Phase G in prioritized small steps after the first complete Hunt is reliable; it remains part of the roadmap.

### Pilot check

Run one organizer and independent participant sessions through create, join, start, play, help and results on the intended phones. Record problems and resolve blockers before expanding the feature set.

## 8. First milestone - Real login

Phase A completion: a real user opens the deployed website, signs in through the backend, accesses an allowed screen, stays identified after reload, and signs out. No part of this path is simulated.

```text
Open website -> Sign in -> Backend checks account
             -> Allowed screen -> Reload -> Sign out
```

Phase A is not complete until it is validated on the real deployed FE/BE environment.

## 9. Frontend migration principle

The FE already contains useful mock data and prototype behavior under src/data and related components.

Do not remove all mock data at once.

For each feature:

```text
Existing screen -> Working API -> Saved PostgreSQL data
                -> Connect screen -> Test deployed result
```

This lets the prototype remain visually usable while simulated behavior is progressively replaced with real behavior.

## 10. Backend development principle

Keep the existing Express, PostgreSQL and JWT foundation. Improve the parts that need repair without replacing the whole backend.

For every database-backed feature:

```text
Define the small change -> Record the migration
                       -> Add API and tests
                       -> Connect the FE
                       -> Verify saved results
```

Do not change database tables manually without recording the same change in the backend repository. Check a backup before the first migration.

## 11. Tedix account linkage

Current participant login accepts a tedixUserId without verifying proof from Tedix. That shortcut must be disabled or corrected before real use.

Tedix account linking remains planned. A supplied user ID alone must not grant access.

Add verified Tedix sign-in later around the same PostgreSQL user account. Do not create a second identity system.

For the first Hunt, agree a normal participant login or a recoverable guest session. The current guest token lasts one hour, shorter than the mock setup duration of 90 minutes.

## 12. Development / review workflow

1. Define the next small step and its completion check.
2. Review the latest code and existing work before making changes.
3. Confirm any product decision needed for this step.
4. Prepare a short implementation task using the existing structure.
5. Implement on a dedicated branch; use simple code and short comments for important rules.
6. Run the relevant build and tests; review the actual changes.
7. Correct issues and document any database migration or recovery step.
8. Merge through the agreed team process and check the deployed result.
9. Continue only when the step works, or record a focused correction task.

## 13. Definition of a good implementation step

- Small enough to understand in one review.
- Has explicit acceptance criteria.
- Starts from the actual current repository state, not an assumed blank architecture.
- Touches only the repository or repositories required for that step.
- Includes tests where backend behavior or critical frontend logic changes.
- Builds successfully before PR creation.
- Can be verified on the deployed site whenever it creates visible behavior.
- Preserves useful existing structure.
- Removes legacy/mock behavior only when its replacement is ready.
- Leaves the code easy for the dev team to read, with comments explaining non-obvious decisions.

## 14. Codex prompt guardrail

Every implementation prompt should include this rule:

Implement only this step. Keep the existing structure, avoid unnecessary abstractions, and use short, readable code. Add comments for business rules, permission checks and important database behavior. Do not refactor unrelated modules.

## 15. Immediate next step

A1 - Confirm the deployed setup is the immediate next step. Resolve the website/code mismatch and confirm the backend database connection before making feature changes.

After that:

1. Complete A2-A4: tracked database changes, user validation and the required backend login fixes.
2. Complete A5-A6: connect the frontend API client and real login screens to the current backend.
3. Verify the complete deployed login path:

```text
FE -> BE -> PostgreSQL -> authenticated FE session
```

Then add permissions and one working Hunt. Proposed first pilot: Signal Cluj Napoca, four-person teams and one difficulty level. Confirm these choices before gameplay implementation.

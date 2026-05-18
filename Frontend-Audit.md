# SAMA Front-End Audit

> Cross-references the **updated PRD** (`SAMA-PRD-v1.md`) against the **current prototype** in `sama-prototype/lib/*.jsx`. Status per piece:
>
> - ✅ **MATCHES** — exists in code and aligns with PRD intent
> - 🟡 **STUB** — exists but is placeholder/display-only/missing key states
> - 🟠 **NEEDS REWORK** — exists but contradicts current PRD (wrong model, wrong terminology, missing transitions)
> - 🔴 **MISSING** — not in code at all
>
> Priority labels at the end of items: `[P1]` = build first per the user's priority (Hub → Student Portal → Clubs), `[P2]` = next, `[P3]` = later.

---

## 0. Cross-cutting state-machine reality

The prototype's `store.jsx` models activity lifecycle as:

```
Draft → Pending Approval → Active → Completed / Rejected / Cancelled
```

The updated PRD models:

```
Draft → Submitted → (Phase 1: Coord Approved) → Active/Published
  → Completed → Submitted for Closure → Closed → Archived
  ↕ Postponed   ↕ Reopen
```

**Implication:** before any closure / postpone / reopen / two-step-club work begins, `store.jsx` and `data.jsx ACTIVITIES[*].status` need new states added, plus the `coordinator_approval_phase` field. Several missing pieces below assume this happens.

Same for **terminology**: PRD §3 (BR-CL19) renames "Club Leader" → "Club President". Prototype uses "Club Leader", "Vice", "Secretary", "Leader" everywhere. Global rename pass needed.

---

## 1. SAMA (staff tool)

### 1.1 Shell & navigation (`shell.jsx`, `app.jsx`)

| Item | Status | Notes |
|---|---|---|
| Sidebar with primary + secondary nav | ✅ | Good shape. |
| Top bar (search, semester picker, notifs) | ✅ | Solid. |
| Command palette (⌘K) | ✅ | `command.jsx` + `CMD_ITEMS` in data. |
| Role switcher (Ops / Coord / Club / Student) | 🟠 | Uses 4 roles; PRD has Manager / Coordinator / Club Coordinator / Club Advisor / Employee / Nurse / Counselor / Club President / Student. Need to expand. **[P3]** |
| Tweaks panel (accent, density, role) | ✅ | Fine for prototype. |
| **Settings entry in sidebar** | 🔴 | `CMD_ITEMS` has `go-settings` but `app.jsx` has no route handler. Sidebar omits it. **[P2]** |
| **Surface chooser for dual-role users** (§2.5 part-time student/staff) | 🔴 | Not present. **[P3]** |
| Notification drawer | 🟡 | Static; PRD wants per-category opt-out + quiet hours + undelivered surface. **[P3]** |
| Toasts | ✅ | Fine. |

### 1.2 Activity Hub (`hub.jsx`)

| Item | Status | Notes |
|---|---|---|
| Header + saved views + filters + sort | ✅ | Solid. |
| List / Board / Calendar / Timeline layouts | ✅ | All present, good variety. |
| Type filter (Event/Program/Volunteering/Task/External) | 🟠 | PRD uses Event / Program / Workshop / Campaign; prototype uses Event / Program / Volunteering / Task / External. **Decide:** are these your real types, or align with PRD? **[P1]** |
| Saved views: All / Mine / Pending / This week / At risk | ✅ | Good shape, but `mine` count is hardcoded; needs to derive from role. **[P1]** |
| Bulk actions bar (Duplicate, Archive, Reassign, Export) | 🟡 | UI exists; no real wiring. PRD wants bulk approve / bulk attendance / bulk email. **[P1]** |
| **Ready-to-complete badge** for InProgress activities past `end_at` (§14.1, BR-CLS1) | 🔴 | Hub doesn't surface this. **[P1]** |
| **Pending closure widget** for Manager (§14.1) | 🔴 | Not present. **[P1]** |
| **Postponed state** filter | 🔴 | State doesn't exist in model yet. **[P1]** |
| **Submitted for Closure** filter | 🔴 | State doesn't exist. **[P1]** |
| **Off-campus indicator** on rows | 🔴 | `is_off_campus` field doesn't exist on activities. **[P1]** |
| Calendar — month/week/day toggle | 🟡 | Toggle exists, only month is rendered. **[P3]** |
| Calendar — overlay current selected semester | 🟠 | Hardcoded October 2025. **[P3]** |
| Inline create from board column (+ button) | 🔴 | Button is decorative. **[P3]** |
| Drag-to-reorder / drag-between-columns on board | 🔴 | Not implemented. **[P3]** |
| Conflict-warning row indicators (e.g. dual-booked venue) | 🔴 | Not surfaced. **[P3]** |

### 1.3 Activity Create (`create.jsx`)

| Item | Status | Notes |
|---|---|---|
| Type picker (5 types) | 🟠 | Same type set mismatch as hub. **[P1]** |
| Title + tags | ✅ | OK. |
| Logistics block (date/time/venue/capacity) | ✅ | OK for single-session. |
| Program block — sessions generator with holiday-aware preview | 🟡 | Shows "28 sessions generated" but isn't editable; no real session list. PRD §6.1 needs an inline session editor. **[P1]** |
| Volunteer block | ✅ | OK. |
| Task block | ✅ | OK. |
| External block | ✅ | OK. |
| **Eligibility rules editor** (year / program / gender / custom) (§6.1, BR-LC6, BR-SP8) | 🔴 | Entirely missing. **[P1]** |
| **Prerequisites picker** (prior-activity-must-be-Completed) (§4.2) | 🔴 | Missing. **[P3]** |
| **Cancellation policy chooser** (no-cancel / anytime / deadline / deadline+late-request) (BR-CX1) | 🔴 | Missing. **[P1]** |
| **Registration window** (open/close dates) | 🔴 | Mentioned in copy, but no fields. **[P1]** |
| **Public catalog toggle** `is_public` (BR-AC2) | 🟡 | "Public on student portal" toggle exists but doesn't differentiate full vs public-minimal view. **[P3]** |
| **Self check-in toggle** `self_checkin_enabled` + rotating QR + time window (BR-AC1) | 🔴 | Only an Event-level QR toggle exists. **[P3]** |
| **Per-session sign-up & per-session capacity toggles** (§7.4, BR-CX7–11) | 🔴 | Missing. **[P2]** |
| **Sign-up flow** (`register_first` / `signup_first`) (BR-CX10) | 🔴 | Missing. **[P2]** |
| **Application form builder** (1–5 questions, types) for `requires_approval` (BR-CX4) | 🔴 | Missing. **[P1]** |
| **Reapply policy selector** (unlimited / one_retry / final) (BR-CX5) | 🔴 | Missing. **[P1]** |
| **`requires_approval` toggle** | 🟡 | Implicit on a few seeded activities; no UI surface to set. **[P1]** |
| **Allow-guest-registration toggle** + public URL preview (§7.1.6) | 🔴 | Missing. **[P3]** |
| **Off-campus toggle + trip classification + nearest hospital + Lead Supervisor** (§4.17) | 🔴 | Entirely missing. **[P2]** |
| **Survey gating + issuance mode** independent per-activity settings (§9.2) | 🔴 | Missing (a single "auto post-event actions" lumped toggle exists). **[P2]** |
| **`cert_hours` field with auto-calc default** (§9.1.1) | 🔴 | Missing. **[P3]** |
| **Sponsoring club selector** | 🔴 | Missing. **[P2]** |
| **Static reminder banner** for club submissions (BR-CL27 — "3 weeks if budgeted, 2 weeks otherwise; receipts within 5 working days") | 🔴 | Missing. **[P3]** |
| Live preview pane + flow steps + auto-checks card | ✅ | Great touch; just makes auto-checks decorative. |

### 1.4 Activity Detail (`detail.jsx`)

#### Tabs present

| Tab | Status | Notes |
|---|---|---|
| Overview | ✅ | Good shape; lifecycle timeline uses old state names — extend for new states. **[P1]** |
| Registrations (Event) | 🟡 | Static rows; needs Pending state, rejection reason, application-answer drill-in, guest distinction. **[P1]** |
| Check-in (QR) | 🟡 | Rotating-QR visual + feed look great; need student photo next to scan (§4.1), `payment_required_to_attend` block, override flow. **[P2]** |
| Sessions (Program) | 🟡 | Lists sessions; missing per-session capacity + sign-up + walk-in counts (§7.4 four counts). **[P2]** |
| Roster (Program) | 🟠 | Aliased to `RegistrationsTab`; same shape; no roster-specific actions (assign jersey, kit issued, etc. per §12 sports roster). **[P3]** |
| Attendance (Program) | 🟡 | Grid is purely visual — clickable, edit window, audit on changes (BR-AT6) missing. **[P2]** |
| Applicants (Volunteering) | 🟡 | Shows confirmed; no application queue, no approve/reject/reapply UI. **[P1]** |
| Hours & certs (Volunteering) | 🟡 | OK at glance; cert issue button is decorative. |
| Logistics | 🟡 | Hardcoded; no real edit. |
| Comms | 🟠 | Read-only log. PRD §6.7 needs **Announcements composer + history + delivery counts** AND **internal Briefing Notes** as separate sections. **[P1]** |
| Documents | 🟡 | Static grid; PRD §10 (Features) defines doc types, version history, internal-only flag, finance-only visibility, scan status. **[P3]** |
| Feedback | 🟡 | Shows aggregate; no custom-question editor, no survey question library picker, no anonymous-comments stream. **[P2]** |
| Subtasks (Task) | ✅ | OK. |
| Activity log | 🟡 | Static; needs to read from actual history + audit events. **[P3]** |

#### Tabs missing entirely

| Tab | Status | Notes |
|---|---|---|
| **Budget** | 🔴 | `budget.jsx` exists with a complete simple/detailed implementation but **is not wired into Detail's tab set**. Wire it in. Also needs role-gating (Club President write only in Draft). **[P1]** |
| **Checklist** (§4.17 ChecklistItem, BR-TR12) — system-suggested + custom items | 🔴 | Missing. **[P2]** |
| **Risk Assessment (Appendix A)** for off-campus | 🔴 | Missing. **[P2]** |
| **HSE compliance panel** for off-campus | 🔴 | Missing. **[P2]** |
| **Trip consent form** monitor (count submitted/missing) | 🔴 | Missing. **[P2]** |
| **Post-event report** (incident log + logistics) (§14.7) | 🔴 | Missing. **[P2]** |
| **Follow-up tasks** (§4.14, BR-PE7) | 🔴 | Missing. **[P3]** |
| **Media gallery** (§14.4) | 🔴 | Missing. **[P3]** |

#### Top-bar actions

| Action | Status | Notes |
|---|---|---|
| Submit / Approve / Reject / Request changes | ✅ | Works via store. |
| **Mark as completed** (Step 1 of two-step closure) | 🟡 | Action exists (`markComplete`); transitions go directly to `Completed`. Needs to also dispatch surveys + lock attendance window + open post-event window per §14.1. **[P1]** |
| **Submit for closure** (Step 2) | 🔴 | Doesn't exist. **[P1]** |
| **Manager Close** + **Reject closure** (Step 3) | 🔴 | Doesn't exist. **[P1]** |
| **Postpone** with reason → Postponed state | 🔴 | Doesn't exist. **[P1]** |
| **Re-activate from Postponed** | 🔴 | Doesn't exist. **[P1]** |
| **Reopen** with reason (Scenario M, BR-PE2) | 🔴 | Doesn't exist. **[P1]** |
| **Clone activity** (Scenario N, BR-PE8) | 🟡 | "Duplicate" button exists but doesn't actually clone-with-defaults. **[P2]** |
| Cancel with reason | 🟡 | Action exists; reason capture missing in UI. **[P2]** |
| Capacity raise/lower with demotion behaviour (Scenario F, BR-R7) | 🔴 | Missing entirely. **[P2]** |
| Edit eligibility post-publish (grandfather warning) | 🔴 | Missing. **[P2]** |

### 1.5 Approvals (`approvals.jsx`)

| Item | Status | Notes |
|---|---|---|
| Inbox with Pending / Approved / Rejected segmented | ✅ | Good. |
| Detail pane with auto-checks card | ✅ | Decorative but useful framing. |
| Approve / Reject (with reason) / Request changes | 🟡 | Reason and request-changes note are hardcoded strings — need UI capture. **[P1]** |
| **Two-step club approval** (Phase 1: Club Coordinator → Phase 2: Manager) (§6.2.2, §10.4) | 🔴 | Approvals only models the single Manager step. **[P1]** |
| **Tag by sponsoring club** in inbox (BR-CL15) | 🔴 | Missing. **[P1]** |
| **Manager override of Phase 1** (BR-CL3) | 🔴 | Missing. **[P1]** |
| **Phase-1 rejection** returning to Draft; **Phase-2 rejection** returning to Submitted with `coordinator_approval_phase = coordinator_approved` (BR-CL16) | 🔴 | Missing. **[P1]** |
| **Budget change request items** in same inbox (§12.7, BR-B10) | 🔴 | Missing. **[P2]** |
| **HSE acknowledgment items** (BR-TR4) | 🔴 | Missing. **[P2]** |
| **Profile photo moderation items** (§15a.2) | 🔴 | Could live here or in Settings. **[P3]** |
| **Club formation requests** queue (§10.1, BR-CL9) | 🔴 | Missing. **[P1]** |
| **Club reactivation nominations** queue (§10.1, BR-CL20) | 🔴 | Missing. **[P1]** |
| **Club metadata change requests** queue (§10.7) | 🔴 | Missing. **[P2]** |

### 1.6 Budget (`budget.jsx`)

| Item | Status | Notes |
|---|---|---|
| Six stat cards (Planned / Approved / Spent / Remaining / Expected / Received) | ✅ | Excellent. |
| Empty state with simple vs detailed mode picker | ✅ | Excellent. |
| Detailed mode line items (Uni / Student / Split) | ✅ | Excellent. |
| Simple mode | ✅ | Solid. |
| Expense transactions CRUD | ✅ | Good. |
| Income transactions (system-generated, read-only) | ✅ | Properly modelled. |
| Revenue section (Expected / Received / Pending) | ✅ | Good. |
| PRF reminder banner (§12.8, BR-B15) | ✅ | Present. |
| Registration-fee mismatch warning (BR-B8) | ✅ | Present. |
| 80% near-limit warn + over-budget alert (BR-B7) | ✅ | Present. |
| Budget change request submit + inline banner (§12.7, BR-B10) | ✅ | Present; Manager approve/reject inline works. |
| Category spend breakdown bars | ✅ | Nice. |
| **Wired into Activity Detail as a tab** | 🔴 | The component exists but isn't reachable from a detail page. **[P1]** |
| **Role gating** — Club President writes only in Draft (BR-B12a); Coordinator in Draft + Submitted (BR-B12b) | 🟡 | Component is role-aware in places (`isManager` for approval) but not gated on activity state for writers. **[P2]** |
| Budget mode switch detailed → simple confirmation modal (§6.1) | 🟡 | Switch link is decorative. **[P3]** |
| Receipts on transactions (BR-B6) | 🔴 | Receipt-upload UI absent. **[P3]** |
| Locking behaviour at Closed state (BR-LC2) | 🔴 | No Closed state exists yet. **[P1]** depends on lifecycle work. |

### 1.7 Clubs module (`clubs.jsx`)

| Item | Status | Notes |
|---|---|---|
| Sidebar list of clubs with filter + search | ✅ | Good. |
| Club detail header + tabs (Overview / Members / Activities / Pending requests) | ✅ | Good base. |
| Pending membership requests with approve/decline | ✅ | Works. |
| Member roster table with role chips | ✅ | OK. |
| Activities-by-club table | ✅ | OK. |
| Suspend club button | 🟡 | Decorative; needs Coord-initiated → Manager-confirms flow (BR-CL10). **[P2]** |
| **Club categories** (Cultural / Special Interest / Sports / Community & Social Responsibility + custom) (BR-CL18) | 🟠 | Current categories are "Academic / Cultural / Sports / Career / Service". Need to align + add custom-category management. **[P1]** |
| **`Club Leader` → `Club President`** terminology rename (BR-CL19) | 🟠 | "Leader" used throughout (sidebar, header, role chips, mock data field name). **[P1]** |
| **UDSU as `is_union = true`** with extended role set (President / VP / Treasurer / Secretary / 4 College Reps / Events Officer / Media Officer) (§10.1, BR-CL17) | 🔴 | Not modelled. **[P1]** |
| **New club formation request submission** from Student Portal + Manager review (§10.1, BR-CL9) | 🔴 | Missing on both surfaces. **[P1]** |
| **Annual reactivation window opener** (DSS sets dates) (BR-CL20) | 🔴 | Missing. **[P1]** |
| **Reactivation nominations queue** with conflict resolution (BR-CL20) | 🔴 | Missing. **[P1]** |
| **Inactive club status + reactivate action** | 🔴 | All seeded clubs are Active. **[P1]** |
| **Board acknowledgment status log** (§10.11, BR-CL26) | 🔴 | Missing. **[P1]** |
| **Board-eligibility advisory panel** (GPA + credits from SIS + cross-club warning) (BR-CL22) | 🔴 | Missing. **[P1]** |
| **GPA-drop notification surface** for Coord + Manager (BR-CL23) | 🔴 | Missing. **[P2]** |
| **Club name reservation soft warning** (BR-CL21) | 🔴 | Missing. **[P2]** |
| **Min-5-members soft warning** (BR-CL24) | 🔴 | Missing. **[P2]** |
| **48h regular-member pending-removal-review** (BR-CL25) | 🔴 | Missing. **[P2]** |
| **Club Coordinator / Club Advisor many:many assignment UI** (§10.1) | 🔴 | Currently a single hardcoded `advisor` string per club. **[P1]** |
| **External advisor as free-text name + email** (§10.1) | 🟡 | `advisor` string exists, no email/external flag. **[P2]** |
| **Committees CRUD** (§4.5, §10.3) | 🔴 | Missing. **[P3]** |
| **Club annual summary export** (§10.12) | 🔴 | Missing. **[P2]** |
| **Club metadata change-request inbox** (Manager-side) (§10.7) | 🔴 | Missing. **[P2]** |
| **Suspend / Archive** flows (BR-CL10) | 🟡 | Buttons present, no real flow. **[P2]** |
| **Membership history (alumni view)** (§10.2) | 🔴 | Missing. **[P3]** |
| **Recurring meetings as Program-per-term** auto-creation helper (§10.5) | 🔴 | Missing. **[P3]** |

### 1.8 Welfare — Health (`health.jsx`)

| Item | Status | Notes |
|---|---|---|
| Header stats + 4 tabs (Visits / Injuries / Appointments / Records) | ✅ | Good base. |
| Visits table with walk-in / scheduled / follow-up filters | ✅ | OK. |
| Injuries (not in PRD as separate; could fold under Visits) | 🟠 | Useful UI but extends PRD. Could rebrand as "Visit log — injury type". **[P3]** |
| Appointments with reschedule + cancel modals | ✅ | Good. |
| Records — student-level health profile | 🟡 | UI exists; PRD distinguishes **`health_notes` flags** vs **medical declaration from consent form** vs **visit-log content** with different visibility rules (§4.7, §11.2). The Records tab conflates these. **[P2]** |
| **Slot creator** (recurring + one-off) (§11.1) | 🔴 | Missing. **[P2]** |
| **Walk-in visit log creation form** with referral + follow-up flag (§4.7) | 🔴 | "Log visit" button is decorative. **[P2]** |
| **Per-record audit-trail surface** (BR-WF2 — read logged) | 🔴 | Missing. **[P3]** |
| **Permission-matrix-aware visibility** of cross-track records (§11.0) | 🔴 | Records are open to all of `health` role today. **[P2]** |
| **Welfare export with reason** (Manager only) (§11.3) | 🔴 | Missing. **[P3]** |
| **Manual sync of medical declaration from Trip Consent Form** (BR-TR7) | 🔴 | Missing. **[P2]** |

### 1.9 Welfare — Counseling (`counselor.jsx`)

| Item | Status | Notes |
|---|---|---|
| 4 tabs (Sessions / Cases / Appointments / Files) | ✅ | Good base. |
| Sessions log + cases with priority chips | ✅ | OK. |
| Appointments with reschedule + cancel | ✅ | OK. |
| Confidential file viewer with intake + treatment plan + recent session notes | 🟡 | Strong UI. PRD constraints: notes visible to assigned counselor + Manager; every read audit-logged (BR-WF2). Not enforced. **[P2]** |
| **Note creation form (CounselingNote with body + attachments)** (§4.6) | 🔴 | "Log new session" button is decorative. **[P2]** |
| **Slot creator** | 🔴 | Missing. **[P2]** |
| **Permission-matrix-aware visibility** of health records | 🔴 | Missing. **[P2]** |
| **Manager view + audit trail** | 🔴 | Missing. **[P3]** |

### 1.10 Welfare — Cross-module

| Item | Status | Notes |
|---|---|---|
| **Permission matrix editor** (`none` / `summary` / `view` / `manage` per role per module) (§11.0) | 🔴 | The single biggest welfare gap — without it welfare is policy-incomplete. Lives in Settings → Modules or its own screen. **[P2]** |
| **Future Welfare service types** (Housing etc.) — deferred to V2 per §11.0 | n/a | Out of scope, ignore. |

### 1.11 Reports (`reports.jsx`)

| Item | Status | Notes |
|---|---|---|
| Stat row + trend chart + mix chart + 3 cards | ✅ | Good summary dashboard. |
| **Pre-built dashboards per role** (Manager / Coordinator / Employee / Student) (§15.2) | 🟠 | Only one dashboard; doesn't switch on role. **[P3]** |
| **Custom report builder** (entity scope + filters + group-by + save + schedule) (§15.2) | 🔴 | "New report" button is decorative. **[P3]** |
| **Scheduled reports manager** | 🔴 | Missing. **[P3]** |
| **Budget reports** — department-wide spend (§12.10) | 🟡 | One budget card; no drill-in. **[P3]** |
| **Welfare load report** (counts only) | 🔴 | Missing. **[P3]** |
| **Undelivered notifications report** (§15.1) | 🔴 | Missing. **[P3]** |
| **No-show high-rate students** custom report (Scenario G) | 🔴 | Missing. **[P3]** |
| **Survey results aggregate + comments** drill-in per activity | 🟡 | Only on activity Detail's Feedback tab. **[P3]** |
| **Anonymous response CSV export** | 🔴 | Missing. **[P3]** |
| **Semester comparison** report | 🔴 | Missing. **[P3]** |

### 1.12 Notifications (`notifications.jsx`)

| Item | Status | Notes |
|---|---|---|
| Inbox list with kind icons + read/unread | ✅ | Good shape. |
| Mark all read / Preferences buttons | 🟡 | Both decorative. **[P3]** |
| **Per-category opt-in/out preferences** screen (§15.1, §4.9) | 🔴 | "Preferences" doesn't navigate anywhere. **[P3]** |
| **Quiet hours per user** | 🔴 | Missing. **[P3]** |
| **Failed-email "could not be delivered" indicator** on a notification | 🔴 | Missing. **[P3]** |
| **Drillable per-notification delivery status** | 🔴 | Missing. **[P3]** |
| Drawer in `app.jsx` for at-a-glance unread | ✅ | Good. |

### 1.13 People Registry (`people.jsx`)

| Item | Status | Notes |
|---|---|---|
| Students / Staff / Partners segmented | ✅ | OK. |
| Search + list + detail pane | ✅ | OK. |
| Transcript modal with 2-step wizard + preview + download | ✅ | Excellent. |
| **Profile photo source / moderation status** on student detail (§4.1) | 🔴 | Missing. **[P2]** |
| **Photo moderation queue** (also in Settings) (§15a.2) | 🔴 | Missing. **[P2]** |
| **Health-flag alert** with permission gating (§4.7) | 🔴 | Missing. **[P2]** |
| **Welfare summary** read from matrix (§11.4) | 🟡 | Engagement spark exists; no welfare context. **[P2]** |
| **SIS-sync metadata** (last sync, status, enrolment status) (§4.16) | 🔴 | Missing. **[P3]** |
| **Manual CSV import** for student fallback (§4.16, BR-ON1) | 🔴 | "Import" button on Hub is decorative. **[P2]** |
| **Inactive-owner nag widget** on Manager dashboard (§15.10) | 🔴 | Missing. **[P3]** |
| **Partners tab** content | 🟡 | Tab exists, no list. **[P3]** |
| **Issue certificate** action | 🟡 | Button decorative. **[P3]** |

### 1.14 Off-campus & risk compliance (NEW — §4.17, §6.8, BR-TR1–12)

**Entirely missing surface area** — none of these exist:

| Item | Status | Notes |
|---|---|---|
| `is_off_campus` toggle in Create | 🔴 | **[P2]** |
| Trip classification (domestic_day / domestic_overnight / international) | 🔴 | **[P2]** |
| Nearest hospital field | 🔴 | **[P2]** |
| Lead Supervisor reassignment | 🔴 | **[P2]** |
| **Risk Assessment form (Appendix A)** — 7 hazard rows + 4 contingency confirmations + declaration + Manager countersign, printable PDF | 🔴 | **[P2]** |
| **HSE trigger summary panel** — auto-evaluates 4 conditions, shows `hse_sign_off_status` | 🔴 | **[P2]** |
| Supervision-ratio real-time soft warning (1:25 / 1:15) | 🔴 | **[P2]** |
| HSE delinquency banner (Day 1/3/5 escalation) | 🔴 | **[P3]** |
| **Manager HSE-acknowledgment screen** with high/catastrophic override-reason gate | 🔴 | **[P2]** |
| Linked Appendix A + EHS form combined view for Manager final approval | 🔴 | **[P2]** |

### 1.15 Settings (NEW — §15a, BR-SET1–8)

**Entirely missing top-level surface.** Sidebar has no entry. Each of the 8 tabs is missing:

| Tab | Status | Notes |
|---|---|---|
| **Settings page shell** (8-tab top bar) | 🔴 | Build first as router target. **[P2]** |
| 1. General — university name, logo, timezone, currency, locale, support email | 🔴 | **[P2]** |
| 2. People & Roles — staff CRUD, role assignment, delegation, student roster, SIS sync, photo moderation | 🔴 | **[P2]** |
| 3. Modules — enabled module list (read-only), per-module config | 🔴 | **[P2]** |
| 4. Notifications — sender identity, template overrides, quiet hours, channel defaults, undelivered link | 🔴 | **[P3]** |
| 5. Academic Calendar — semesters CRUD, holidays, volunteer-hours target, cert year label | 🔴 | **[P2]** |
| 6. Certificates — template editor, numbering, types, default gating + issuance mode | 🔴 | **[P2]** |
| 7. Integrations — SIS / Finance / SSO / Email / Push status + manual SIS sync | 🔴 | **[P3]** |
| 8. Audit Log — searchable viewer + CSV export | 🔴 | **[P2]** |
| Delegated-tab access UX (Manager grants Coord access per-tab) (BR-SET1) | 🔴 | **[P3]** |

### 1.16 Cross-cutting (Manager governance)

| Item | Status | Notes |
|---|---|---|
| **Audit Log viewer** — full / searchable / filterable / CSV export (§15.4, §15a.8) | 🔴 | Lives in Settings → Audit Log. **[P2]** |
| **Deleted items view** — all entity types incl. welfare, with Restore (§15.11, BR-RET3) | 🔴 | **[P2]** |
| **Soft-delete reason capture modal** (§15.11) | 🔴 | **[P2]** |
| **Optimistic-lock conflict modal** with field-by-field diff (§15.9, BR-CC1) | 🔴 | **[P3]** |
| **Welfare export-with-reason** | 🔴 | **[P3]** |
| **In-app inbox surface for failed-channel notifications** (§15.1) | 🔴 | **[P3]** |
| Public catalog (per BR-AC2 — logged-out-friendly view) | 🔴 | **[P3]** |

### 1.17 Modules folder (`modules.jsx` — Transport / Documents / Certificates / Feedback / Venues)

| Module | Status | Notes |
|---|---|---|
| Transport | 🟡 | Decent UI; PRD §8 (Features) wants vehicle conflict detection on plate + auto-passenger draw from activity confirmed list + status tracking. Mostly decorative. **[P3]** |
| Documents | 🟡 | Folders + recent files; needs document types per PRD §10 (Features), version history, internal-only/finance-only/public visibility, scan status. **[P3]** |
| Certificates | 🟡 | Template preview is great; needs issuance-mode mgmt, revoke, regenerate, verification-code search. **[P3]** |
| Feedback | 🟡 | Aggregate-survey overview; needs Survey Question Library (Manager-curated, versioned) (§14.3), per-activity custom question builder, dispatch tracking, anonymous-comment moderation hide-with-reason. **[P2]** |
| Venues | 🟡 | Decorative; needs conflict-detection on booking. **[P3]** |

---

## 2. Student Portal (`student.jsx` — `WebPortal`)

### 2.1 Standard 6 tabs

| Tab | Status | Notes |
|---|---|---|
| Home (featured + upcoming + cert + stats) | ✅ | Good. |
| Explore (filter + grid + self-report for External) | 🟡 | Needs eligibility filtering (BR-SP6/8), registration-deadline gating (BR-SP7), conflict warning (BR-R4). **[P1]** |
| My Activities (registered + completed + waitlist-offer banner + cancel + feedback) | ✅ | Excellent. |
| Volunteering (opportunities + hours-toward-target + recent) | ✅ | Good; target is hardcoded — wire to system setting (BR-SP12). **[P1]** |
| Certificates (issued + download + share + serial) | 🟡 | Needs **survey-gate "submit feedback to unlock"** state explicit (§14.3, §13.6) and **30-day auto-unlock** notice. **[P1]** |
| Clubs (My clubs + Discover + Apply-to-join modal) | ✅ | Solid base. |

### 2.2 Workspace tab (Club Officers) — `WebWorkspace`

| Item | Status | Notes |
|---|---|---|
| Multi-club switcher | ✅ | Good. |
| Members (with pending applications + approve/decline inline) | ✅ | Good. |
| Activities (request list + status timeline) | ✅ | Good. |
| Submit activity request modal (title / type / date / desc / attendees) | ✅ | Matches BR-SP24 minimum fields. |
| Announcements (composer + history) | ✅ | Good — in-app only per BR-SP23. |
| Budget (read-only summary) | ✅ | Good. |
| Club info (with "Propose change" per field) | ✅ | Good — matches §10.7. |
| **Withdraw submission during Phase 1 only** (BR-LC7) | 🔴 | No withdraw action on a request. **[P1]** |
| **Status timeline** showing Draft → In coord review → Pending mgr approval → Approved/Rejected | 🟡 | Status pill yes, full timeline no. **[P1]** |
| **Membership-app auto-decline after 14d** indicator (BR-SP22) | 🔴 | Missing. **[P2]** |
| **Leadership transition gate** — sole leader can't leave (BR-SP21) | 🔴 | Missing. **[P2]** |

### 2.3 Student Portal — additions missing

| Item | Status | Notes |
|---|---|---|
| **Board acknowledgment modal** locking Workspace until signed (§10.11, BR-CL26) | 🔴 | Workspace currently unlocks without acknowledgment. **[P1]** |
| **Club formation request** submission flow (§10.1) | 🔴 | Missing on Clubs tab. **[P1]** |
| **Club reactivation nomination** flow during open window (BR-CL20, §10.10) | 🔴 | Missing. **[P1]** |
| **Trip consent form (Appendix B)** embedded in registration step for off-campus (§4.17, BR-TR6) | 🔴 | Missing — emergency contacts, medical declaration, liability waiver, code of conduct. **[P2]** |
| **International insurance upload** required for `trip_classification = international` (BR-TR8) | 🔴 | Missing. **[P2]** |
| **Pre-populated health flags acknowledgment** with read-only "updates via clinic only" notice (round 35 Gap 4) | 🔴 | Missing. **[P2]** |
| **Welfare booking** (Counseling + Health slot picker → confirm) | 🔴 | Entirely missing. **[P2]** |
| **Welfare summary in profile** — past appts, upcoming with actions (§11.4) | 🔴 | Missing. **[P2]** |
| **Profile photo upload + moderation status badge** + one-click revert to feed (§4.1) | 🔴 | Missing. **[P2]** |
| **Per-category notification preferences** + quiet hours (§15.1) | 🔴 | Missing. **[P3]** |
| **On-demand transcript PDF** download by the student (BR-SP18) | 🔴 | TranscriptModal in `people.jsx` is staff-side. Student needs their own. **[P1]** |
| **Per-session sign-up / un-sign-up** for programs (§7.4, BR-CX11) | 🔴 | Missing. **[P2]** |
| **Late-cancellation request** (with reason) when policy = deadline + late-request (§7.2) | 🔴 | Missing. **[P2]** |
| **Application form** at registration for `requires_approval` activities (BR-CX4) | 🔴 | Missing. **[P1]** |
| **Rejection reason** display in registration history + **reapply** button (§7.1.5, BR-CX5) | 🔴 | Missing. **[P1]** |
| **Waitlist offer with countdown** (when window is configured) (BR-SP11) | 🟡 | Static "23 hours" banner exists; no real countdown or branching per `confirmation_window` setting. **[P1]** |
| **Calendar-conflict block message** naming the conflicting activity (BR-R4) | 🔴 | Missing. **[P1]** |
| **Past-activity media gallery archive** (§14.4) browseable by all logged-in students | 🔴 | Missing. **[P3]** |
| **Self-report → Pending verification** state (BR-SP13) | 🟡 | UI says "self-reported"; doesn't model the pending-verification two-state flow. **[P2]** |
| **Reschedule a welfare appointment** by student | 🔴 | Missing (booking missing first). **[P2]** |
| **Reactivation window banner on Clubs tab** | 🔴 | Missing. **[P1]** |
| **Inactive clubs visibility** with "Nominate a team" CTA | 🔴 | Missing. **[P1]** |

---

## 3. HSE Portal (NEW — separate page per user's decision)

**Entirely missing surface.** Recommended as `hse-portal.html` (separate file, shares assets).

| Item | Status | Notes |
|---|---|---|
| SSO landing + queue of pending risk assessments | 🔴 | Show only items where `hse_required = true` AND `hse_sign_off_status = pending` (BR-TR3). |
| Read-only Appendix A viewer linked to each queue item | 🔴 | Pulled from RiskAssessment record. |
| **EHS form** — activity steps with Severity × Probability × controls × residual | 🔴 | Per §4.17 EHSAssessment schema. |
| Residual-risk auto-calc + overall level badge (low / moderate / high / catastrophic) | 🔴 | |
| Submit → status → `submitted`, notification to Manager (BR-TR4) | 🔴 | |
| Returns-to-queue history of submitted forms | 🔴 | |

---

## 4. Guest surface (NEW — magic-link only per user's decision)

**Entirely missing.** Per §7.1.6 — magic-link, no main-app login.

| Item | Status | Notes |
|---|---|---|
| Public guest registration page (signed activity-scoped URL) | 🔴 | Name / email / phone / guest_type + email verification. |
| Email-verification magic-link confirm + delivery of manage-link | 🔴 | |
| Guest "Manage my registration" tokenized page — view, cancel, download cert, paid-status | 🔴 | |
| Staff-side bulk-invite CSV (on activity Roster tab) — pre-create guests + send personalized magic links | 🔴 | |
| Guest count separation in staff roster ("Students: 42 / Guests: 8") | 🔴 | |
| Guest tag/badge in roster + reports | 🔴 | |

---

## 5. Public-unauthenticated pages

| Item | Status | Notes |
|---|---|---|
| **Certificate verification page** — paste code or scan QR, shows status (Valid / Revoked / Superseded) (§9.2, Scenario K) | 🔴 | Critical for external verifiers. **[P3]** |
| **Public catalog view** (title / brief / dates / capacity only) per BR-AC2 | 🔴 | Could be a public route inside Student Portal. **[P3]** |

---

## 6. Mock-data gaps

The seed data in `data.jsx` doesn't yet model:

- `is_off_campus`, `trip_classification`, HSE triggers, Lead Supervisor — on Activity.
- `coordinator_approval_phase` on Activity (for two-step club approval).
- `is_union`, category-as-policy-enum, `advisor_email`, `acknowledgment_signed_at` — on Club.
- `ClubReactivationNomination` table seed.
- Status `Inactive` on any club.
- Cabinet roles (Treasurer, College Reps, Events/Media Officer).
- `health_notes` flags on People.
- `photo_source` / `photo_moderation_status` on People.
- GPA + credit hours on Student (for board eligibility advisory).
- `RiskAssessment` / `EHSAssessment` / `TripConsentForm` records.
- ChecklistItem records.
- FollowUpTask / MediaItem / SurveyDispatch / SurveyResponse / SurveyQuestion library seed.
- `coordinator_approval_phase`, `withdrawn`, `postponed` lifecycle markers.

You will hit these as you build the screens — easiest to grow `data.jsx` incrementally per feature rather than all up front.

---

## 7. Recommended attack order (Hub → Student Portal → Clubs first, per your priorities)

### Wave 1 — Activity Hub + lifecycle realignment (P1)
Goal: get the state machine matching the PRD, then layer the missing Hub & Detail behaviour on top.

1. **State machine update** in `store.jsx` + `data.jsx`: add `Submitted`, `Submitted for Closure`, `Closed`, `Postponed`, `coordinator_approval_phase`. Update existing seeded activities to use new states.
2. **Two-step closure** in Detail: Mark Completed (Step 1) → Submit for Closure (Step 2) → Manager Close (Step 3) with reject-closure-back-to-Completed.
3. **Postpone + Reopen + Clone** actions on Detail header. Postponed filter in Hub.
4. **Ready-to-complete** + **Pending closure** widgets on Home and Hub.
5. **Wire `BudgetTab` into Detail** as a tab.
6. **Approvals** rebuild for two-step club approval: Phase 1 / Phase 2 in inbox, Manager override, rejection-with-reason captured in UI, tag by sponsoring club.
7. **Create flow** additions: eligibility editor, cancellation policy chooser, registration window, application form builder, reapply policy, `requires_approval` toggle.
8. **Application queue** for `requires_approval` activities in Detail.
9. **Comms** rebuild: announcements composer + history + delivery counts; separate Briefing Notes.

### Wave 2 — Student Portal completion (P1)
1. **Trip consent form** (Appendix B) embedded in registration when activity is off-campus — gates registration submission.
2. **Application form** at registration for `requires_approval` activities + rejection reason + reapply.
3. **Calendar-conflict block** message naming the conflicting activity.
4. **Student-side transcript download** (on-demand PDF) — adapt the staff TranscriptModal.
5. **Survey-gated certificate** state explicit + 30-day auto-unlock copy.
6. **Real waitlist countdown** when window is configured + auto-confirm path when not.
7. **Profile photo upload** + moderation status badge + one-click revert to feed.

### Wave 3 — Clubs (P1)
1. **Rename** "Club Leader" → "Club President" globally (UI + data).
2. **Categories rework**: 4 policy categories + custom; Settings entry.
3. **UDSU** as `is_union = true` with extended Cabinet role set; seeded as a club.
4. **Club Coordinator / Advisor many:many assignment** — replace single `advisor` string with assignment lists.
5. **Club formation request** flow: student submits from Portal → Manager queue in SAMA.
6. **Reactivation window opener** in SAMA (Manager) + **Nomination form** in Portal (any student) + **Nominations queue** with conflict resolution.
7. **Board acknowledgment** modal in Portal locking Workspace until signed; status log in SAMA per club per year.
8. **Board-eligibility advisory panel** (GPA + credits + cross-club warning) when assigning to board roles in SAMA.
9. **48h pending-removal-review** state in roster with revoke action.
10. **Soft warnings**: name reservation, min-5-members.

### Wave 4 — Off-campus & HSE compliance (P2)
1. Activity-Create `is_off_campus` + trip classification + nearest hospital + Lead Supervisor.
2. **Risk Assessment (Appendix A) form** as new Detail tab.
3. **Checklist** as new Detail tab (system + custom items).
4. **HSE trigger summary panel** in Detail.
5. **Supervision-ratio warning** in Detail.
6. **Trip consent form** embedded in Student Portal registration (already in Wave 2 — wire to off-campus flag).
7. **HSE Portal** as separate `hse-portal.html` with queue + Appendix A read-only + EHS form.
8. **Manager HSE-acknowledgment screen** with override-reason gate.
9. **Post-event report** form on Detail (off-campus only) with incident log + logistics assessment.

### Wave 5 — Welfare depth (P2)
1. **Welfare permission matrix editor** (in Settings or its own page).
2. **Slot creator** for Counseling + Health.
3. **Walk-in visit log creation form**.
4. **Counseling note creation form**.
5. **Permission-matrix-aware visibility** on Records tabs.
6. **Welfare appointment booking** on Student Portal.
7. **Welfare summary tab** on student profile.

### Wave 6 — Settings + Governance (P2/P3)
1. **Settings page** shell with 8 tabs (start with General + People & Roles + Academic Calendar + Certificates + Audit Log).
2. **Audit Log viewer**.
3. **Deleted items** view with Restore.
4. **Photo moderation queue**.
5. **SIS sync status** panel + **manual CSV import**.
6. **Survey question library** management.
7. **Manager Notifications** templates.
8. **Integrations** status (read-only).

### Wave 7 — Misc polish (P3)
1. Optimistic-lock conflict modal.
2. Custom report builder.
3. Public certificate verification page.
4. Notification preferences (student + staff).
5. Follow-up tasks model + UI.
6. Media gallery (staff upload + student archive).
7. Documents module rework (types + version history + visibility).
8. Inactive-owner nag widget.
9. Surface chooser for dual-role users.

---

## Quick-glance summary

- **Activities lifecycle:** prototype is at "v0 single-approval" — needs full PRD-v1 lifecycle (Submitted, two-step closure, Postponed, Reopen, Phase 1/2 for clubs).
- **Clubs:** rename + UDSU + reactivation + acknowledgment + board eligibility are all missing.
- **Off-campus / HSE:** a complete vertical slice is missing across SAMA, Student Portal, and a brand-new HSE Portal.
- **Welfare:** UI exists per service but the permission matrix and audit foundation are absent.
- **Settings + Audit + Deleted items:** three Manager surfaces completely missing.
- **Student Portal:** strong base; needs consent form, transcript download, board acknowledgment, application form, welfare booking, photo upload.
- **Budget:** the `BudgetTab` is **finished and excellent** — just isn't wired into Detail's tab set.
- **Guest registration + public cert verify:** zero today.

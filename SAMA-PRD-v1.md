# Student Activities Management System — PRD

> Tech-agnostic product requirements document. Focus: features, workflows, business logic, end-to-end scenarios. Implementation phases at the end are high-level only.

---

## 1. Executive summary

A web + PWA platform for a university Student Activities & Welfare department to plan, approve, deliver, and report on student-facing activities and welfare services. It replaces ad-hoc spreadsheets and chat-based coordination with a single source of truth covering:

- Activity lifecycle (events, courses, workshops, campaigns) from idea to certificate
- Student registration, attendance, completion, and certification
- Persistent clubs with rosters and committees
- 1:1 welfare services (counseling appointments, health appointments + walk-in visit logs)
- Budget tracking per activity
- Reports, exports, and a full audit trail

**Primary outcomes**
1. Manager has live visibility into all activity, capacity, attendance, and spend.
2. Coordinators move activities through approval and execution without email chains.
3. Students discover, register, attend, and earn certificates in one place.
4. Sensitive welfare interactions are recorded with proper access control and audit.

---

## 2. Glossary

| Term | Meaning |
|------|---------|
| **Activity** | Any planned offering students can register for: event, course, workshop, or campaign. |
| **Event** | Single-session activity (lecture, ceremony, tournament round). |
| **Course** | Multi-session activity with attendance threshold for completion (e.g. 80%). |
| **Workshop** | Hands-on session, single or multi-day, often with a deliverable. |
| **Campaign** | Awareness/outreach activity (health drive, blood donation, awareness week). May or may not have registration. |
| **Club** | Persistent student-run group with a roster, committees, and activities. |
| **Counseling session** | 1:1 confidential meeting between a student and a counselor (Employee). |
| **Health appointment** | Scheduled 1:1 medical/health visit. |
| **Visit log** | Walk-in (unscheduled) record of a student attending the health office. |
| **Registration** | A student's reserved seat in an activity. |
| **Waitlist** | Ordered queue for full activities; auto-promotes when seats open. |
| **Completion** | Student met the attendance/deliverable threshold for an activity. |
| **Certificate** | Auto-generated PDF issued on completion; verifiable via code/QR. |
| **Approval** | Manager review step that moves a Coordinator-drafted activity to Approved. |
| **Manager** | Department head; full visibility, approval authority, role administration. |
| **Coordinator** | Plans and runs activities; submits for approval; manages own activities. |
| **Employee** | Operational staff: takes attendance, runs sessions, runs welfare services. |
| **Student** | End user who registers for activities and uses welfare services. |

---

## 3. Roles & permissions

Four roles. Permissions are role-based; data scoping (own vs. all) is layered on top.

### 3.1 Role summary

| Role | Scope | Primary responsibilities |
|------|-------|--------------------------|
| **Manager** | Department-wide | Strategy, approvals, budget oversight, reports, role assignment, sees all data including welfare. |
| **Coordinator** | Own activities + assigned clubs | Plan, submit for approval, run, edit, close activities; manage club rosters. |
| **Employee** | Assigned activities/services only | Run sessions, take attendance, conduct counseling/health appointments, log visits. |
| **Student** | Own data | Discover, register, cancel, attend, view history, download certificates, book welfare appointments. |

### 3.2 Permission matrix (high level)

| Capability | Manager | Coordinator | Employee | Student |
|------------|:-:|:-:|:-:|:-:|
| Create activity (Draft) | ✓ | ✓ | – | – |
| Submit activity for approval | ✓ (auto-approved) | ✓ | – | – |
| Approve / reject activity | ✓ | – | – | – |
| Publish activity | ✓ | ✓ (after approval) | – | – |
| Edit activity post-publish (non-budget) | ✓ | ✓ (own) | – | – |
| Edit activity post-publish (budget increase) | ✓ | request → Manager approves | – | – |
| Cancel activity | ✓ | ✓ (own) | – | – |
| Raise/lower capacity | ✓ | ✓ (own) | – | – |
| Take attendance | ✓ | ✓ (own) | ✓ (assigned) | – |
| Issue/regenerate certificate | ✓ | ✓ (own) | – | view/download own |
| View any activity's roster | ✓ | own only | assigned only | – |
| Create/edit club | ✓ | ✓ (assigned) | – | – |
| Manage club roster/committees | ✓ | ✓ (assigned) | – | view own |
| Create counseling appointment slot | ✓ | – | ✓ (own calendar) | – |
| Book counseling appointment | ✓ (on behalf) | – | – | ✓ (own) |
| View counseling notes | ✓ | – | ✓ (own sessions) | – (or own summary, see §11.2) |
| Create health appointment slot | ✓ | – | ✓ (own calendar) | – |
| Book health appointment | ✓ (on behalf) | – | – | ✓ (own) |
| Log walk-in visit | ✓ | – | ✓ | – |
| View health records | ✓ | – | ✓ (own logs) | – (or own summary) |
| Record budget transactions | ✓ | ✓ (own activity) | – | – |
| View budget across all activities | ✓ | own only | – | – |
| View dashboards | ✓ (all) | ✓ (own scope) | ✓ (own scope) | ✓ (own profile) |
| Build custom reports | ✓ | – | – | – |
| Export CSV/Excel/PDF | ✓ | ✓ (own scope) | ✓ (own scope) | own data only |
| View audit log | ✓ | – | – | – |
| Assign roles | ✓ | – | – | – |

### 3.3 Notes
- **Manager-as-Coordinator**: Manager can author activities directly. Their submissions auto-approve (no self-approval bottleneck).
- **Employee assignment**: Employees are linked to specific activities or welfare services. They see only what they're assigned to.
- **"Own" scoping** for Coordinators is per-activity ownership (creator + co-coordinators) and per-club assignment.
- **Student "view own"**: students always see their own registrations, attendance, certificates, appointments, and visit summaries.

---

## 4. Domain model

Tech-agnostic entities. Field lists are illustrative, not exhaustive.

### 4.1 User & identity
- **User**: id, full_name, email, phone, role, status (active/inactive), created_at, last_login_at, avatar.
  - For students: student_id, program, year, gender, eligibility_attributes (JSON for flexible filters).
  - Auth: local password (v1) or Microsoft SSO (later phase).
- **Role**: enum {Manager, Coordinator, Employee, Student}. A user has exactly one role.
- **Assignment**: user ↔ activity (as coordinator or employee), user ↔ club (as coordinator/advisor or member), user ↔ welfare_service (as counselor / health staff).

### 4.2 Activity & sessions
- **Activity**: id, type {Event, Course, Workshop, Campaign}, title, description, category/tags, location (physical or virtual + URL), start_at, end_at, capacity, waitlist_enabled (bool), registration_opens_at, registration_closes_at, cancellation_cutoff (hours before start), eligibility_rules, prerequisites, fee (free/paid + amount), completion_threshold (e.g. 80% sessions for course), state (see §5), creator_id, owner_coordinator_id, co_coordinators[], assigned_employees[], created_at, published_at, cancelled_at, cancellation_reason, language, attachments[].
- **Session** (for multi-session courses/workshops): id, activity_id, sequence, start_at, end_at, location, employee_in_charge_id.
- **EligibilityRule**: e.g. allowed_programs[], allowed_years[], allowed_genders[], custom_filters[]. Combined with AND.
- **Prerequisite**: activity_id depends on prior_activity_id (must be Completed) — optional list.

### 4.3 Registration & attendance
- **Registration**: id, activity_id, student_id, status {Registered, Waitlisted, Cancelled, NoShow, Completed, Failed}, registered_at, cancelled_at, source {self, on_behalf}, position_on_waitlist (nullable), promoted_from_waitlist_at, fee_status {n/a, pending, paid, refunded}.
- **Attendance**: id, registration_id, session_id (or activity_id for single-session), present (bool), check_in_method {QR, manual}, check_in_at, marked_by_user_id, notes.
- **CompletionRecord**: derived; computed when attendance ≥ threshold and any deliverables are met.

### 4.4 Certificates
- **CertificateTemplate**: id, applies_to_activity_type, layout/fields, signatory blocks, branding.
- **Certificate**: id, registration_id, issued_at, verification_code, pdf_url, revoked (bool), revoked_reason.

### 4.5 Clubs
- **Club**: id, name, description, advisor_id, established_at, status {active, inactive}, logo, social_links.
- **ClubMembership**: id, club_id, student_id, role_in_club {member, board_member, president, vp, treasurer, ...}, joined_at, ended_at, status {active, alumni, removed}.
- **Committee**: id, club_id, name, lead_membership_id, members[].
- Clubs may sponsor Activities (activity.sponsoring_club_id, optional).

### 4.6 Welfare — counseling
- **CounselingSlot**: id, counselor_id, start_at, end_at, status {open, booked, blocked, completed, cancelled, no_show}.
- **CounselingAppointment**: id, slot_id, student_id, reason_summary (student-entered, optional), booked_at, status, cancellation_reason.
- **CounselingNote**: id, appointment_id, counselor_id, body (sensitive), created_at, edited_at, attachments[]. Visible to: that counselor + Manager.

### 4.7 Welfare — health
- **HealthSlot** + **HealthAppointment**: same shape as counseling.
- **VisitLog** (walk-in): id, student_id, staff_id, occurred_at, complaint, action_taken, referral, follow_up_needed (bool), notes. Visible to: health staff who logged + other health staff (configurable) + Manager.

### 4.8 Budget
- **ActivityBudget**: id, activity_id, planned_amount, currency, approved_amount (set on approval).
- **BudgetTransaction**: id, activity_id, type {expense, income, adjustment}, amount, vendor/source, category, occurred_at, recorded_by, receipt_url, notes.
- Derived: actual_spent, remaining, variance.

### 4.9 Notifications
- **Notification**: id, recipient_user_id, channel {inapp, email, push}, template_key, payload (JSON), state {pending, sent, failed, read}, created_at, sent_at, read_at.
- **NotificationPreference**: per-user opt-in/out per channel and category.

### 4.10 Audit
- **AuditEvent**: id, actor_user_id, action (e.g. activity.approved, registration.cancelled, certificate.revoked), target_entity_type, target_entity_id, before (JSON), after (JSON), ip, user_agent, occurred_at. Append-only at the application layer.

### 4.11 Reporting
- **ReportDefinition**: id, name, owner_user_id, entity_scope, filters (JSON), columns (JSON), grouping, schedule (optional).
- **DashboardWidget**: pre-built widgets configured per role.

---

## 5. Master activity lifecycle

This is the single state machine all activities (Event, Course, Workshop, Campaign) flow through. Per-type variations are noted inline.

### 5.1 States

```
Draft → Submitted → Approved → Published → RegistrationOpen → RegistrationClosed → InProgress → Completed → Archived
                       ↓             ↓             ↓                  ↓                ↓
                    Rejected     Cancelled    Cancelled         Cancelled       Cancelled
```

| State | Who can transition into it | Trigger |
|-------|----------------------------|---------|
| **Draft** | Coordinator, Manager | Activity created. Editable freely. |
| **Submitted** | Coordinator | Coordinator clicks "Submit for approval". |
| **Approved** | Manager (or auto for Manager-authored) | Manager approves. |
| **Rejected** | Manager | Manager rejects with reason → returns to Draft with note. |
| **Published** | Coordinator/Manager | Coordinator publishes after approval. Now visible to students. |
| **RegistrationOpen** | system | When `registration_opens_at` is reached (and Published). |
| **RegistrationClosed** | system | When `registration_closes_at` reached or capacity hit + waitlist closed. |
| **InProgress** | system | When `start_at` reached. |
| **Completed** | system | After `end_at` and final attendance recorded. |
| **Cancelled** | Coordinator (own) / Manager | Manual; sends notifications, marks all registrations Cancelled. |
| **Archived** | Manager / system | After retention period (rule TBD; retention deferred). |

### 5.2 Transition rules

- A **Draft** activity is fully editable.
- A **Submitted** activity locks edits except Coordinator may withdraw → back to Draft.
- An **Approved** activity is editable by Coordinator with these constraints:
  - Date/time, location, description, capacity (raise or lower) → free; system notifies registrants on date/time/location change.
  - Budget **increase** → requires Manager re-approval; budget decrease is free.
  - Activity **type** change → not allowed; cancel and create new.
- **Cancellation** is allowed from Approved onward; requires reason. Notifies all registrants and waitlisters. Refunds applicable if fees were paid (see §10).
- **Rejection** carries a Manager comment; Coordinator edits and resubmits.

### 5.3 Per-type behavior

- **Event**: single session; attendance recorded once; certificate issued if `attended = true` and threshold met (default: present).
- **Course**: multi-session; attendance per session; completion when `attended_sessions / total_sessions ≥ completion_threshold` (default 80%).
- **Workshop**: single or multi-session; same as Event or Course depending on shape; may require deliverable submission before certificate (optional).
- **Campaign**: may have no registration (open attendance) or registration for specific roles (volunteer slots). Attendance optional. Certificates optional.

### 5.4 System-driven state changes
- A scheduled job evaluates time-based transitions (registration open/close, in-progress, completed) every minute.
- All state transitions emit `AuditEvent` and may trigger notifications.

---

## 6. Module — Activities

### 6.1 Create & edit
- Coordinator opens "New Activity", picks type, fills fields. Required: title, type, description, start/end, location, capacity, registration window, eligibility, completion threshold (auto-defaulted by type).
- Course/Workshop with multiple sessions: add sessions inline with their own date/time/location/employee.
- Activity may be linked to a sponsoring **Club**.
- Activity has a planned **Budget**: Coordinator inputs planned line items; total auto-summed.
- Activity may carry **Prerequisites** (must have Completed activity X).
- Activity may carry **Eligibility** (year, program, gender, custom).
- File **Attachments** (poster, agenda, consent forms, etc.).

### 6.2 Approval flow
- Coordinator submits → activity enters **Submitted**.
- Manager sees a queue of pending approvals (dashboard widget + email/in-app notification).
- Manager can: **Approve**, **Reject (with reason)**, or **Request changes (with comment)** which returns to Draft.
- Manager-authored activities skip Submitted: Draft → Approved on submit.
- Approved activity becomes visible to its owner; Coordinator clicks **Publish** to expose it to students.

### 6.3 Publishing & discovery
- Once Published, activity appears in the student-facing catalog filtered by eligibility (a student does not see an activity they're not eligible for, unless this is overridden — see §11.3 gap).
- Catalog supports filter by: type, category/tag, club, date range, location, free/paid, has_seats.
- Search by keyword on title/description/tags.

### 6.4 Editing post-publish
- Coordinator (own) or Manager can edit:
  - Description, location, attachments, eligibility (with caution — see §11.3), category/tags → free; if existing registrants are affected, system flags this.
  - Date/time → free; system auto-notifies all registered + waitlisted users via in-app + email + push. Students may cancel within the cancellation cutoff.
  - Capacity → raise or lower freely. Lowering moves the most recently registered to the waitlist (FIFO from top: keep earliest registrants); audit-logged.
  - Budget → decrease free; **increase requires Manager approval** (creates a "Budget change request" item in Manager queue).
- Activity type cannot change post-creation.

### 6.5 Cancellation
- Coordinator (own) or Manager can cancel any non-Completed/non-Archived activity.
- Required: cancellation reason (free text).
- System: sets all Registered → Cancelled, all Waitlisted → Cancelled; refunds where applicable; sends notifications; locks the activity from further edits.

### 6.6 Co-coordination
- Activity has one owner Coordinator + optional co-coordinators. Co-coordinators have the same edit/manage rights on that activity.
- Employees are assigned per activity (and optionally per session).

---

## 7. Module — Registration & waitlist

### 7.1 Student registration
- Student opens an activity → sees details, seats remaining, schedule, eligibility match, prerequisites status.
- Student clicks **Register**:
  - System validates: registration window open, eligibility match, prerequisites met, no schedule conflict (see §7.4), capacity not full (or waitlist enabled).
  - If valid and seats available → **Registered**.
  - If valid and capacity full but waitlist enabled → **Waitlisted** with position.
  - If invalid → reason shown.
- Confirmation: in-app + email + push notification with calendar (.ics) attachment for Email.

### 7.2 Cancellation by student
- Student can cancel until `cancellation_cutoff` hours before `start_at` (configurable per activity, default e.g. 24h).
- After cutoff, cancel button is disabled; student can request cancellation by contacting Coordinator (out-of-band) or via a "Request to cancel" action that goes to Coordinator's queue (optional — see gap).
- On cancellation: registration → Cancelled; if a Registered student cancels and a waitlist exists, top of waitlist auto-promotes.

### 7.3 Waitlist mechanics
- FIFO ordered queue. Position visible to student.
- Auto-promotion on:
  - A Registered student cancels.
  - Capacity is raised by Coordinator.
- On promotion: student's registration → Registered; notification sent (in-app + email + push). Student may have a short window to confirm or release (configurable; e.g. 24h or until 6h before start, whichever earlier). On no-confirm, drop and promote next.
- Waitlist may be capped (configurable) or unlimited.

### 7.4 Conflict detection (block)
- At registration time, system checks the student's existing **Registered** activities for time overlap with this activity's `start_at` ↔ `end_at` (or any of its sessions).
- If overlap → registration **blocked** with a clear message naming the conflicting activity.
- For multi-session courses: each session is checked individually; conflict on any session blocks the registration.
- Manager / Coordinator on-behalf registration: same rule by default; with explicit override option (logged in audit).

### 7.5 On-behalf registration
- Coordinator (own activity) and Manager can register a student manually (e.g. walk-in, special case).
- The student receives the same notifications.
- Eligibility/prerequisite/conflict rules apply by default; override available with reason (audit-logged).

### 7.6 No-show handling
- After an activity ends, registrations with no attendance are marked **NoShow**.
- **Policy**: track only — no automatic blocking, no penalty. Coordinator and Manager can see no-show rate per student in their profile/history.
- Manager can produce a "high no-show students" report (custom report builder).

### 7.7 Fees (paid activities)
- If `fee.amount > 0`: registration enters **pending payment** state until paid (payment integration deferred — see gaps).
- On cancellation: refund policy per activity (full / partial by date / none); set at activity creation.
- v1 may treat all activities as free with `fee` field stored for future use, OR include a basic "mark as paid" manual flow for the Coordinator.

---

## 8. Module — Attendance

### 8.1 Methods
1. **QR check-in**: each session has a unique, time-bounded QR code displayed on a screen / available to the Employee. Student scans with the PWA → marked Present. Server validates: QR validity window, student is registered, location/geofence (optional), not already checked in.
2. **Manual mark**: Employee opens the session attendance sheet, sees registered students, marks Present/Absent/Late, saves. Bulk "mark all present" available with confirmation.
3. **Self check-in (optional)**: For low-stakes events, students can self-check-in via a session code without QR (configurable per activity).

### 8.2 Per-session vs. per-activity
- Single-session (Event, single Workshop): one attendance record per registration.
- Multi-session (Course, multi-day Workshop): one record per session per registration.

### 8.3 Late / partial credit
- Configurable: whether "Late" counts as Present for completion calculation. Default: counts as present.
- Half-credit option (e.g. left early) — recorded as flag, doesn't impact completion by default.

### 8.4 Completion calculation
- For courses: `present_count / total_sessions ≥ completion_threshold` → Completed.
- For events/workshops: present at the (single) session → Completed.
- Optional **deliverable requirement**: if `requires_deliverable = true`, student must submit a deliverable (file/text) and be marked "deliverable accepted" by Coordinator/Employee before Completed.
- Completion happens automatically when criteria are met OR can be manually flipped by Coordinator with reason (audit-logged).

### 8.5 Edits & corrections
- Attendance can be corrected by Coordinator/Employee on assigned activity for X days post-session (configurable, e.g. 7 days). Edits are audit-logged.
- After window closes, only Manager can edit, with reason.

---

## 9. Module — Certificates

### 9.1 Templates
- Per activity type (Event, Course, Workshop, Campaign) there is a default template; Coordinator can pick a different template at creation.
- Template includes: branding, title, student name, activity title, date(s), hours/credits, signatory, verification code + QR.
- Manager manages templates (CRUD).

### 9.2 Issuance
- Auto-generated when a registration reaches **Completed** state.
- Generated as PDF, stored, and made available to the student via in-app download + email.
- Each certificate has a unique **verification code** and a public verify URL: anyone (without login) can paste the code to confirm authenticity.

### 9.3 Revocation
- Coordinator (own activity) or Manager can revoke a certificate with reason (e.g. attendance was wrongly recorded).
- Revoked certificate's verify URL shows "Revoked" with reason and date.
- Audit-logged.

### 9.4 Re-issue
- If the student name was wrong (corrected in profile) or template updated, certificate can be regenerated; old version is superseded but verifiable as superseded.

---

## 10. Module — Clubs

### 10.1 Lifecycle
- Manager creates a Club: name, description, advisor, logo. Status = Active.
- Club has a persistent presence (page visible to students).
- Manager assigns one or more Coordinators (or Employees) as **Advisors**.

### 10.2 Roster & roles
- Students apply to join (or are added by Advisor/Manager).
- Membership has a role-in-club (member, board member, president, treasurer, …).
- Membership history tracked: joined_at, ended_at, status. Alumni view shows past members.
- Advisor can promote/demote, remove (with reason), close membership.

### 10.3 Committees
- Sub-groups within a club (e.g. Marketing, Logistics).
- Each committee has a lead and members drawn from the roster.
- Committee can be linked to specific activities the club sponsors.

### 10.4 Club-sponsored activities
- A club can sponsor an Activity. The activity goes through the same approval workflow.
- The club's page lists upcoming/past sponsored activities.

### 10.5 Reporting
- Manager dashboard: number of active clubs, member counts, activity counts, advisor list.

---

## 11. Module — Welfare services

### 11.1 Counseling (1:1 only)
- **Slots**: counselor (Employee) creates open slots on a calendar (recurring or one-off). Slots have duration (e.g. 45 min).
- **Booking**: student selects a slot, optionally provides a brief reason. Confirmation via in-app + email. Reminder 24h before via push + email.
- **Cancellation**: student or counselor can cancel up to a configurable window before the slot. Late cancellation recorded.
- **Session record**: counselor opens the appointment, fills **CounselingNote** (body, attachments). Marks status (Completed / NoShow / Cancelled).
- **Visibility**: notes visible to that counselor + Manager. Other Employees do not see them. Students see only that the appointment occurred (date/time/counselor); no notes by default. Audit log records every read of a note (sensitive data viewing) — see §13.4.

### 11.2 Health
- **Appointments**: same shape as counseling — slots, booking, reminders, cancellation, post-visit notes.
- **Walk-in visit logs**: Employee (health staff) records a walk-in: select student, complaint, action, referral, follow-up flag, notes. No prior booking required.
- **Visibility**: appointment notes and visit logs visible to all health staff (Employee assigned to health) + Manager (configurable to "only the staff who logged" if stricter — see gap §17). Students see only the date/time/staff and a summary if exposed.

### 11.3 Sensitive-data handling
- **No special privacy mode** beyond standard RBAC (decision: Manager sees all).
- Mandatory: every read of a counseling note, health note, or visit log is audit-logged (actor, target, timestamp). This is non-negotiable for accountability even though the visibility rules are simple.
- Notes/logs are encrypted at rest at the storage layer.
- Export of welfare records is restricted to Manager and audit-logged with reason field.

---

## 12. Module — Budget tracking

### 12.1 Planned vs. actual
- Each activity has a **planned budget** (set at creation) and an **approved budget** (set by Manager on approval — may equal planned or be reduced).
- Coordinator records **transactions** (expenses, incomes, adjustments) against the activity throughout its lifecycle.
- System computes `actual_spent`, `remaining = approved_amount − actual_spent`, `variance = approved − actual`.

### 12.2 Transactions
- Fields: type, amount, category (catering, venue, supplies, prizes, other), vendor/source, occurred_at, receipt (file upload), notes.
- Attached to the activity. Optional category list is configurable.
- Coordinator can record transactions; Manager can record + edit any.

### 12.3 Budget changes
- If actual_spent approaches or exceeds approved → system warns Coordinator and notifies Manager.
- To raise approved_amount post-approval, Coordinator submits a **Budget change request** with reason; Manager approves/rejects (audit-logged).

### 12.4 Reporting
- Per-activity: planned vs. actual breakdown by category.
- Department-wide: spend by month, by activity type, by club, by Coordinator.
- Variance reports for Manager.

### 12.5 Currency
- Single currency in v1 (configurable at deployment, e.g. SAR). Multi-currency deferred.

---

## 13. Cross-cutting concerns

### 13.1 Notifications
- **Channels**: in-app (always), email, push (PWA web push).
- **Categories** (each user can opt out per category, except critical):
  - Activity announcements (new activity matching my eligibility)
  - Registration confirmations / cancellations
  - Activity changes (date/time/location/cancellation) — **critical, can't opt out**
  - Reminders (24h before)
  - Waitlist promotion — **critical, can't opt out**
  - Certificate issued
  - Approval queue items (Manager only)
  - Budget alerts (Manager + owning Coordinator)
  - Welfare appointment confirmations & reminders
- **Templates**: maintained centrally; English only in v1.
- **Delivery**: queue-based; retries with backoff; failures audit-logged.
- **Quiet hours**: optional per-user no-push window (e.g. 10pm–7am).

### 13.2 Reports & dashboards
- **Pre-built dashboards** (per role):
  - **Manager**: pending approvals, active activities, registrations this week, attendance rate trend, no-show rate, budget burn, certificates issued, club activity, welfare service load (counts only).
  - **Coordinator**: my activities by state, my registration counts, my upcoming sessions, my budget status, items needing my action.
  - **Employee**: my upcoming sessions, my attendance to take today, my upcoming counseling/health appointments.
  - **Student**: my registrations, upcoming sessions, my certificates, my appointments.
- **Custom report builder** (Manager only):
  - Pick entity scope (activities, registrations, attendance, certificates, budget transactions, club memberships, welfare appointments — counts only for welfare).
  - Filter by fields, date ranges.
  - Group by, aggregate (count, sum, avg).
  - Save as a definition; optionally schedule (email weekly, monthly).
- **Scheduled reports**: Manager can have any saved report emailed to themselves on a schedule.

### 13.3 Exports
- CSV/Excel: any list (registration roster, attendance sheet, transactions, custom report results).
- PDF: formatted attendance sheets (printable), certificate batches, end-of-period summaries with branding.
- Welfare data exports: Manager only, audit-logged with reason.

### 13.4 Audit log
- **Full**: every state change, edit, deletion, approval, certificate issue/revoke, role change, login, registration, attendance edit, note read (welfare).
- **Fields**: actor, action, target, before/after JSON, IP, user agent, timestamp.
- **Visibility**: Manager only.
- **Retention**: log retained per organization policy (deferred); never deleted via UI.
- **Search & filter**: by actor, target, action type, date range.
- **Note**: not labeled "immutable" per the explicit decision (full but normal-edit-protected, not write-once); operationally, no UI affordance to edit/delete log entries.

### 13.5 Schedule conflict detection
- Activities: blocking, as described in §7.4.
- Welfare appointments: a student can't double-book a counseling/health slot at the same time as another welfare appointment (block).
- Cross-conflict (welfare ↔ activity): warn but allow (welfare appointments often shorter and the student may legitimately rearrange).

### 13.6 No-show tracking
- Tracked at registration level (`status = NoShow`) and welfare appointment level.
- Visible in student profile to Manager / Coordinator (for activities) or counselor / health staff + Manager (for welfare).
- No automatic penalties; report-driven only.

### 13.7 Search & discovery
- Global search (header) for Manager: across activities, students, clubs, transactions.
- Student catalog search: by keyword, type, category/tag, date range.

### 13.8 Internationalization
- English only in v1. UI strings externalized to enable later Arabic/RTL addition without refactor.

### 13.9 Data retention
- Deferred. v1 keeps all records. The audit log table is designed for append-only and will support a future retention policy without redesign.

---

## 14. End-to-end scenarios

These scenarios trace real interactions across modules to expose gaps.

### Scenario A — Coordinator runs a 4-session course

1. Coordinator opens "New Activity" → type **Course**, fills title "Public Speaking 101", adds 4 sessions (Tue/Thu for 2 weeks), capacity 25, eligibility "all programs, year ≥ 1", completion threshold 75% (3 of 4 sessions), planned budget 500 SAR.
2. Coordinator submits → state **Submitted**. Manager gets in-app + email notification.
3. Manager reviews, approves with approved_amount = 500. State → **Approved**. Coordinator gets notification.
4. Coordinator publishes. State → **Published**. Activity appears in catalog for eligible students.
5. `registration_opens_at` arrives → state → **RegistrationOpen**. Notification to subscribed students (eligibility-matched).
6. 30 students try to register; 25 get **Registered**, 5 go to waitlist.
7. One Registered student cancels 3 days before; top of waitlist auto-promoted; gets in-app + email + push notification with calendar.ics.
8. Session 1: Employee opens session, displays QR. Students scan; 22 marked Present, 3 marked Absent. Coordinator manually marks 1 of the absentees Present (was at the door, system glitch) — audit logged.
9. Sessions 2–4 proceed similarly. After session 4 (`end_at` reached), system computes completion: 20 students hit ≥75% → **Completed**; 5 → **Failed**.
10. Certificates auto-generated for the 20; emailed; downloadable in their profile. Verifiable via public URL.
11. Coordinator records 2 budget transactions during the course (catering 200, supplies 150). Actual = 350; remaining = 150; variance shown in dashboard.
12. Activity transitions to **Completed**.

### Scenario B — Date change after publish

1. Activity has 50 registrations. Coordinator changes start_at +2 days.
2. System: activity edit recorded in audit; sends in-app + email + push to all 50 registrants and waitlisters with old vs. new times and a 1-click "I can no longer attend" cancellation link.
3. 5 students cancel; 3 from waitlist promoted; notifications cascade.
4. Activity continues normally.

### Scenario C — Manager rejects an activity

1. Coordinator submits with sparse description and no eligibility.
2. Manager clicks **Request changes**, comments "Please specify eligibility and add agenda".
3. Activity → Draft with comment visible to Coordinator. Email + in-app notification.
4. Coordinator edits, resubmits. Manager approves.

### Scenario D — Budget overrun

1. Coordinator's approved budget is 1000. Records expenses totaling 950. System warns "95% of budget used".
2. Coordinator needs another 300 → submits **Budget change request** (reason: "vendor price increase").
3. Manager sees in approval queue; approves +300. Audit logged.
4. New approved_amount = 1300; transactions continue.

### Scenario E — Student schedule conflict

1. Student is already Registered for Activity X (Tue 4–6pm).
2. Tries to register for Activity Y (Tue 5–7pm).
3. System blocks: "Conflict with Activity X (Tue 4–6pm). Cancel that registration first or pick a different activity."
4. Student cancels X; registers for Y successfully.

### Scenario F — Capacity lowered after registrations

1. Activity capacity is 100, currently 80 registered.
2. Coordinator lowers capacity to 60.
3. System: keeps the first 60 registered (by `registered_at`); moves the most recent 20 to **Waitlisted** (top of waitlist). Sends each of the 20 an apologetic in-app + email + push notification with reason field. Audit logged.
4. If those 20 do nothing, they remain on waitlist; if seats open, they're promoted in order.

### Scenario G — Student no-show

1. Student registered for an event but doesn't attend; not checked in.
2. After event ends, system marks registration **NoShow**.
3. No penalty. Visible in student profile history.
4. Manager runs a "students with ≥3 no-shows last semester" custom report.

### Scenario H — Counseling appointment

1. Counselor (Employee) opens calendar, creates 5 open slots for next week.
2. Student opens "Counseling" → sees available slots → books one with reason "exam stress".
3. Confirmation: in-app + email. Reminder 24h before via push + email.
4. Student attends. Counselor opens the appointment, writes private note, marks Completed.
5. Student's profile: shows that the appointment occurred (date/time/counselor name); not the note.
6. Manager later opens the case for review — view is audit-logged.

### Scenario I — Walk-in health visit

1. Student walks into health office with a complaint.
2. Health Employee selects student, fills VisitLog (complaint, action, follow-up flag), saves.
3. Student profile shows the visit summary; only Manager + health staff see notes.
4. If follow-up_needed = true, it appears in the Employee's "follow-ups" list.

### Scenario J — Activity cancellation refund

1. Paid activity (50 SAR), 30 registered. Coordinator cancels with reason "venue unavailable".
2. System: marks all registrations Cancelled; flags fee_status → refund_pending for the 30.
3. Coordinator (or finance via Manager) processes refunds out-of-band; marks each as refunded in the system.
4. (Note: in v1, payment integration is deferred — fee handling is manual mark-as-paid / mark-as-refunded.)

### Scenario K — Certificate verification

1. External party (e.g. employer) receives a certificate PDF from a student.
2. Scans the QR or visits the verify URL with the code.
3. Public page shows: student name, activity title, dates, status (Valid / Revoked / Superseded). No login required.

---

## 15. Business rules registry

A consolidated list to make gaps obvious. Each rule has an ID for reference.

### Activity & approval
- **BR-A1**: An activity must be in state Approved before it can be Published.
- **BR-A2**: Manager-authored activities skip Submitted (auto-Approved on save).
- **BR-A3**: Activity type cannot change after creation.
- **BR-A4**: Editing an Approved/Published activity's date/time/location is allowed; changes auto-notify registrants and waitlisters.
- **BR-A5**: Increasing budget on an Approved/Published activity requires Manager approval; decreasing is free.
- **BR-A6**: Cancellation requires a reason.
- **BR-A7**: Coordinators can only edit/cancel their own activities (or co-coordinated). Managers can act on any.

### Registration
- **BR-R1**: A student cannot register for an activity outside its registration window.
- **BR-R2**: A student cannot register for an activity they are not eligible for.
- **BR-R3**: A student cannot register if a prerequisite activity is not Completed.
- **BR-R4**: A student cannot register if any time slot of the activity overlaps with another Registered activity (block).
- **BR-R5**: When a Registered student cancels and a waitlist exists, the top is auto-promoted.
- **BR-R6**: When capacity is raised, top of waitlist is auto-promoted up to new capacity.
- **BR-R7**: When capacity is lowered below current registrations, the most recently registered are demoted to top of waitlist.
- **BR-R8**: A student may cancel a registration up to `cancellation_cutoff` hours before start; after that, manual handling.
- **BR-R9**: A waitlisted student promoted to Registered must (optionally) confirm within X hours; on no-confirm, drop and promote next.
- **BR-R10**: Manager and Coordinator (own) can register a student on-behalf, with override option for eligibility/conflict.

### Attendance & completion
- **BR-AT1**: Attendance can be recorded by QR (student-driven) or manually (staff-driven).
- **BR-AT2**: Late counts as Present by default (configurable).
- **BR-AT3**: Course completion = `present_sessions / total_sessions ≥ completion_threshold`.
- **BR-AT4**: Single-session activity completion = present at the session.
- **BR-AT5**: Optional deliverable requirement gates Completion regardless of attendance.
- **BR-AT6**: Attendance can be edited within X days post-session by staff; thereafter only Manager.

### Certificates
- **BR-C1**: Certificates are auto-issued on Completion.
- **BR-C2**: Each certificate has a unique verification code with public verify URL.
- **BR-C3**: Revocation requires a reason and is shown on verify URL.

### Welfare
- **BR-W1**: Welfare appointments are 1:1 only.
- **BR-W2**: Counseling notes are visible only to that counselor + Manager.
- **BR-W3**: Health visit logs visible to all health Employees + Manager (configurable to logging-staff-only — see gap).
- **BR-W4**: Every read of a welfare note/log is audit-logged.

### Budget
- **BR-B1**: Each activity has a planned amount, an approved amount (set on approval), and a running actual.
- **BR-B2**: Coordinator records transactions; system warns when actual approaches approved.
- **BR-B3**: Increasing approved_amount requires a Manager-approved budget change request.

### Notifications
- **BR-N1**: Critical notifications (activity change, cancellation, waitlist promotion) cannot be opted out.
- **BR-N2**: Notifications are sent via in-app + email + push (per user preference for non-critical).

### Audit
- **BR-AU1**: All state changes, edits, deletions, approvals, role changes, certificate issuance/revocation, and welfare-note reads are logged.
- **BR-AU2**: Audit log is read-only via UI.

---

## 16. Non-functional requirements

### 16.1 Platforms & UX
- Responsive web + PWA (installable, offline cache for read-only views, web push).
- Modern evergreen browsers + iOS Safari + Android Chrome.
- Accessibility: WCAG 2.1 AA target.

### 16.2 Performance
- p95 page load < 2.5s on 4G.
- Catalog and roster lists handle 10k+ rows with pagination/virtualization.
- Notifications dispatched within 30s of trigger.

### 16.3 Security
- Role-based access enforced server-side (never client-only).
- Welfare data encrypted at rest.
- All API calls authenticated; CSRF protection; input validation.
- Audit log captures actor + IP for sensitive actions.
- Files (attachments, receipts, certificates) stored with signed URLs (time-limited).

### 16.4 Authentication
- v1: local accounts (email + password, MFA optional).
- Later phase: Microsoft SSO (OIDC). Designed to plug in without schema change.

### 16.5 Reliability
- Background jobs (state transitions, notifications) idempotent; retry with backoff.
- Daily backups; PITR (point-in-time recovery) target 24h.

### 16.6 Observability
- Structured app logs.
- Error tracking (Sentry-like).
- Basic metrics: registrations/day, certificates/day, notification delivery rate, error rate.

### 16.7 Data scale assumptions (sizing)
- Students: ~30k.
- Activities/year: ~500–2000.
- Registrations/year: ~50k–200k.
- Certificates/year: ~30k–100k.
- These are guesses — confirm with stakeholders.

---

## 17. Open questions & gaps

These are decisions still pending or assumptions you should pressure-test.

### 17.1 Gaps from explicit decisions
- **Health module dual-mode** (appointments + walk-ins): visibility scope of walk-in logs is currently "all health Employees + Manager". Is that correct, or should it be "only the staff who logged it + Manager" for stricter privacy? Affects BR-W3.
- **Counseling student visibility**: students currently see only the fact of the appointment, not any summary. Should counselors be able to share an optional "summary for student"? This is common practice. Decide before build.
- **Cancellation cutoff for students**: a default value (e.g. 24h) is assumed but never explicitly chosen. Should this be system-wide or per-activity?
- **Waitlist confirmation window**: when promoted from waitlist, do students need to confirm within X hours, or is auto-acceptance the right default? §7.3 lists it as optional.
- **Self check-in**: §8.1 mentions optional self check-in for low-stakes events. Include in v1 or strict QR + manual only?

### 17.2 Decisions deferred
- **Data retention**: deferred. Need a policy before going live (PII deletion timeline for graduated students, audit log retention).
- **Payment integration** for paid activities: not designed. Currently fee fields exist, marking as paid/refunded is manual. Decide if v1 needs a payment gateway or if all v1 activities are free-of-charge in practice.
- **Microsoft SSO**: deferred to a later phase. Local auth in v1.

### 17.3 Things not yet asked
- **Capacity per session vs. activity** for multi-session courses: is capacity course-wide (one capacity for all sessions) or per session (e.g. open Q&A with caps per night)?
- **Group registration**: can a student register a group of friends, or is each registration individual? Default: individual.
- **Registration approval**: is registration auto-confirmed, or does some activity type require Coordinator approval per registrant (e.g. for selective workshops)?
- **Attendance threshold**: §5.3 defaults to 80% for courses. Confirm; allow per-activity override at creation.
- **Late cancellation request flow**: §7.2 mentions an optional "Request to cancel" after the cutoff. Include or omit?
- **Activity templates**: should Coordinators be able to clone past activities to save time? (Strong UX win — recommend yes.)
- **Recurring activities**: weekly clubs that meet every week — model as a Course with weekly sessions or as a different structure? §10.4 implies club activities use the standard activity flow.
- **Staff scheduling conflicts**: §13.5 doesn't currently warn when an Employee is assigned to two overlapping activities. Add?
- **Visitors / non-students**: any need for non-student attendees (faculty guests, external invitees)? Not currently modeled.
- **Capacity for waitlist**: unlimited or capped (e.g. max 50 on waitlist per activity)?
- **Public-facing pages**: is the activity catalog visible to non-logged-in users (university recruitment angle), or login-required?
- **Certificate hours/credits**: do certificates carry CPD-style hours, and if so, is that auto-calculated from session durations or manually set?
- **Multi-currency**: assumed single currency. Confirm.
- **Notification quiet hours**: §13.1 mentions per-user quiet hours; confirm whether this is needed in v1.
- **Custom report sharing**: should Manager be able to share saved reports with another Manager? (Single-Manager assumption — confirm if there's only one Manager or multiple.)

### 17.4 Architectural assumptions to validate
- Single Manager, multiple Coordinators/Employees — or multiple Managers? RBAC model assumes role is a string per user; if there are multiple Managers, current design holds. If "Manager" needs sub-departments (e.g. one Manager per faculty), we need multi-tenancy.
- One department / one institution per deployment. Multi-tenant deferred.
- All times in a single time zone (Asia/Riyadh assumed). Confirm.
- Storage: file uploads (attachments, receipts, certificates) need a blob store. Sizing TBD.

---

## 18. High-level implementation phases

Tech-agnostic grouping. Within each phase, design → build → test → UAT.

### Phase 0 — Foundations
- Auth (local accounts), user/role model, base UI shell, audit logging skeleton, notification framework (in-app + email + push), file storage, deployment pipeline.

### Phase 1 — Core activity workflow
- Activity CRUD (all 4 types) with sessions.
- Approval workflow.
- Eligibility & prerequisites.
- Publish, registration window, capacity, waitlist, cancellation.
- Conflict detection (block).
- Attendance (QR + manual).
- Completion logic, certificates with public verify.
- Coordinator + Manager + Employee + Student dashboards (pre-built).
- CSV/PDF export of rosters and attendance.

### Phase 2 — Clubs & budget
- Clubs, memberships, committees, club-sponsored activities.
- Activity budgets: planned/approved/actual, transactions, alerts, change requests.
- Custom report builder.
- Scheduled reports.

### Phase 3 — Welfare services
- Counseling: slots, booking, notes, reminders, sensitive-data audit.
- Health: appointments + walk-in visit logs.
- Welfare-specific dashboards and reports.

### Phase 4 — Hardening & SSO
- Microsoft SSO integration.
- Performance hardening, accessibility audit.
- Data retention policy implementation.
- Optional payment gateway integration if needed.

### Phase 5 — Optional enhancements
- Activity templates / clone.
- Late-cancellation request flow.
- Arabic + RTL.
- Native mobile apps (if PWA is insufficient).

---

## 19. Out of scope for v1
- Native mobile apps.
- Multi-language UI (Arabic).
- Multi-tenant / multi-department deployment.
- Payment gateway integration.
- Microsoft SSO (deferred to Phase 4).
- Full data-retention automation.

---

## 20. Decisions log (captured during requirements)

| # | Decision | Source |
|---|----------|--------|
| 1 | Roles: Manager, Coordinator, Employee, Student | earlier rounds |
| 2 | Activity types: Event, Course, Workshop, Campaign | earlier rounds |
| 3 | Health module = appointments + walk-in visit logs | round 8 |
| 4 | Counseling = 1:1 only | round 8 |
| 5 | Clubs = persistent with rosters & committees | round 8 |
| 6 | Sensitive data: standard RBAC; Manager sees all | round 8 |
| 7 | Reports: pre-built dashboards + custom report builder | round 9 |
| 8 | Exports: CSV/Excel + PDF | round 9 |
| 9 | Audit: full audit log | round 9 |
| 10 | Data retention: deferred | round 9 |
| 11 | Post-publish edits: free; budget increase needs approval | round 10 |
| 12 | No-shows: track only, no penalty | round 10 |
| 13 | Conflicts: block student conflicts | round 10 |
| 14 | Capacity: Coordinator can raise + lower freely | round 10 |
| 15 | Platforms: Web + PWA | round 11 |
| 16 | Language: English only | round 11 |
| 17 | Auth: Microsoft SSO later; local accounts now | round 11 |
| 18 | Notifications: in-app + email + push | round 11 |
| 19 | Tech stack: tech-agnostic plan | round 12 |
| 20 | Scope: full PRD now, phased build | round 12 |

---

*End of PRD. Review §17 (Open questions & gaps) carefully — those are the items most likely to bite you in build.*


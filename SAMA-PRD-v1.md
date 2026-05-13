# Student Activities Management System — PRD

> Tech-agnostic product requirements document. Focus: features, workflows, business logic, end-to-end scenarios. Implementation phases at the end are high-level only.

---

## 1. Executive summary

A web + PWA platform for a university Student Activities & Welfare department to plan, approve, deliver, and report on student-facing activities and welfare services. It replaces ad-hoc spreadsheets and chat-based coordination with a single source of truth covering:

- Activity lifecycle (events, programs, workshops, campaigns) from idea to certificate
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
| **Activity** | Any planned offering students can register for: event, program, workshop, or campaign. |
| **Event** | Single-session activity (lecture, ceremony, tournament round). |
| **Program** | Multi-session activity with attendance threshold for completion (e.g. 80%). |
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

## 2.5 Platform surfaces

SAMA is a **hybrid platform**: two distinct UI surfaces backed by a single shared data layer and API. They are not separate systems — they read and write the same database, the same activity records, the same club data. The distinction is purely at the surface (UI/UX and access entry point).

### The two surfaces

| Surface | What it is | Design philosophy | Who uses it |
|---------|-----------|-------------------|-------------|
| **SAMA** | Internal staff tool | Desktop-first, information-dense, multi-panel layouts | Manager, Coordinator, Club Coordinator, Nurse, Counselor, Club Advisor |
| **Student Portal** | Student-facing product | Mobile-first PWA, simplified navigation, task-oriented | All enrolled students (including those who also hold club officer roles) |

### Single SSO — one identity, routed to the right surface

There is a single university SSO. Every user authenticates with their university credentials once. The system then routes them to the correct surface based on their roles:

```
University SSO login
        │
        ├─ Has staff role only?      → SAMA
        │
        ├─ Has student role only?    → Student Portal
        │
        └─ Has BOTH?                 → Access to both surfaces
                                       (exact UX TBD in design —
                                        e.g. a surface chooser or
                                        separate entry points)
```

No separate credentials exist. One identity per person, regardless of which surface they access.

### Part-time student/staff edge case

A student who is also employed part-time in a staff role (e.g. a student working part-time as a Coordinator or administrative assistant) holds both a student identity and a staff role. This person:
- Authenticates once via SSO.
- Has access to **both** the Student Portal (as a student) and SAMA (under their staff role).
- The auth layer must detect this dual-role scenario and present the appropriate access rather than routing exclusively to one surface.

This is a known edge case that must be explicitly handled in the authentication and role-routing layer. The exact UX (e.g. a surface-switcher in the nav, separate bookmarked URLs, or a post-login selector) is to be determined during design.

### Shared backend

Both surfaces call the same API and operate on the same data. An activity submitted by a Club Leader via the Student Portal immediately surfaces as a Draft in SAMA for the Club Coordinator. Status updates written in SAMA (approval decisions, etc.) are immediately visible to the student in the Student Portal. There is no sync lag or data duplication.

---

## 3. Roles & permissions

**Roles are additive** — any authenticated employee can hold multiple roles simultaneously (e.g. Coordinator + Nurse, or Coordinator + Club Coordinator for two clubs). Permissions from each role are **module-scoped**: a Nurse's access to patient records activates only inside the Health module; a Coordinator's approval authority activates only in the Activities module. **Manager is the sole exception** — it is a superset role with full access across all modules and all data in the department, with no module boundary. Roles are assigned by the Manager from the Settings page; no other role can assign roles.

> **v1 simplification**: with one department, "department-scoped" effectively means "system-wide". The schema and authorization checks are designed for multi-department from day one (see §4.0).

### 3.1 Role summary

| Role | Module scope | Primary responsibilities |
|------|-------------|--------------------------|
| **Manager** | All modules, department-wide | Superset of all roles. Strategy, final approvals on all activities and club requests, budget oversight, reports, role assignment, sees all data including welfare. [^1] |
| **Coordinator** | Activities module · assigned activities | Plan, submit for approval, run, edit, close activities; manage rosters for assigned clubs. |
| **Club Coordinator** | Clubs (assigned) | First-step approver for club-created activity requests; club roster and budget management for assigned clubs. Assigned per-club by Manager (many:many — a club can have multiple Club Coordinators; a Coordinator can be Club Coordinator for multiple clubs). |
| **Club Advisor** | Clubs (assigned, notify-only) | Academic or professional oversight of assigned clubs. Receives FYI notifications on key events. No approval authority in v1. Can be internal employees or external (faculty, external professionals). External Club Advisor accounts are a v2 feature. |
| **Employee** | Assigned services/activities only | Run sessions, take attendance, conduct counseling or health appointments, log walk-in visits. |
| **Nurse** | Health module only | Log visits, manage appointment slots, view and update health records for assigned students. Subset of Employee capabilities, module-scoped. |
| **Counselor** | Counseling module only | Manage appointment slots, conduct sessions, record notes, view referrals. Subset of Employee capabilities, module-scoped. |
| **Club Leader** | Own club only | Create and submit club-sponsored activity requests; enter planned budget; manage own club's activity submissions. A student role granted by the Manager or Club Coordinator. |
| **Student** | Tenant-scoped (self-service) | Discover, register, cancel, attend, view history, download certificates, book welfare appointments — across any department's offerings. |
| *(future)* **TenantAdmin** | Tenant-wide | Provisions departments, enables/disables modules per department, manages tenant-level settings. Out of scope for v1; provisioning is install-time. |

**Student Portal roles** — the following are not SAMA roles and do not appear in the §3.2 SAMA permission matrix. They govern access within the Student Portal only.

| Role | Surface | Description |
|------|---------|-------------|
| **Student** | Student Portal only | Any currently enrolled student. Access to the six standard Student Portal tabs: Home, Explore, My Activities, Volunteering, Certificates, Clubs. |
| **Club Officer** | Student Portal only | A student who holds any leadership position in a club (Leader, Vice President, Secretary, Treasurer, or any other designated officer role). Unlocks the elevated "Workspace" tab in the Student Portal. **V1: flat permissions** — all club officers have identical access within "Workspace" regardless of their specific officer title. Differentiated officer permissions are deferred to V2. Club Officers do not receive SAMA access by virtue of their club role. |

[^1]: Manager implicitly holds every role's permissions across all modules.

### 3.2 Permission matrix (high level)

Columns show the **minimum role** required. Manager inherits all. Club Coordinator and Club Advisor permissions are scoped to their assigned clubs only. Nurse/Counselor permissions are scoped to the Health/Counseling module only.

| Capability | Manager | Coordinator | Club Coordinator | Club Advisor | Employee / Nurse / Counselor | Club Leader | Student |
|------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **— Activities —** | | | | | | | |
| Create activity (Draft) | ✓ | ✓ | ✓ (club activities) | – | – | ✓ (own club) | – |
| Submit activity for approval | ✓ auto-approved | ✓ | ✓ (club activities) | – | – | ✓ (own club) | – |
| Approve activity — step 1 (club) | ✓ override | – | ✓ (assigned clubs) | – | – | – | – |
| Approve activity — final / standard | ✓ | – | – | – | – | – | – |
| Reject / request changes | ✓ | – | ✓ (step 1, assigned clubs) | – | – | – | – |
| Publish activity | ✓ | ✓ (own, after approval) | ✓ (club, after Manager approval) | – | – | – | – |
| Edit activity post-publish (non-budget) | ✓ | ✓ (own) | ✓ (assigned club) | – | – | – | – |
| Edit activity post-publish (budget increase) | ✓ | request only | request only | – | – | request only | – |
| Cancel activity | ✓ | ✓ (own) | ✓ (assigned club) | – | – | – | – |
| Raise/lower capacity | ✓ | ✓ (own) | ✓ (assigned club) | – | – | – | – |
| Take attendance | ✓ | ✓ (own) | ✓ (assigned club) | – | ✓ (assigned) | – | – |
| Issue/regenerate certificate | ✓ | ✓ (own) | ✓ (assigned club) | – | – | – | view/download own |
| View activity roster | ✓ all | own only | assigned club only | assigned club (view only) | assigned only | own club | – |
| **— Clubs —** | | | | | | | |
| Create / edit club | ✓ | – | – | – | – | – | – |
| Assign Club Coordinator to club | ✓ | – | – | – | – | – | – |
| Assign Club Advisor to club | ✓ | – | – | – | – | – | – |
| Manage club roster / committees | ✓ | ✓ (assigned) | ✓ (assigned clubs) | – | – | limited (own club) | view own membership |
| Grant Club Leader status | ✓ | ✓ (assigned) | ✓ (assigned clubs) | – | – | – | – |
| View club page & activity list | ✓ | ✓ (assigned) | ✓ (assigned) | ✓ (assigned, read) | – | ✓ (own club) | ✓ (public) |
| **— Budget —** | | | | | | | |
| Create / edit budget suggestion (Draft state) | ✓ | ✓ (own activity) | ✓ (assigned club) | – | – | ✓ (own club drafts) | – |
| Edit budget (Draft and Submitted states) | ✓ | ✓ (own activity) | ✓ (assigned club) | – | – | – | – |
| Record budget transactions | ✓ | ✓ (own activity) | ✓ (assigned club) | – | – | – | – |
| Approve budget change request | ✓ | – | – | – | – | – | – |
| View budget | ✓ all | own only | assigned club only | view only | – | own club only | – |
| **— Welfare (Health & Counseling) —** | | | | | | | |
| Create appointment slot | ✓ | – | – | – | ✓ (own calendar) | – | – |
| Book appointment (on behalf) | ✓ | – | – | – | – | – | ✓ (own) |
| Log walk-in visit | ✓ | – | – | – | ✓ (Nurse only) | – | – |
| View health records | ✓ | – | – | – | ✓ (Nurse, own logs) | – | own summary only |
| View counseling notes | ✓ | – | – | – | ✓ (Counselor, own sessions) | – | own summary only |
| **— System —** | | | | | | | |
| View dashboards | ✓ all | ✓ own scope | ✓ assigned clubs | ✓ assigned clubs (read) | ✓ own scope | ✓ own club | ✓ own profile |
| Build custom reports | ✓ | – | – | – | – | – | – |
| Export CSV / Excel / PDF | ✓ | ✓ own scope | ✓ own scope | – | ✓ own scope | – | own data only |
| View audit log | ✓ | – | – | – | – | – | – |
| Assign roles (Settings page) | ✓ | – | – | – | – | – | – |

### 3.3 Notes
- **Scope of §3.2 permission matrix**: the matrix above covers **SAMA only** — the internal staff tool. The Student Portal has its own permission model, defined in §13 (Student Portal). Student and Club Officer roles are not represented in §3.2 because they do not access SAMA.
- **Part-time student/staff edge case**: a user who holds both a student identity and a SAMA staff role (e.g. a student employed part-time as a Coordinator) must be handled explicitly in the auth layer. They authenticate once and receive access to both surfaces. See §2.5 for routing logic.
- **Manager-as-Coordinator**: Manager can author activities directly. Their submissions auto-approve (no self-approval bottleneck). Manager is always the final approver — they cannot be the Club Coordinator in the approval chain for their own department's club activities (no self-approval).
- **Additive roles**: a user can hold multiple roles simultaneously. The effective permission set is the union of all their role permissions. Example: a user who is both Coordinator and Nurse gets Coordinator permissions in the Activities module and Nurse permissions in the Health module.
- **Module scoping**: each non-Manager role is bounded to its module. Holding a Nurse role does not grant access to Activities data, and holding a Coordinator role does not grant access to health records. The module boundary is enforced at the authorization layer, not just the UI.
- **Club Coordinator vs. Coordinator**: a plain Coordinator manages activities they created. A Club Coordinator manages activities submitted by the club they are assigned to — these are different ownership relationships. A user can be both (e.g. Coordinator for their own events and Club Coordinator for two clubs).
- **Club Advisor permissions**: Club Advisor = Activities (view only for assigned clubs), Budget (view only for assigned clubs), Clubs (view assigned clubs only), Reports (none). They receive notifications but take no approval action in v1.
- **Club Advisor (external)**: in v1, Club Advisors are internal authenticated employees with a read-only assignment. External Club Advisor accounts (for faculty or professionals outside the department) are a v2 feature.
- **Employee, Nurse, Counselor**: Employee is the base kind for non-Coordinator, non-Manager staff. Nurse and Counselor are named role designations that grant specific module-scoped capabilities on top of the base Employee kind.
- **"Own" scoping** for Coordinators: per-activity ownership (creator + co-coordinators) and per-club assignment. Does not extend to other coordinators' activities or unassigned clubs.
- **Student "view own"**: students always see their own registrations, attendance, certificates, appointments, and visit summaries.
- **Role assignment**: only Manager can assign roles, from the Settings page. No self-assignment; no delegation of role-assignment authority in v1.
- **Multi-department roles** (post-v1): a single user may hold different roles in different departments — e.g. Manager in Alumni and Coordinator in Student Activities. Authorization checks always evaluate `(user, department)`.
- **Cross-department access**: a Manager of Department A cannot view Department B's data. Reports do not aggregate across departments unless explicitly tenant-wide (a future TenantAdmin capability).

---

## 4. Domain model

Tech-agnostic entities. Field lists are illustrative, not exhaustive.

### 4.0 Tenancy, departments, and modules

> v1 ships single-tenant, single-department (Student Activities at one university). The schema below is designed to accommodate **multi-department within a tenant** (e.g. Alumni, Colleges) and, later, **multi-tenant SaaS** to other universities, without rework. Every domain entity carries `tenant_id` and (where applicable) `department_id` from day one.

- **Tenant**: id, name (e.g. "Umm Al-Qura University"), code, status, created_at, settings (JSON: branding, time zone, currency, locale).
  - For v1: exactly one Tenant row.
- **Department**: id, tenant_id, parent_department_id (nullable, for future hierarchies), name (e.g. "Student Activities", "Alumni"), code, status, modules_enabled[] (e.g. ["activities", "clubs", "welfare", "budget"]).
  - For v1: one Department row.
  - **modules_enabled** governs which features are available in that department. Alumni might enable {activities, clubs} but not {welfare}; Student Activities enables all.
- **Module**: a registered feature set in code (activities, clubs, welfare-counseling, welfare-health, budget, surveys, media, follow-ups). Modules are the toggleable units a department enables.
- **DepartmentRole**: assigns a User to a Department with a role.
  - Fields: user_id, department_id, role (Manager / Coordinator / Employee), status (active/inactive), assigned_at, assigned_by.
  - A user **may have different roles in different departments** (e.g. Manager of Alumni AND Coordinator of Student Activities). For v1 with one department, this collapses to one role per user.
- **Students** are tenant-scoped, not department-scoped. A student can register for any activity in any department within their tenant (subject to that activity's eligibility rules).
- **TenantAdmin** (future role, post-v1): creates/configures departments, manages cross-department settings, and toggles `modules_enabled` per department. Out of scope for v1.
- **Module enablement in v1**: configured at install time only (via configuration files / DB seed). All modules are enabled for the single department by default. There is no Manager-level UI to toggle modules in v1; that capability is reserved for the future TenantAdmin role.

### 4.1 User & identity
- **User**: id, tenant_id, kind {student, staff, guest}, full_name, email, phone, status (active/inactive), created_at, last_login_at, photo_url, photo_source {feed, student_upload, none}, photo_moderation_status {approved, pending, rejected}.
  - For students (`kind = student`): student_id, program, year, gender, eligibility_attributes (JSON for flexible filters). Students have NO entries in DepartmentRole — they are tenant-scoped consumers.
  - For employees (`kind = staff`, Manager/Coordinator/Employee/Nurse/Counselor/Club Coordinator): one or more entries in DepartmentRole.
  - For guests (`kind = guest`): guest_type {faculty, external, parent, other}. No DepartmentRole, no student_id, no password. See §7.1.6 for the guest registration flow. Email-verified; access is via magic-link only (no main-UI login).
  - Auth: local password (v1, students and authenticated employees only) or Microsoft SSO (later phase). Guests have no password.
- **Profile photo handling**:
  - Default source is the university photo feed (delivered by IT at provisioning and on a periodic refresh). When the feed has a photo, `photo_source = feed` and `photo_moderation_status = approved` automatically.
  - Student can upload an override via their profile page (crop tool). Uploaded photo enters `pending` moderation; only Manager (or a delegated Coordinator) can approve. Approved upload → `photo_source = student_upload`. Rejected → falls back to the feed photo.
  - At any time the student can revert to the feed photo with one click.
  - Photo is displayed on Employee check-in screen (visual verification next to the QR scan), on the student's own profile, and on the staff-facing student view. It is NOT shown in public catalog (§6.1) or to other students.
- **Role**: per-department; see DepartmentRole above. Internal lookup also exposes a derived "primary role" for display (the highest role across departments).
- **Assignment types** (all department-scoped — the activity/club/service lives in one department):
  - `ActivityAssignment`: user_id, activity_id, role {coordinator, employee} — links an authenticated employee to a specific activity as owner/co-coordinator or operational employee. **Assigned by**: Coordinator (own activities) or Manager. **Cardinality**: one owner coordinator + optional co-coordinators + optional employees per activity (many employees can be assigned to one activity). **Permission granted**: coordinator role grants edit/manage/close rights on that activity; employee role grants attendance-taking and session-management rights on that activity.
  - `ClubCoordinatorAssignment`: user_id, club_id, assigned_at, assigned_by — links an internal authenticated employee as first-step approver and manager for a club. **Assigned by**: Manager only. **Cardinality**: many:many (a club can have multiple Club Coordinators; an employee can be assigned to multiple clubs). Any assigned coordinator can act on a pending request (OR logic). **Permission granted**: Club Coordinator role scoped to that club — first-step approval authority, club roster and budget management, write access to club activity pipeline.
  - `ClubAdvisorAssignment`: user_id, club_id, assigned_at, assigned_by, notes — links an internal authenticated employee as a read-only observer for a club. **Assigned by**: Manager only. **Cardinality**: many:many. External advisor accounts are v2. **Permission granted**: Club Advisor role scoped to that club — view-only access to club activities, roster, and budget; FYI notifications on key club events; no approval authority.
  - `WelfareAssignment`: user_id, service_id, role {counselor, nurse, health_staff} — links an authenticated employee to a specific welfare service (Health clinic, Counseling centre, etc.). **Assigned by**: Manager. **Cardinality**: many:many (a service can have multiple assigned employees; an employee can be assigned to multiple services). **Permission granted**: manage-level access to the specific welfare module's records (counseling notes, health records, or visit logs) scoped to the assigned service. Note: "Manager-Welfare" is not a separate role — the Manager role inherently has oversight access to all welfare records across all services without a WelfareAssignment.

### 4.2 Activity & sessions
- **Activity**: id, tenant_id, department_id, type {Event, Program, Workshop, Campaign}, title, description, category/tags, location (physical or virtual + URL), start_at, end_at, capacity, waitlist_enabled (bool), registration_opens_at, registration_closes_at, cancellation_policy (see §6.1), eligibility_rules, prerequisites, requires_approval (bool, default false), fee (free/paid + amount, settled by external finance system — see §7.7), completion_threshold (e.g. 80% sessions for program), per_session_signup_enabled (bool), per_session_capacity_enabled (bool), self_checkin_enabled (bool, default false), is_public (bool, default false), cert_hours (decimal, default = sum of session durations; manually editable), state (see §5), coordinator_approval_phase ENUM('pending', 'coordinator_approved') NULLABLE (non-null only when status='submitted' and trigger condition is met — i.e. the creator has the Club Leader role for the linked club; null for all standard/Coordinator-created activities), creator_id, owner_coordinator_id, co_coordinators[], assigned_employees[], created_at, published_at, cancelled_at, cancellation_reason, language, attachments[], deleted_at (soft delete), version (optimistic locking).
- **Session** (for multi-session programs/workshops): id, activity_id, sequence, start_at, end_at, location, employee_in_charge_id, capacity (nullable; per-session cap if `per_session_capacity_enabled`).
- **SessionSignup** (only when `per_session_signup_enabled`): id, session_id, registration_id, signed_up_at. Indicates intent to attend; does not gate attendance.
- **EligibilityRule**: e.g. allowed_programs[], allowed_years[], allowed_genders[], custom_filters[]. Combined with AND.
- **Prerequisite**: activity_id depends on prior_activity_id (must be Completed) — optional list.

### 4.3 Registration & attendance
- **Registration**: id, activity_id, student_id, status {Pending, Registered, Waitlisted, Cancelled, NoShow, Completed, Failed, Rejected}, registered_at, approved_at (nullable), approved_by (nullable), rejection_reason (nullable), cancelled_at, source {self, on_behalf}, position_on_waitlist (nullable), promoted_from_waitlist_at, fee_status {n/a, pending, paid, refunded} (sourced from finance system — see §7.7), deleted_at (soft delete).
  - **Pending** state used only when activity has `requires_approval = true`. Pending registrations consume a "tentative" slot but don't lock capacity until approved (see §7.1.5).
- **Attendance**: id, registration_id, session_id (or activity_id for single-session), present (bool), check_in_method {QR, manual}, check_in_at, marked_by_user_id, notes.
- **CompletionRecord**: derived; computed when attendance ≥ threshold and any deliverables are met.

### 4.4 Certificates
- **CertificateTemplate**: id, applies_to_activity_type, layout/fields, signatory blocks, branding.
- **Certificate**: id, registration_id, issued_at, verification_code, pdf_url, revoked (bool), revoked_reason.

### 4.5 Clubs
- **Club**: id, tenant_id, department_id, name, description, established_at, status {active, inactive}, logo, social_links, deleted_at. *(Note: the single `advisor_id` field is removed — replaced by the many:many assignment tables below.)*
- **ClubCoordinatorAssignment**: id, club_id, user_id, assigned_at, assigned_by (manager_id). Many:many. Grants the user Club Coordinator role scoped to this club — first-step approver for the club's activity requests, club roster and budget management.
- **ClubAdvisorAssignment**: id, club_id, user_id, assigned_at, assigned_by (manager_id), notes (nullable). Many:many. Grants the user Club Advisor role scoped to this club — read-only observer, receives FYI notifications. v1: internal staff only. v2: add `is_external` flag, `external_name`, `external_email` for faculty/professional advisors with limited external accounts.
- **ClubMembership**: id, club_id, student_id, role_in_club {member, board_member, president, vp, treasurer, club_leader, ...}, joined_at, ended_at, status {active, alumni, removed}.
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
- **ActivityBudget**: id, activity_id, mode {simple, detailed}, planned_amount (in simple mode: entered directly; in detailed mode: auto-summed from line items), student_contribution (in simple mode: optional manual entry for the portion expected from students; in detailed mode: auto-summed from student-funded line items), currency, approved_amount (set by Manager on approval; nullable until approved).
- **BudgetLineItem** (only used in detailed mode): id, activity_budget_id, description, total_amount, funded_by {university, student, split}, university_amount (nullable — computed if split), student_amount (nullable — computed if split), sort_order.
- **BudgetTransaction**: id, activity_id, type {expense, income}, amount, vendor/source, category {catering, venue, supplies, prizes, transport, other}, occurred_at, recorded_by, source {coordinator, system} (income transactions are system-generated from the finance integration — not manually entered), receipt_url (lightweight attachment, separate from Documents module), notes.
- Derived: actual_spent (sum of expense transactions), actual_revenue (sum of income transactions, sourced from finance system), remaining (approved_amount − actual_spent), variance (approved_amount − actual_spent, signed), net_university_cost (approved_amount − actual_revenue).
- **Constraints**: transactions can only be recorded once the activity is in Approved or Active state. Coordinator can record, edit, and delete their own expense transactions. Income transactions are system-generated and cannot be manually edited or deleted by any user. Manager can record, edit, and delete coordinator-entered expense transactions (audit-logged).

### 4.9 Notifications
- **Notification**: id, recipient_user_id, channel {inapp, email, push}, template_key, payload (JSON), state {pending, sent, failed, read}, created_at, sent_at, read_at.
- **NotificationPreference**: per-user opt-in/out per channel and category.

### 4.10 Audit
- **AuditEvent**: id, tenant_id, department_id (nullable for tenant-wide events), actor_user_id, action (e.g. activity.approved, registration.cancelled, certificate.revoked), target_entity_type, target_entity_id, before (JSON), after (JSON), ip, user_agent, occurred_at. Append-only at the application layer.

### 4.11 Reporting
- **ReportDefinition**: id, name, owner_user_id, entity_scope, filters (JSON), columns (JSON), grouping, schedule (optional).
- **DashboardWidget**: pre-built widgets configured per role.

### 4.12 Surveys
- **Survey**: id, activity_id, is_standard (bool), questions (ordered list of question objects), created_at, created_by.
- **SurveyQuestion**: id, survey_id, type {rating_1_5, yes_no, single_choice, multi_choice, open_text, nps}, prompt, options[] (for choice types), required (bool), is_standard (bool — locked, can't be removed).
- **SurveyDispatch**: id, survey_id, recipient_user_id, dispatched_at, submitted_at (nullable). Links recipient to dispatch but NOT to response content.
- **SurveyResponse**: id, survey_id, submitted_at, answers (JSON keyed by question_id). **No student_id**. Anonymity enforced at schema level.

### 4.13 Media gallery
- **MediaItem**: id, parent_type {activity, club}, parent_id, uploader_user_id, type {photo, video}, file_url, thumbnail_url, caption, is_internal (bool — internal-only flag), uploaded_at, deleted_at (soft delete).

### 4.14 Follow-up tasks
- **FollowUpTask**: id, parent_type {activity, club}, parent_id, title, description, owner_user_id, due_date, status {open, in_progress, completed, cancelled}, priority {low, normal, high}, created_by, created_at, completed_at, completion_note.

### 4.15 Closure artifacts
- **PostEventReport** (optional): id, activity_id, outcomes_summary, attendance_highlights, issues, lessons_learned, suggestions, created_by, created_at, updated_at.
- **ActivityClosure**: id, activity_id, closed_by, closed_at, reopened_at (nullable), reopened_by, reopen_reason. Append-only audit-style record of close/reopen events (one row per close cycle).

---

## 5. Master activity lifecycle

This is the single state machine all activities (Event, Program, Workshop, Campaign) flow through. Per-type variations are noted inline.

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
| **InProgress** | system | When `start_at` reached. Activity stays InProgress past `end_at` until manually closed (see §14.1). |
| **Completed** | Coordinator (own) / Manager | **Manual close only.** Coordinator clicks "Close activity" → completion calc runs, surveys dispatch, certificates generate. See §14.1. |
| **Cancelled** | Coordinator (own) / Manager | Manual; sends notifications, marks all registrations Cancelled. |
| **Archived** | Manager / system | After retention period (rule TBD; retention deferred). |
| **(Reopen)** | Coordinator (own) / Manager | A Completed activity can be reopened with reason → state returns to InProgress. See §14.2. |

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
- **Program**: multi-session; attendance per session; completion when `attended_sessions / total_sessions ≥ completion_threshold` (default 80%).
- **Workshop**: single or multi-session; same as Event or Program depending on shape; may require deliverable submission before certificate (optional).
- **Campaign**: may have no registration (open attendance) or registration for specific roles (volunteer slots). Attendance optional. Certificates optional.

### 5.4 System-driven state changes
- A scheduled job evaluates time-based transitions (registration open/close, in-progress) every minute.
- The transition to **Completed is manual** (Coordinator/Manager clicks "Close activity"). Past `end_at`, the activity stays InProgress and a "Ready to close" badge surfaces in the Coordinator dashboard.
- All state transitions emit `AuditEvent` and may trigger notifications.

---

## 6. Module — Activities

### 6.1 Create & edit
- Coordinator opens "New Activity", picks type, fills fields. Required: title, type, description, start/end, location, capacity, registration window, eligibility, completion threshold (auto-defaulted by type), cancellation policy.
- Program/Workshop with multiple sessions: add sessions inline with their own date/time/location/employee. Optionally enable per-session sign-up and per-session capacity (see §7.4).
- Activity may be linked to a sponsoring **Club**.
- Activity may have an optional **Budget**. Two modes are available at creation — coordinator chooses:
  - **Simple mode**: enter a single planned total amount and, optionally, the portion expected from students (e.g. "Total: AED 2,700 · Student contribution: AED 1,200"). Suitable for straightforward activities.
  - **Detailed mode**: enter cost line items, each tagged with who pays — University, Student, or Split (with percentages). The planned total and student contribution are auto-summed. Suitable for co-funded activities (e.g. trips, external events where students pay a portion).
  - Budget is optional; activities with no budget entered behave as zero-budget.
  - All activity types have a Budget tab; only activities in Approved or Active state allow transaction recording.
  - **Registration fee validation**: if a detailed budget has student-funded line items, the system compares the implied per-student cost against the registration fee set on the activity. If they do not match, a warning is shown: *"Budget shows AED 60/student but registration fee is set to AED 50 — update one to keep them aligned."* The fields remain independent; neither auto-updates the other.
  - For Club-organised activities: the Club Leader enters the planned amount at creation as a budget suggestion (write access in Draft state only); the Club Coordinator may adjust it before submission; the Manager sets the approved amount at final approval. See §12.9 for the full budget flow.
- Activity may carry **Prerequisites** (must have Completed activity X).
- Activity may carry **Eligibility** (year, program, gender, custom).
- File **Attachments** (poster, agenda, consent forms, etc.).
- **Cancellation policy** — Coordinator picks one of:
  - **No cancellation** — once registered, the student cannot self-cancel (must contact Coordinator).
  - **Anytime until start** — student can cancel any time up to `start_at`.
  - **Deadline before start** — Coordinator sets a number of hours before `start_at` (e.g. 24h, 72h, 7 days). After the deadline, in-app cancellation is disabled.
  - **Deadline + late-cancellation request** — same as Deadline, but after the cutoff students can submit a "Request to cancel" that goes to Coordinator's queue (approve/reject).
  - Default per type: Event = Anytime, Program/Workshop = Deadline 24h, Campaign = Anytime.
- **Registration approval** — Coordinator can flag the activity as `requires_approval` (default: false / FCFS auto-confirm). When true, registrations enter a **Pending** state and need Coordinator (or Manager) approval. Used for selective opportunities (e.g. "5 spots on a sponsored trip"; "selective workshop"). See §7.1.5 for the flow.
  - **Application form** (when `requires_approval = true`): Coordinator builds a mini-form of 1–5 questions at activity creation. Each question has type {open_text, single_choice, multi_choice}, prompt, options[] (for choice types), required (bool). Students answer at registration time; answers are stored on the Registration and visible to Coordinator/Manager when reviewing the queue.
  - **Reapply policy** (when `requires_approval = true`): Coordinator picks one at creation:
    - `unlimited` (rejected student can reapply as long as registration window is open).
    - `one_retry` (student gets one second chance after a rejection).
    - `final` (rejection blocks any further application for this activity).
- **Per-session sign-up flow** (when `per_session_signup_enabled = true`): Coordinator picks at creation:
  - `register_first` (default) — student must be Registered for the activity before they can sign up for sessions.
  - `signup_first` — sign-up to a session implies (and creates) the activity registration.
  - See §7.4 for behavior details.
- **Self check-in toggle** (`self_checkin_enabled`, default false). When true, students can check themselves into a session by scanning a session-specific QR code (rotates each session, displayed by Employee on screen at the venue). Geofence-optional and time-window-enforced (only valid from session `start_at − 15min` to session `end_at`). Useful for large lectures (200+) where Employee scanning is a bottleneck. Default off — Employee scan is the safer default.
- **Public catalog toggle** (`is_public`, default false). When true, the activity appears in a public (no-login) catalog view that shows: title, brief description, dates, current capacity status (Open / Waitlist / Full). It does **not** show: enrolled student names, photos, eligibility internals, application questions, welfare-adjacent details. Login is still required to register, view full details, or interact. Default off — opt-in per activity, because some activities (welfare-adjacent, scholarship trips, internal-only) should not be public.
- **Guest registration toggle** (`allow_guest_registration`, default false). See §7.1.6 for the guest registration flow. When on, non-students (faculty speakers' attendees, parents at family events, external invitees) can register without a SAMA login. Coordinator decides per activity. Independent of `is_public` — an activity can be private to logged-in students AND allow guest registration via a direct link, or be publicly listed AND restricted to students only.

### 6.2 Approval flow

#### 6.2.1 Standard activity approval (Coordinator-created)
- Coordinator submits → activity enters **Submitted**.
- Manager sees it immediately in the Approvals inbox (dashboard widget + in-app notification).
- Manager can: **Approve**, **Reject (with reason)**, or **Request changes (with comment)** which returns to Draft.
- Manager-authored activities skip Submitted: Draft → Approved on save.
- Approved activity becomes visible to its owner; Coordinator clicks **Publish** to expose it to students.
- **Note**: activities not linked to a club, or club activities not created by a Club Leader, always follow this single-step flow: Coordinator reviews → Manager approves.

#### 6.2.2 Club activity approval (Club Leader-created) — two-step
Club-created activities go through an additional first step before reaching the Manager.

- **Trigger condition**: the two-step flow is triggered when `created_by` has the Club Leader role for the linked club. A Coordinator who creates an activity on behalf of a club (i.e. the creator is not a Club Leader for that club) follows the standard one-step flow in §6.2.1.
- **Submission surface**: Club Leaders submit activity requests from the **Student Portal** ("Workspace" tab) — they do not access SAMA. The submission creates a Draft record in the backend that immediately surfaces in SAMA for the assigned Club Coordinator(s) to pick up.

```
Club Leader submits via Student Portal ("Workspace" tab)
      ↓  (Draft created in backend → surfaces in SAMA as Submitted)
      ↓  (activity enters Submitted — Phase 1: awaiting Club Coordinator)
All assigned Club Coordinators notified simultaneously (in SAMA)
      ↓  (any one Club Coordinator acts — OR logic, first to act resolves)
Club Coordinator: Approve → Phase 2 | Reject → Draft | Request changes → Draft
      ↓  (on Coordinator approval: Manager notified, activity enters Phase 2)
Manager: Approve (final) → Approved | Reject → Draft | Request changes → Draft
      ↓  (on Manager final approval)
Club Advisors receive FYI notification
Club Leader receives approval notification in Student Portal → can Publish
```

- **Club Leader status visibility**: the Club Leader tracks the status of their submission entirely in the Student Portal "Workspace" tab. They see human-readable status updates (e.g. "Your request is in coordinator review", "Approved — awaiting publication", "Changes requested: [reason]"). They never open SAMA.

- **Manager visibility**: Manager sees all Submitted activities from the moment of submission (Phase 1 included), tagged "Awaiting Club Coordinator" in their Approvals inbox. Manager can override and approve directly at any time, bypassing Phase 1.
- **Approval inbox**: club requests appear in the same Approvals inbox used for standard activities. They are tagged with the club name so Coordinators and Managers can filter by club.
- **No intermediate state in the state machine**: the Submitted state carries a `coordinator_approval_phase` marker (pending / coordinator_approved) to drive the two-step UI. The state enum itself does not change — the activity remains in Submitted through both phases.
- **Notifications on Club Leader submission**: on submission by a Club Leader, notifications go to: (a) all Club Coordinators assigned to that club, and (b) the Club Advisor(s) assigned to that club (for awareness only — not an action item for Advisors).
- **Notification on Coordinator step-1 approval**: after a Club Coordinator approves step 1, the Manager receives a notification: "[Club Name] activity '[Title]' has passed coordinator review and awaits your approval."
- **Rejection at step 1 (Coordinator)**: activity returns to Draft with the Coordinator's rejection note. Club Leader can edit and resubmit.
- **Rejection at step 2 (Manager)**: activity returns to Submitted with `coordinator_approval_phase = coordinator_approved` so the Club Leader can see the Manager's rejection reason without needing to redo the coordinator review step. The Club Leader can revise and the Coordinator can re-approve (or the Manager may choose to approve directly on resubmission).
- **Club Advisor**: not in the approval chain. Receives a read-only FYI notification after Manager final approval.

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
- System: sets all Registered → Cancelled, all Waitlisted → Cancelled; emits a cancellation event to the finance system for any paid registrations (refund decisioning lives there — see §7.8); sends notifications; locks the activity from further edits.

### 6.6 Co-coordination
- Activity has one owner Coordinator + optional co-coordinators. Co-coordinators have the same edit/manage rights on that activity.
- Employees are assigned per activity (and optionally per session).

---

## 7. Module — Registration & waitlist

### 7.1 Student registration
- Student opens an activity → sees details, seats remaining, schedule, eligibility match, prerequisites status.
- Student clicks **Register**:
  - System validates: registration window open, eligibility match, prerequisites met, no schedule conflict (see §7.5), capacity not full (or waitlist enabled).
  - If activity has `requires_approval = true` → registration enters **Pending** (see §7.1.5).
  - Else if seats available → **Registered**.
  - Else if capacity full and waitlist enabled → **Waitlisted** with position.
  - If invalid → reason shown.
- Confirmation: in-app + email + push notification with calendar (.ics) attachment for Email.

### 7.1.5 Registration approval (`requires_approval` activities)

- Used for selective opportunities (e.g. 5 spots on a sponsored trip, selective workshops, scholarship-style applications).
- **On register**: registration enters **Pending**. The student fills out the activity's application form (§6.1, 1–5 Coordinator-defined questions) as part of registration; answers stored on `Registration.application_answers`. Notifications: student sees "Application submitted; awaiting decision"; Coordinator gets in-app + email "New application for [activity]".
- **Capacity behavior**: Pending registrations do NOT consume capacity. Multiple Pending registrations can exceed capacity; Coordinator picks within the limit.
- **Queue ceiling**: no cap. Coordinator manages however large the queue grows. Pagination + filters (by application date, eligibility match, prior-rejection flag) help triage.
- Coordinator (own) or Manager opens the **Application queue** for the activity, reviews each pending entry, and clicks **Approve** or **Reject (with reason)**:
  - **Approve** → registration → **Registered**; notification to student. If approving would exceed capacity, system warns; Coordinator can override (counts as manual capacity raise — audit-logged).
  - **Reject** → registration → **Rejected** with reason; notification to student.
- **Reapply behavior** (per activity's `reapply_policy`, set at creation):
  - `unlimited`: rejected student can submit a new application as long as the registration window is open. Each new application is a new Registration row (preserving full history of past rejections, visible to Coordinator).
  - `one_retry`: a single second application is allowed after a first rejection. After a second rejection, blocked.
  - `final`: rejection is final; the student is blocked from any further application for that activity.
  - Coordinator and Manager can see the full rejection history (count + reasons) on each application during review.
- **Auto-decision deadline**: Coordinator can set an optional "auto-reject after X days unprocessed" setting; default off. (Distinct from the no-cap queue policy: Coordinator may want to clear stale applications.)
- **Bulk actions**: Coordinator can approve / reject multiple pending applications at once with a shared reason (audit-logged in batch).

### 7.1.6 Guest registration (non-students, no login)

When the activity's `allow_guest_registration = true`, non-students can register without a SAMA account.

**Guest data model** — guests live in the `User` table with a separate flag, so existing code paths (roster, attendance, certificate issuance, cancellation, finance reference) work uniformly.

- **Guest** is a `User` with `kind = guest` (vs. `student` / `staff`). Required fields at registration: `full_name`, `email`, `phone`, `guest_type {faculty, external, parent, other}`. No password, no department role, no `student_id`.
- Guests are tenant-scoped (belong to a tenant), not department-scoped.
- A guest record persists across activities — if the same email registers for a future activity, the existing record is reused (after email verification).

**Flow**:
1. Coordinator publishes the activity with `allow_guest_registration = true`. A **public guest-registration URL** is generated (signed, activity-scoped, optional expiry = activity `end_at`).
2. Coordinator shares the URL externally (email blast, social post, printed QR). No login required to open it.
3. Guest opens the URL → fills the registration form (name, email, phone, guest_type, plus any application questions if `requires_approval = true`). Email is verified via a magic link before the registration finalizes (prevents typosquatting and gives the guest a manage-registration URL).
4. **Paid activities**: after email verification, guest is forwarded to the finance gateway (same external system as for students, §7.8). Finance sends back the reference number, which is attached to the registration. SAMA tracks `fee_status` as for students.
5. **Approval-required activities**: guest registration sits as `Pending` until Coordinator/Manager decides — same approval queue, no special path. Approval / rejection emails sent to the guest.
6. Once Registered, the guest receives a confirmation email containing:
   - Activity details (date, time, location, joining link if virtual).
   - A **check-in QR code** (printable + visible in the email) — same QR format Employees scan as for students.
   - A **magic link to "Manage my registration"** — a tokenized URL that opens a guest portal (no password). From there the guest can: see their registration, cancel it (subject to the same `cancellation_policy`), view their certificate after the activity, see paid-status.

**Capabilities a guest does NOT have**:
- Cannot log into the main SAMA UI (no password, no role).
- Cannot see other activities, the catalog, welfare, clubs, anything beyond their own registrations via the magic link.
- Cannot receive welfare appointments (no profile in v1).
- Does not appear in eligibility-rules matching (`allowed_programs`, etc. — those apply to students only).

**Attendance & completion**: identical to students. Guest's session attendance is tracked, completion threshold applied, NoShow recorded. Reports include guests with a clear "Guest" badge.

**Certificate issuance**: if the activity issues certificates and the guest meets completion, a certificate is generated and emailed (downloadable from the guest's magic link). The cert's verification URL works the same as for students. **Survey gating still applies**: the guest is emailed the survey link; cert unlocks on submission or after the 30-day auto-release fallback.

**Magic-link security**:
- Tokens are activity-scoped, registration-scoped, single-use for the email-verification step, and reusable but expirable for the "manage my registration" portal (default expiry 30 days post-activity).
- Lost link: guest enters their email on the public page; a new magic link is sent (rate-limited to prevent spam).

**Bulk import for invited guests**: Coordinator can paste a CSV (name, email, phone, guest_type) of invited guests, pre-creating their registrations. Each gets a personalized magic link emailed to confirm. Useful for "we invited 30 parents — pre-register them".

**Audit & reporting**: every guest registration is audit-logged. Guest rosters and counts show on the activity dashboard alongside student counts (separated: "Students: 42 / Guests: 8").

**Privacy & profile**: guests do not appear in cross-activity student search, do not get a "student-style" profile page, and are excluded from internal dashboards that focus on student engagement. Their data is retained per §15.11.

### 7.2 Cancellation by student

- Behavior depends on the activity's **cancellation policy** (set at creation, see §6.1):
  - **No cancellation** → in-app cancel disabled. Student must contact Coordinator out-of-band; Coordinator can cancel on student's behalf with reason.
  - **Anytime until start** → cancel button enabled until `start_at`.
  - **Deadline before start (X hours)** → cancel button enabled until `start_at − X hours`. After cutoff, disabled.
  - **Deadline + late-cancellation request** → after cutoff, button changes to "Request to cancel"; student supplies reason; goes to Coordinator's queue.
- On cancellation: registration → Cancelled; if a Registered student cancels and a waitlist exists, top of waitlist auto-promotes (see §7.3).
- Cancelled registrations remain in the audit trail; soft-deleted only if Manager explicitly deletes.

**Late-cancellation requests — handling and indefinite queue:**

- Coordinator (own) or Manager reviews the late-cancellation queue. Approve → registration → Cancelled (waitlist auto-promotion follows §7.3); Reject → student stays Registered.
- **Unprocessed past `start_at`**: requests **remain in the queue indefinitely**. They do not auto-resolve. Coordinator can decide retroactively — even after the event has happened:
  - If approved post-event, the registration moves to Cancelled. Note: this can supersede a NoShow that the system already auto-set; the audit log captures both transitions and the human decision.
  - This intentional design lets Coordinators be lenient about genuine emergencies (illness, family issues) brought up after the fact, while still penalizing pure no-shows.
- **Notification**: student is notified on decision regardless of how long it took. Coordinator dashboard surfaces overdue requests (>7 days unprocessed) as a soft nag.
- **Reporting**: late-request approval rate per Coordinator is a Manager-visible metric (signal for fairness consistency).

### 7.3 Waitlist mechanics
- FIFO ordered queue. Position visible to student.
- Auto-promotion on:
  - A Registered student cancels.
  - Capacity is raised by Coordinator.
- **Promotion is auto-confirm — no separate confirmation window.** Promoted student's registration → Registered immediately; in-app + email + push notification fires: "A seat opened up — you're now Registered for [activity]. If you can't make it, please cancel."
  - Rationale: lower friction; the existing cancel flow handles the "actually I can't come" case and frees the seat for the next person automatically.
  - Trade-off: a non-engaged promoted student who doesn't check the app might silently no-show. Acceptable because attendance/no-show tracking already surfaces this pattern.
- Waitlist may be capped (configurable) or unlimited.

### 7.4 Capacity model — hybrid (program roster + per-session)

> Activity capacity is a single program-wide cap by default ("the team of 30"). For multi-session activities, optional per-session features layer on top. Attendance is decoupled from sign-up.

**Three layered concepts:**

1. **Activity-wide capacity** (`Activity.capacity`) — the master roster size. Always set. A student with status Registered occupies one seat in this roster, regardless of which sessions they attend. This is the "team" size.
2. **Per-session sign-up** (optional, `per_session_signup_enabled`) — students indicate intent to attend specific sessions. Helps the Coordinator plan logistics (catering, materials, room setup). Sign-ups are non-binding: a student who didn't sign up can still attend; one who did can still be a no-show.
3. **Per-session capacity** (optional, `per_session_capacity_enabled`) — each session has its own cap (e.g. football team is 30, but only 20 jerseys for training). Enforced at sign-up: if a session is full, sign-up is blocked with a "session full" message; student can sign up for another session. **Walk-in attendance is allowed past capacity** — see below.

**Sign-up flow** (per-activity, set at creation via `signup_flow`):

- **`register_first`** (default) — student must be Registered for the activity (subject to eligibility, prerequisites, registration window) before they can sign up for any session. Sign-up is a separate step inside the activity page.
- **`signup_first`** — student signs up directly for one or more sessions. The first sign-up creates an implicit Registration for the activity (subject to capacity/approval rules). Useful for drop-in lecture series where the "team" concept is loose.

**Per-session sign-up window:**
- Coordinator can set per-session `signup_opens_at` and `signup_closes_at` per session.
- Sign-up windows can be narrower than the activity's registration window (e.g. register at semester start, sign up for each lecture 24h before).

**Per-session sign-up cancellation:**
- Student can un-sign-up from a session anytime up to that session's `start_at`. Frees the seat in per-session capacity, allowing waitlist promotion at the session level (if implemented — see §19.3 gap).
- Un-sign-up does NOT cancel the activity registration.

**Attendance behavior — walk-ins allowed past capacity:**
- Attendance (QR or manual mark) is taken per-session and is **independent of sign-up**.
- **Walk-ins are allowed even when a session is at or above its per-session capacity.** Per-session capacity governs sign-ups (planning/preparation), not physical attendance.
- When a walk-in pushes attendance above per-session capacity, the system shows the Employee a non-blocking warning ("Session capacity exceeded by N walk-ins"), records the attendance normally, and surfaces the count to the Coordinator dashboard.
- A student who signed up but didn't attend is marked Absent (counts toward no-show metrics if applicable).
- For Coordinator visibility: each session shows four counts — `signed_up`, `attended_signed_up`, `walked_in_without_signup`, `signed_up_no_show`.

**Completion calculation (unchanged):**
- For programs: completion = `attended_sessions / total_sessions ≥ completion_threshold`.
- Sign-up does not affect completion. Only attendance does.

**Examples:**
- *Football team*: capacity 30 (the squad). Per-session sign-up enabled, per-session capacity 20 (training session limit). 30 students register. Each training session, students sign up for 20 slots. 18 actually attend; 2 walk in unannounced and are still marked Present.
- *Public Speaking program*: capacity 25 (everyone takes the full program). Per-session features OFF. Attendance per session for completion calc.
- *Drop-in lecture series*: capacity 100. Per-session sign-up enabled, per-session capacity 100. Each lecture has its own room.

**Constraints:**
- Per-session features are only available for multi-session activities (Program, multi-session Workshop).
- Per-session sign-up window can differ from registration window: e.g. register at semester start, sign up week-by-week.
- Conflict detection (§7.5) applies at the session level when per-session sign-up is on.

### 7.5 Conflict detection (block)
- At registration time, system checks the student's existing **Registered** activities for time overlap with this activity's `start_at` ↔ `end_at` (or any of its sessions).
- If overlap → registration **blocked** with a clear message naming the conflicting activity.
- For multi-session programs: each session is checked individually; conflict on any session blocks the registration.
- Manager / Coordinator on-behalf registration: same rule by default; with explicit override option (logged in audit).

### 7.6 On-behalf registration
- Coordinator (own activity) and Manager can register a student manually (e.g. walk-in, special case).
- The student receives the same notifications.
- Eligibility/prerequisite/conflict rules apply by default; override available with reason (audit-logged).

### 7.7 No-show handling
- After an activity ends, registrations with no attendance are marked **NoShow**.
- **Policy**: track only — no automatic blocking, no penalty. Coordinator and Manager can see no-show rate per student in their profile/history.
- Manager can produce a "high no-show students" report (custom report builder).

### 7.8 Finance integration (read-only) & paid activities

> **SAMA does not process payments.** Payment is owned by the university's separate **finance system**. SAMA reads payment status from finance and reflects it on the registration. SAMA never charges, refunds, or stores card data.

**Activity fees:**
- Activity has `fee.amount` and `fee.currency`. If `fee.amount = 0`, no payment flow runs.
- For paid activities, on registration the student is shown the fee and instructions for payment in the finance system (e.g. "Pay via finance portal at [URL]; reference number {generated}"). Reference number is generated by SAMA and includes registration_id.

**Read-only sync from finance:**
- SAMA exposes registration ID + reference number to finance.
- Finance pushes (or SAMA polls) payment events back: `{reference_number, amount, status, paid_at, transaction_id}`.
- SAMA maps the event to the registration → updates `fee_status` ∈ {pending, paid, refunded, partial_refund} and `paid_amount`.
- **Integration mechanism (webhook / poll / message bus / file drop) is deferred to a separate Finance Integration Spec.** SAMA is built with a **pluggable finance adapter** so the chosen mechanism can be swapped without touching application logic. The adapter's contract is:
  - `record_pending(registration_id) → reference_number` (called when a paid registration is created).
  - `apply_event(payload) → registration_id` (called when SAMA receives a finance event in any form).
  - `emit_cancellation(registration_id, reason)` (called on activity or registration cancellation).
- Default adapter for v1 development: stub adapter with manual UI for Manager/Coordinator to mark "paid" for testing.

**Effect on registration state:**
- Default behavior: registration becomes **Registered** immediately on submission (subject to capacity/approval rules) regardless of payment status. `fee_status = pending` is shown next to the registration.
- Coordinator can configure per-activity: `payment_required_to_attend` (boolean). If true, students with `fee_status = pending` are blocked from check-in until payment clears. Display shows "Payment pending" badge.
- If `payment_required_to_attend = true` and the student arrives at the event with payment still pending, Employee can override at check-in (audit-logged).

**Refunds:**
- Triggered in finance when SAMA cancels a registration or activity.
- SAMA emits a "cancellation event" payload to finance: `{registration_id, reference_number, reason, cancelled_at}`. Finance decides the refund amount per its own policy.
- SAMA reflects `fee_status = refunded | partial_refund` once finance confirms.
- Activity-level cancellation policy (full / partial by date / none) is **informational metadata** that SAMA passes to finance via the cancellation event; SAMA does not enforce the refund calculation.

**Reporting:**
- Manager dashboards show payment-status breakdown per activity: paid / pending / refunded / refused.
- Manager can export a paid-registrations list as CSV for finance reconciliation.
- SAMA does NOT show financial totals collected (those live in finance).

---

## 8. Module — Attendance

### 8.1 Methods
1. **QR check-in**: each session has a unique, time-bounded QR code displayed on a screen / available to the Employee. Student scans with the PWA → marked Present. Server validates: QR validity window, student is registered, location/geofence (optional), not already checked in.
2. **Manual mark**: Employee opens the session attendance sheet, sees registered students, marks Present/Absent/Late, saves. Bulk "mark all present" available with confirmation.
3. **Self check-in (optional)**: For low-stakes events, students can self-check-in via a session code without QR (configurable per activity).

### 8.2 Per-session vs. per-activity
- Single-session (Event, single Workshop): one attendance record per registration.
- Multi-session (Program, multi-day Workshop): one record per session per registration.

### 8.3 Late / partial credit
- Configurable: whether "Late" counts as Present for completion calculation. Default: counts as present.
- Half-credit option (e.g. left early) — recorded as flag, doesn't impact completion by default.

### 8.4 Completion calculation
- For programs: `present_count / total_sessions ≥ completion_threshold` → Completed.
- For events/workshops: present at the (single) session → Completed.
- Completion is **finalized at manual closure** (§14.1). Until then, "would-be" status is shown as preview only.
- Coordinator can manually flip a student's status with reason (audit-logged) before or after closure.
- *(Deferred: deliverable-based completion not in v1.)*

### 8.5 Edits & corrections
- Attendance can be corrected by Coordinator/Employee on assigned activity for X days post-session (configurable, e.g. 7 days). Edits are audit-logged.
- After window closes, only Manager can edit, with reason.

---

## 9. Module — Certificates

### 9.1 Templates
- Per activity type (Event, Program, Workshop, Campaign) there is a default template; Coordinator can pick a different template at creation.
- Template includes: branding, title, student name, activity title, date(s), hours, signatory, verification code + QR.
- Manager manages templates (CRUD).

### 9.1.1 Certificate hours
- Each activity has a `cert_hours` field on its Activity record. Coordinator sets it manually at creation.
- **Default value**: pre-populated from the sum of session durations (e.g. four 90-minute sessions → 6 hours). Editable.
- Coordinator can override the default to account for prep work, between-session deliverables, or to round to standard CPD multiples.
- The hours appear on the issued certificate exactly as set.
- Change to `cert_hours` after certificates are issued: triggers a re-issue prompt for already-issued certs (audit-logged).
- For Campaign-type activities (which may not have sessions), `cert_hours` defaults to 0 and is staff-set if relevant.

### 9.2 Issuance
- Auto-generated when a registration reaches **Completed** state — which only happens after the Coordinator manually closes the activity (see §14.1).
- Generated as PDF, stored, with a unique **verification code** and a public verify URL.
- **Survey gating** (default for any activity that issues certificates): the certificate is generated and exists, but the student cannot download/view it until they submit the standard post-activity survey (§14.3). Locked-state UI shows "Submit your feedback to unlock your certificate."
- **Override**: Coordinator (own) or Manager can release a certificate to a specific student without survey submission, with reason (audit-logged).
- **Auto-release fallback**: 30 days post-closure, certificates auto-unlock regardless of survey status.
- Anyone (without login) can paste the verification code on the public verify URL to confirm authenticity.

### 9.3 Revocation
- Coordinator (own activity) or Manager can revoke a certificate with reason (e.g. attendance was wrongly recorded).
- Revoked certificate's verify URL shows "Revoked" with reason and date.
- Audit-logged.

### 9.4 Re-issue
- If the student name was wrong (corrected in profile) or template updated, certificate can be regenerated; old version is superseded but verifiable as superseded.

---

## 10. Module — Clubs

### 10.1 Lifecycle
- **Club formation**: Club creation requires Manager approval. A Club Leader submits a club formation request (name, description, proposed mission/scope); the Manager approves or rejects the request. On approval, the Manager creates the Club record: name, description, logo. Status = Active.
- Club has a persistent presence (page visible to students and all internal authenticated employees).
- Manager assigns authenticated employees to the club using two distinct roles (see §4.5 for data model):
  - **Club Coordinator(s)**: internal authenticated employees who manage the club's activities, budget, and roster. First-step approvers for club activity requests. Many:many — a club can have multiple, an employee can be Club Coordinator for multiple clubs.
  - **Club Advisor(s)**: internal authenticated employees (v1) or external faculty/professionals (v2) with read-only observer access. Receive FYI notifications. Not in the approval chain. Many:many.
- Manager can update assignments at any time from the Club settings page or from the system Settings page.
- **Club suspension**: Club Coordinator can suspend a club (sets status to inactive, pending Manager confirmation). Manager must confirm the suspension for it to take effect.
- **Club archival**: Manager can permanently archive a club. Archived clubs retain all historical data (activities, memberships, budget records) but no new activity can be submitted and the club no longer appears in active listings.

### 10.2 Roster & membership roles
- Students apply to join a club from the student portal, or are added directly by a Club Coordinator or Manager.
- Each membership carries a **role-in-club**: member, board_member, president, vp, treasurer, club_leader, or custom.
- **Club Leader** is a special role-in-club that grants the student the Club Leader system role for that club: they can create and submit activity requests, enter planned budgets, and view the club's activity pipeline.
- Membership history tracked: joined_at, ended_at, status {active, alumni, removed}. Alumni view shows past members.
- Club Coordinator (and Manager) can promote/demote, remove (with reason), and close membership. Club Coordinator can grant and revoke Club Leader status.

### 10.3 Committees
- Sub-groups within a club (e.g. Marketing, Logistics, Events).
- Each committee has a lead and members drawn from the club roster.
- Committee can be linked to specific activities the club sponsors.

### 10.4 Club activity requests — approval flow
- A Club Leader creates an activity request on behalf of the club. The activity is associated with the club (sponsoring_club_id).
- On submission, all Club Coordinators assigned to that club are notified simultaneously.
- **Any one Club Coordinator** can act: Approve (advances to Manager), Reject (returns to Draft with reason), or Request changes (returns to Draft with comment). First to act resolves — others' queue items clear automatically.
- On Club Coordinator approval: activity enters Phase 2 (awaiting Manager). Manager is notified. The activity appears in the Manager's Approvals inbox tagged with the club name.
- **Manager is the final approver** for all club activities, identical to standard activities. Manager can override Phase 1 and approve directly at any time.
- On Manager final approval: Club Advisors receive a FYI notification. Club Leader is notified and can Publish the activity.
- Full two-step flow documented in §6.2.2.

### 10.5 Recurring meetings (clubs that meet weekly)
- Recurring meetings (e.g. "Photography Club meets every Tuesday 7pm") are modeled as **one Program-type activity per academic term**, with weekly sessions as the Program's Sessions.
  - Example: a club running for the Fall 2026 term creates one Program-type activity "Photography Club — Fall 2026" with ~14 weekly sessions.
  - Members register once for the Program (via club membership → Club Coordinator can bulk-register the club roster). Attendance is tracked per weekly session as for any Program.
  - Completion threshold and certificate apply at term end (same Program flow).
- Per-session sign-up is typically off for club meetings (the roster is the club roster, members come every week).
- A new term = a new Program. Clone-from-closed (§16 Scenario M) makes the next term's setup one-click.
- **Why Program-per-term rather than ad-hoc weekly events**: one budget, one roster, one certificate, one dashboard entry — operationally lighter and matches academic-term reality. A proper open-ended recurrence model (no end date) is deferred to v2.

### 10.6 Club Leader data visibility
- Club Leaders can view their own club's detail page, activity list, and member roster.
- Club Leaders cannot see other clubs' member lists or budgets.
- Club Leaders can view the pipeline of their own club's activity requests (draft, submitted, approved, rejected).

### 10.7 Club metadata editing
- Club metadata (name, description, meeting schedule, contact email) can be edited by the assigned Club Coordinator or Manager.
- A Club Leader can propose changes via a free-text change request submitted to the Club Coordinator. The Coordinator reviews the request and applies the changes if appropriate.

### 10.8 Membership requests
- Students can apply to join a club from the student portal.
- Membership requests are approved or rejected by the Club Coordinator assigned to that club, or by the Manager.
- Club Leaders can view pending membership requests for their own club but cannot approve or reject them in v1.

### 10.9 Reporting
- Manager dashboard: number of active clubs, member counts, activity counts, Club Coordinator list, pending club requests.
- Club Coordinator view: activity pipeline for assigned clubs, member roster, budget summary.

### 10.10 Club Leader interface (Student Portal)

Club Leaders, Vice Presidents, and all other club officers are students. They do not use SAMA at any point — everything described in this section happens via the **Student Portal** "Workspace" tab, which is unlocked for any student holding a club officer role.

Everything described elsewhere in §10 from the Club Leader's perspective (submitting activity requests, viewing the club pipeline, reviewing membership applications) is accessed through the "Workspace" tab in the Student Portal, not through SAMA. Their submissions arrive in SAMA as Drafts; a Club Coordinator picks them up from there.

**Workspace tab features (V1):**
- Submit activity requests for their club (creates a Draft in SAMA)
- Review and respond to incoming membership applications (approve/decline inline)
- Track status of submitted activity requests (Draft → In coordinator review → Pending manager approval → Approved/Rejected)
- View club budget snapshot (read-only — approved amount, spent, remaining)
- View their officer roles across all clubs they lead

**V1 flat permissions within "Workspace":** all club officers (Club Leader, Vice President, Secretary, Treasurer, and any other designated officer role) have identical access within the "Workspace" tab. Role differentiation within club leadership is deferred to V2.

**Club Leader never touches SAMA.** If their submission is approved, they see the status update in the Student Portal. The Club Coordinator is responsible for adjusting, completing, and formally submitting the request in SAMA before it reaches the Manager.

---

## 11. Module — Welfare services

### 11.0 Welfare role permission matrix

The welfare module supports multiple specialized Employee roles (Counselor, Nurse / Health staff, Housing staff, etc.). Cross-track visibility is **not strict siloing** and **not all-open** — it's a **per-role permission matrix** configured by the Manager.

For each welfare role and each welfare module, the matrix grants one of:
- `none` — role cannot see this module at all (not even visit counts).
- `summary` — role sees high-level summary only (visit dates, status, no notes). Useful for "I should know my student saw a nurse last week" without leaking content.
- `view` — role can read full notes (read-only).
- `manage` — role can create and edit records in this module (their own primary track).

**Defaults out-of-the-box** (Manager can adjust):

| Role | Counseling | Health | Housing | Other |
|---|---|---|---|---|
| Counselor | manage | summary | none | none |
| Nurse / Health | none | manage | none | none |
| Housing staff | none | none | manage | none |
| Manager | view | view | view | view |

- The "Nurse can have view on some modules, Counselor only sees her module" pattern is achievable by editing the matrix per role.
- Every read of any welfare record (counseling note, health note, housing log) is audit-logged regardless of role (§15.4).
- A student opening their own profile sees: appointment dates + attending staff name + status. They do **not** see notes content by default (see §11.4 for the student-visible summary).
- Changing the matrix is audit-logged; new permissions apply prospectively (not retroactive to prior reads).

### 11.1 Counseling (1:1 only)
- **Slots**: counselor (Employee) creates open slots on a calendar (recurring or one-off). Slots have duration (e.g. 45 min).
- **Booking**: student selects a slot, optionally provides a brief reason. Confirmation via in-app + email. Reminder 24h before via push + email.
- **Cancellation**: student or counselor can cancel up to a configurable window before the slot. Late cancellation recorded.
- **Session record**: counselor opens the appointment, fills **CounselingNote** (body, attachments). Marks status (Completed / NoShow / Cancelled).
- **Visibility**: governed by the §11.0 matrix. Default: `manage` for Counselors on their own assigned students; `view` for Manager; `summary` (visit dates only, no content) for adjacent roles like Nurse only if the matrix grants it. Other Employees see nothing. Audit log records every read.

### 11.2 Health
- **Appointments**: same shape as counseling — slots, booking, reminders, cancellation, post-visit notes.
- **Walk-in visit logs**: Employee (health staff) records a walk-in: select student, complaint, action, referral, follow-up flag, notes. No prior booking required.
- **Visibility**: governed by the §11.0 matrix. Default: `manage` for Nurse / Health on all health records; `view` for Manager; `summary` for Counselor (i.e. counselor sees "Student X had a health visit on date Y" but not the medical content).
- **Student.health_notes** (chronic conditions, allergies, etc. — informational flags on the student record): visible to any role with at least `summary` on Health. Surfaces a non-medical alert on the profile ("This student has a flagged health condition; contact Health for details").

### 11.3 Sensitive-data handling
- RBAC is the §11.0 permission matrix; there's no separate "high-privacy mode" — the matrix is expressive enough.
- Mandatory: every read of a counseling note, health note, or visit log is audit-logged (actor, target, timestamp). Non-negotiable.
- Notes/logs are encrypted at rest at the storage layer.
- Export of welfare records is restricted to Manager and audit-logged with reason field.

### 11.4 Student-visible welfare summary
- When a student opens their own profile → Welfare tab, they see:
  - List of past appointments (date, time, module, staff name, status).
  - Upcoming appointments with reschedule / cancel actions (within policy windows).
  - **No notes content.** A student cannot read what the counselor wrote about them in v1. Rationale: counselor needs candor for accurate clinical notes; a future "shared note" feature is post-v1.
- Students do not see flags like `health_notes` or `housing_priority` directly on their own profile (those are staff-facing tags).

---

## 12. Module — Budget tracking

### 12.1 Scope & availability
- All activity types (Event, Program, Volunteering, Task, External) have a **Budget tab** in their detail view.
- Budget is **optional** at creation. An activity with no budget entered behaves as zero-budget; the Budget tab is still visible and always shows the four stat cards (Planned, Approved, Spent, Remaining) — unset values display as "—" and Spent shows AED 0. An inline prompt invites the Coordinator to add a planned amount.
- Transaction recording is **locked until the activity reaches Approved or Active state**.

### 12.2 Budget modes
Two modes are available; Coordinator selects at creation (can switch to detailed before submission):

**Simple mode** — a single planned total amount, with an optional `student_contribution` field for activities where students pay a portion. Suitable for activities with straightforward, fully university-funded spend.

**Detailed mode** — cost is broken into named line items, each tagged with who funds it:
- **University** — fully covered by the department.
- **Student** — fully covered by student registration fees.
- **Split** — a percentage split between university and students (e.g. 40% uni / 60% student). The system computes each party's share.

The planned total and student contribution figure are auto-summed from line items in detailed mode.

*Example:*
| Line item | Total | Funded by | Uni | Student |
|---|---|---|---|---|
| Water park entry (×20) | AED 2,000 | Split 40/60 | AED 800 | AED 1,200 |
| Transport | AED 500 | University | AED 500 | — |
| Supervisor | AED 200 | University | AED 200 | — |
| **Total** | **AED 2,700** | | **AED 1,500** | **AED 1,200** |

### 12.3 Planned vs. actual
- Each activity has a **planned amount** and an **approved amount** (set by Manager on approval — may equal planned or be reduced). Both are visible to the Coordinator.
- The Budget tab header always shows six stat cards: **Planned · Approved · Spent · Remaining · Expected revenue · Received revenue**.
- System computes: `actual_spent`, `remaining = approved − actual_spent`, `variance`, `net_university_cost = approved − actual_revenue`.

### 12.4 Transactions
**Expense transactions** (coordinator-entered):
- Fields: amount, category {Catering, Venue, Supplies, Prizes, Transport, Other}, vendor/source, date, receipt (lightweight attachment — separate from Documents module), notes.
- Who can record: Coordinator (own), Club Leader (own club), Manager (any). All edits/deletions audit-logged.
- Coordinator can edit and delete their own entries; Manager can edit/delete any.

**Income transactions** (system-generated only):
- Created automatically by the finance integration (§7.8) when student payments are confirmed. Not manually enterable by any user.
- Fields: amount, registration_id (reference), paid_at, transaction_id (from finance system).
- Visible in the Revenue section of the Budget tab, not in the expense transaction list.

### 12.5 Revenue tracking
- The **Revenue section** in the Budget tab reads student payment status directly from the finance system (§7.8).
- Displays: Expected revenue (student-funded total from budget) · Received (sum of `paid` fee_status registrations) · Pending (sum of `pending` fee_status registrations) · Refunded.
- **Registration fee validation**: in detailed mode, if the student-funded per-head amount implied by line items does not match the registration fee set on the activity, the system shows a persistent warning: *"Budget shows AED 60/student but registration fee is set to AED 50 — update one to keep them aligned."* Both fields remain independent; neither auto-updates the other.
- For activities with no student-funded lines, the Revenue section shows "No student fees for this activity."

### 12.6 Budget warnings & alerts
- When `actual_spent` reaches **80% of approved_amount**: visual warning in Budget tab (amber) + in-app notification to Coordinator and Manager.
- When `actual_spent` **exceeds approved_amount**: indicator turns red, separate over-budget alert fires. Recording is not blocked.

### 12.7 Budget change requests
- To **increase** approved amount: Coordinator submits a change request (new target + reason). Decreasing is free (audit-logged, no request needed).
- Change request surfaces in **two places**: Approvals inbox (same queue as activity approvals) + inline banner in the Budget tab.
- On approval: `approved_amount` updates immediately, Coordinator notified. On rejection: Coordinator notified with reason, amount unchanged.
- At most one pending change request per activity at a time.

### 12.8 Purchase request / PRF workflow (v1 note, v2 full implementation)
- In the current department process, spending requires a **Purchase Request Form (PRF)** routed through: Coordinator → Manager → Procurement → Finance → President sign-off.
- **v1**: SAMA does not implement the multi-step PRF chain. For any activity with a budget set, the Budget tab displays an informational banner: *"A Purchase Request Form (PRF) is required before spend begins. Submit via the standard process."* This makes the requirement visible without enforcing it in the system.
- **v2**: Full PRF workflow — Coordinator fills the PRF inside SAMA using the budget line items as the basis; routed for approvals; linked to the activity. Tracked status (Submitted / Approved / Rejected) visible in the Budget tab.

### 12.9 Club-organised activity budgets
- **Budget flow for club activities**: Club Leader creates a draft activity including a budget suggestion (planned amount in simple or detailed mode) → Club Coordinator reviews the draft and may adjust the budget before formally submitting it to the Manager → Manager approves and sets the final approved amount. Mechanically this is Draft → Submitted → Approved. Visually the flow should feel like two distinct steps (Club Leader creates/suggests; Coordinator reviews and adjusts/submits; Manager approves).
- **Club Leader budget access**: Club Leaders have write access to the budget only while the activity is in Draft state — they can create and edit their budget suggestion on their own club's drafts. Once the activity advances past Draft, the Club Leader can no longer edit the budget; only Club Coordinator and Manager can.
- **Club Coordinator budget access**: Club Coordinators have write access to the budget in both Draft and Submitted states for their assigned clubs. They can adjust the Club Leader's suggestion before or after submission to the Manager.
- Budget change requests from Club Leaders follow the same path as Coordinators (submit request → Manager approves).
- Club Leaders see full Budget tab for their own club's activities only.

### 12.10 Reporting
- **Per-activity** (Budget tab): planned vs. actual, line item breakdown, transaction list, revenue section, variance, net university cost.
- **Department-wide** (Reports module): total spend by month, by activity type, by club, by Coordinator. Over-budget flags. Variance reports. Exportable as Excel (.xlsx).

### 12.11 Currency
- Single currency in v1 (configurable at deployment — default AED for UAE deployments). Multi-currency deferred.

---

## 13. Student Portal

The Student Portal is a distinct product surface — not a module of SAMA — designed for all currently enrolled students. It shares the same backend and data as SAMA; there is no separate database and no sync lag. Actions taken in the Student Portal are immediately visible in SAMA and vice versa.

### 13.1 Surface description

- **Type**: Mobile-first PWA (Progressive Web App) / responsive web application.
- **Target users**: all currently enrolled students at the university, including students who also hold club officer roles.
- **Design philosophy**: simplified, task-oriented navigation optimized for mobile. Information density is low relative to SAMA (which is desktop-first and information-dense).
- **Entry point**: students authenticate via the single university SSO. Users with only student roles are routed directly to the Student Portal. Users with both student and staff roles have access to both surfaces (see §2.5).

### 13.2 Standard tabs (all students)

Every enrolled student has access to the following six tabs:

| Tab | Contents |
|-----|----------|
| **Home** | Personalized activity feed, upcoming registered activities, reminders, recent notifications, quick-access shortcuts. |
| **Explore** | The public-eligible activity catalog. Students browse and filter activities (by type, category/tag, club, date, availability). Registration is initiated here. |
| **My Activities** | All past and upcoming registrations, attendance history, completion status, and pending waitlist positions. |
| **Volunteering** | Volunteering-specific activity listings and the student's volunteering history and hours (subset of Explore/My Activities scoped to Campaign-type volunteer activities). |
| **Certificates** | All earned certificates — downloadable PDFs, verification codes, survey-gate status ("submit feedback to unlock"). |
| **Clubs** | Browse active clubs, view club pages and public activity lists, submit membership applications. |

### 13.3 Workspace tab (club officers only)

Students who hold any club officer role (Club Leader, Vice President, Secretary, Treasurer, or any other designated officer role) have an additional **Workspace** tab unlocked. This tab does not appear for regular (non-officer) students.

**Who gets the Workspace tab**: any student whose `ClubMembership.role_in_club` is any officer-tier role for at least one active club. A student with officer roles in multiple clubs sees a club switcher within the tab.

**V1 flat permissions**: all club officers — regardless of their specific title — have identical access within "Workspace". Differentiated officer permissions (e.g. President can do X but Secretary cannot) are deferred to V2.

**Workspace tab features:**
- Submit activity requests for their club (creates a Draft in SAMA)
- Review and respond to incoming membership applications (approve/decline inline)
- Track status of submitted activity requests (Draft → In coordinator review → Pending manager approval → Approved/Rejected)
- View club budget snapshot (read-only — approved amount, spent, remaining)
- View their officer roles across all clubs they lead

**Club Leaders never touch SAMA.** All actions available to them are in the Student Portal. Their submissions, once created as Drafts in the backend, are processed by the Club Coordinator in SAMA.

### 13.4 Integration with SAMA

The Student Portal is not a separate system — it reads and writes to the same data layer as SAMA:

- An activity request submitted by a Club Leader via the Student Portal **immediately appears as a Draft** in SAMA, visible to the assigned Club Coordinator(s).
- When a Club Coordinator or Manager takes an action in SAMA (approval, rejection, request-for-changes), the **status update is immediately visible** to the Club Leader in their Student Portal "Workspace" tab. No delay, no polling.
- When an activity is approved and published in SAMA, it **appears immediately in the Student Portal Explore tab** for eligible students.
- Attendance, completion, and certificate status recorded in SAMA are immediately reflected in the student's "My Activities" and "Certificates" tabs.

### 13.5 Permission model (Student Portal)

The Student Portal permission model is independent of the SAMA permission matrix (§3.2). Roles in the Student Portal:

| Role | Who has it | What it unlocks |
|------|-----------|-----------------|
| **Student** | Any enrolled student | Six standard tabs: Home, Explore, My Activities, Volunteering, Certificates, Clubs |
| **Club Officer** | Any student with an officer-tier `role_in_club` | All standard tabs + "Workspace" tab (flat permissions, V1) |

Students do not have access to any SAMA-only capability (approvals, activity creation outside the club officer flow, staff dashboards, budget management, welfare records, audit log, reports, role assignment).

---

## 14. Module — Post-event workflow

This module defines what happens after `end_at` passes: closure, surveys, certificates, media gallery, follow-up tasks, and cloning. Activity types differ in detail (Campaigns may skip surveys/certificates) but follow the same flow.

### 14.1 Closure mechanics

- **Manual close only**. After `end_at`, the activity remains in **InProgress** until the Coordinator (own) or Manager clicks **Close activity**. The system does NOT auto-close.
- The Coordinator dashboard surfaces a **"Ready to close"** badge for any InProgress activity past `end_at` so they don't forget.
- **No automatic notification escalation.** A "Ready to close" widget on the Manager dashboard lists all activities past `end_at` (sortable by days-overdue, owning Coordinator) so Manager has a single visible queue. No emails, no push, no auto-escalation. Rationale: closure has too many side effects (cert issuance, survey dispatch) to nag aggressively about, and Coordinators monitor their own dashboards.
- Pre-close checklist shown to Coordinator (warnings, not blockers — they can close anyway):
  - Attendance recorded for all sessions.
  - Budget transactions reconciled (actual vs. approved).
  - Optional post-event report filled (template available).
  - Media uploaded (optional).
  - Follow-up tasks created (optional).
- On click **Close activity**:
  1. Activity state → **Completed**.
  2. Final completion calculation runs: each registration evaluated against attendance threshold → status set to **Completed** or **Failed**; remaining unresolved → **NoShow**.
  3. Standard survey is dispatched to all attendees (in-app + email + push).
  4. Certificates are generated for those who Completed (per §9), but **visibility/download depends on survey gating** — see §14.3.
  5. Audit event logged.

### 14.2 Reopening a closed activity

- Coordinator (own) or Manager can **Reopen** a Completed activity with a reason (audit-logged).
- On reopen:
  - State → **InProgress**.
  - Attendance becomes editable again by Coordinator/Employee.
  - Surveys remain open (already dispatched stay valid; new attendees added would receive a new dispatch on next close).
  - Issued certificates **remain valid** (verifiable via public URL). They are not retracted automatically — to revoke, use the explicit Revoke action (§9.3) which is logged separately.
  - Follow-up tasks remain unchanged.
- Re-closure runs the same pipeline as §14.1, with one difference: only newly-completed registrations get NEW certificates; existing certificates are not re-issued unless explicitly regenerated.

### 14.3 Surveys & feedback

- **Standard survey** is auto-attached to every activity at creation. Defaults: overall rating (1–5), facilitator/Employee rating (1–5), would-recommend (Y/N), open comment.
- **Optional customization**: Coordinator can add custom questions (rating, multiple-choice, open text, NPS) at activity creation or before closure. Cannot remove standard questions.
- **Anonymity**: anonymous to all staff. Responses are aggregated; no field links a response to a student. This is enforced at the data layer:
  - SurveyResponse table has no `student_id` foreign key.
  - A separate `SurveyDispatch` table tracks who was sent the survey (and whether they submitted) — this lets the system show a student "you've already submitted" without linking the content of their response to them.
- **Dispatch trigger**: surveys go out at closure (§14.1 step 3) — not when end_at passes, not at registration.
- **Reminders**: in-app + email reminders at +3 days and +7 days post-closure if unsubmitted. After +14 days, no further reminders.
- **Open window**: surveys remain open indefinitely (no hard close). Manager can still see results months later.
- **Certificate gating** (for activities that issue certificates):
  - Certificate is generated and exists, but **download/view is locked** until the student submits the standard survey.
  - Locked-state UI: "Submit your feedback to unlock your certificate."
  - **Override**: Coordinator (own) or Manager can release the certificate to a specific student without survey submission, with reason (audit-logged).
  - **Auto-release fallback**: after 30 days post-closure, certificates auto-unlock regardless of survey status (configurable; prevents indefinite lock-out).
- **Activities without certificates**: surveys are still sent; reminders apply; no gating mechanic.
- **Result viewing**:
  - Coordinator (own activity): aggregate stats + free-text comments (anonymous).
  - Manager: aggregate stats across all activities + drill-in to per-activity comments. Custom report builder can pivot survey results.
  - Employees: do not see survey results unless they are co-coordinators.
- **Internal-only — never visible to other students.** Survey responses (aggregate or individual comments) are **not exposed to any student**, including the activity's own attendees. Students see only that *they* submitted (private to themselves). This is **not a social-media-style** feature; there is no public comment wall, no upvotes, no replies.
- **Audience for comments**: only the activity's owning Coordinator (and co-coordinators) and Manager. Other Employees and other Coordinators do not see comments for activities they don't own.
- **Comment moderation**: because the audience is small and trusted, no public-facing moderation surface is needed. Coordinator/Manager can hide an inappropriate comment from view (with reason, audit-logged) — this is housekeeping, not protection of other students. Anonymity guarantee is preserved: the system architecturally cannot link a SurveyResponse to a SurveyDispatch entry (§14.3 schema).

#### Survey question library
- Manager curates a tenant-wide **library of reusable custom questions** (rating, multiple-choice, open text, NPS templates).
- At activity creation, Coordinator can: pick from library AND/OR add ad-hoc questions for this activity only.
- **Library-question versioning**: editing a library question creates a new version; activities created with the prior version continue to use that version (their reports stay coherent). Library questions can be retired (no longer pickable for new activities) but not deleted while in use.
- Library entries are tagged (e.g. "facilitator", "venue", "content depth") for quick search.
- Manager-only CRUD on the library; Coordinators can suggest additions via a request flow (lightweight in v1: Coordinator clicks "suggest for library" on one of their ad-hoc questions; Manager approves/rejects).

### 14.4 Media gallery

- **Upload**: Coordinator (own) or assigned Employees can upload **photos** at any time during InProgress or after Completed. Bulk upload supported.
- **Video**: not supported in v1 (deferred — cost and UX complexity).
- **Visibility**: visible to **all logged-in students** (browseable archive of past activities). Not public-without-login.
- **Per-activity gallery page**: shows uploaded media with optional captions.
- **Activity-archive view**: students can browse past activities (filterable by club, type, year) and view their galleries.
- **Optional**: not all activities will have media. The gallery is opt-in per activity; the page only renders if at least one photo exists.
- **Moderation**: only Coordinator/Employee/Manager can upload or delete. Students cannot upload.
- **Privacy**: at upload time, Coordinator can mark a single photo (or batch-mark a selection) as "internal only" (Manager + Coordinator/Employee see it; students don't). Useful for receipts, behind-the-scenes, etc.
- **Quota & limits** (v1):
  - **Per activity**: 500 MB total.
  - **Per photo**: 20 MB max.
  - **Estimated**: ~25 photos at full size, more with compression.
  - System auto-compresses on upload (target: long-edge resize + JPEG quality), keeps original up to the 20 MB cap.
  - On reaching quota, further uploads are blocked with a clear message; Coordinator can delete photos to free space, or request a quota increase from Manager (process TBD).
- **Storage infrastructure**: managed by university IT. SAMA uses signed URLs with time-limited access for fetch. Hosting / CDN choice is an IT decision and not part of this PRD.
- **Welfare module exclusion**: counseling and health appointments do NOT have media galleries. The gallery feature is exclusive to activities (events/programs/workshops/campaigns) and clubs.

### 14.5 Follow-up tasks

- A **FollowUpTask** is a structured action item attached to an activity (or a club).
- Created by Coordinator (own) or Manager. Anyone with edit rights on the parent activity can create.
- **Fields**: id, parent (activity_id or club_id), title, description, owner_user_id, due_date, status {open, in_progress, completed, cancelled}, priority {low, normal, high}, created_by, created_at, completed_at, completion_note.
- **Owner** is any user (typically Coordinator or Employee). Owner sees the task in their personal dashboard.
- **Due-date reminders**: notification at -3 days, -1 day, on due date, and on overdue.
- **Visibility**: parent-activity Coordinators + assigned Employees + Manager + the task owner.
- **Bulk view**: Manager has an "All open follow-ups" view filterable by activity, owner, due date, overdue.
- **Examples**: "Send thank-you email to keynote speaker", "Submit final report to dean", "Pay vendor invoice", "Write blog post for university website".
- **Closure of activity does not require all tasks done** — tasks can outlive activity closure.

### 14.6 Activity cloning

- Coordinator (any) or Manager can click **Clone** on any activity (regardless of state) to create a new **Draft**.
- **What is cloned**:
  - Type, title (suffixed " (Copy)"), description, category/tags, language.
  - Eligibility rules, prerequisites.
  - Capacity, waitlist settings, cancellation cutoff.
  - Sessions structure (number of sessions and their relative offsets) — but **dates are blanked**, Coordinator must set new dates.
  - Planned budget line items (planned amount only; approved/actual reset to 0).
  - Standard + custom survey questions.
  - Attachments (poster, agenda) — Coordinator can keep or remove.
  - Certificate template choice.
- **What is NOT cloned**: registrations, attendance, certificates, survey responses, media, transactions, follow-up tasks, audit history.
- The cloned Draft enters the standard approval flow: Coordinator edits dates → Submits → Manager approves → Publishes.
- **Lessons-learned database**: not in v1. Knowledge transfers via clone + Coordinator memory.

### 14.7 Optional post-event report

- Template available at closure. Coordinator can fill or skip.
- **Fields**: outcomes summary, attendance highlights, issues encountered, lessons learned, suggestions for next time, links to media/follow-up tasks, references to budget variance.
- Stored against the activity. Visible to: Coordinator (own), Manager.
- Can be exported as PDF.
- **Not required** for closure. Not required for certificate issuance.
- Manager can request one after the fact (manual nudge; no system-blocking).

### 14.8 Notifications triggered by post-event flow

| Event | Recipients | Channels |
|-------|------------|----------|
| Activity Closed | Coordinator (own), Manager | In-app |
| Survey dispatched | Each attendee | In-app + email + push |
| Survey reminder (+3d, +7d) | Attendees who haven't submitted | In-app + email |
| Certificate unlocked (after survey) | Student | In-app + email |
| Certificate auto-released (+30d) | Student | In-app + email |
| Activity Reopened | Coordinator, Manager, Employees on activity | In-app |
| Follow-up task assigned | Task owner | In-app + email |
| Follow-up task due in 3d / 1d / today / overdue | Task owner | In-app + email + push (overdue) |

---

## 15. Cross-cutting concerns

### 15.1 Notifications
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
- **Delivery — tracked, not fire-and-forget:**
  - Every outbound notification creates a `NotificationDelivery` record per channel with status: `queued → sent → delivered | bounced | failed`.
  - **Retry policy**: 3 attempts with exponential backoff (1 min, 5 min, 30 min) for transient failures. Hard bounces (invalid address) are not retried.
  - **Failure surfacing**:
    - Failed email/SMS appears in the recipient's in-app inbox automatically (in-app is the always-reliable fallback), with a small "email could not be delivered" indicator.
    - Manager dashboard has an **Undelivered notifications** report: counts by category and date, drillable to individual deliveries. Helps catch systemic problems (e.g. expired SMTP credentials).
    - Provider webhooks (bounce/complaint) update delivery state; bounced addresses can be flagged on the User record so future sends skip that channel.
  - **In-app is authoritative for compliance-relevant messages**: registration confirmation, approval decision, cancellation, waitlist promotion. Email is best-effort but never the only path.
- **Quiet hours**: optional per-user no-push window (e.g. 10pm–7am).

### 15.2 Reports & dashboards
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

### 15.3 Exports
- CSV/Excel: any list (registration roster, attendance sheet, transactions, custom report results).
- PDF: formatted attendance sheets (printable), certificate batches, end-of-period summaries with branding.
- Welfare data exports: Manager only, audit-logged with reason.

### 15.4 Audit log
- **Full**: every state change, edit, deletion, approval, certificate issue/revoke, role change, login, registration, attendance edit, note read (welfare).
- **Fields**: actor, action, target, before/after JSON, IP, user agent, timestamp.
- **Visibility**: Manager only.
- **Retention**: log retained per organization policy (deferred); never deleted via UI.
- **Search & filter**: by actor, target, action type, date range.
- **Note**: not labeled "immutable" per the explicit decision (full but normal-edit-protected, not write-once); operationally, no UI affordance to edit/delete log entries.

### 15.5 Schedule conflict detection
- Activities: blocking, as described in §7.4.
- Welfare appointments: a student can't double-book a counseling/health slot at the same time as another welfare appointment (block).
- Cross-conflict (welfare ↔ activity): warn but allow (welfare appointments often shorter and the student may legitimately rearrange).

### 15.6 No-show tracking
- Tracked at registration level (`status = NoShow`) and welfare appointment level.
- Visible in student profile to Manager / Coordinator (for activities) or counselor / health staff + Manager (for welfare).
- No automatic penalties; report-driven only.

### 15.7 Search & discovery
- Global search (header) for Manager: across activities, students, clubs, transactions.
- Student catalog search: by keyword, type, category/tag, date range.

### 15.8 Internationalization
- **English only in v1.** UI strings externalized via i18n keys from day one to enable later Arabic addition without refactor.
- All system text, emails, certificates, and surveys are English in v1.
- **Arabic + RTL is post-v1.** Plan for full bilingual support with RTL mirroring; activity content (titles, descriptions) likely needs a per-field language pair (`title_en`, `title_ar`) — defer the modeling to the i18n v2 spec but reserve the column names now.
- Time zone: Asia/Riyadh (UTC+3, no DST). All timestamps stored in UTC; displayed in Asia/Riyadh.

### 15.9 Concurrent edits and data integrity
- **Optimistic locking** on every editable entity. Each row has a `version` integer that increments on save.
- **On save**: client sends the version it loaded. If DB version differs, save fails with `409 Conflict`.
- **Conflict UI**: a modal explains "someone else changed this while you were editing", shows what changed (field-by-field diff: their value vs. your value), and offers: **Reload and re-apply my changes** (recommended) / **Discard my changes**. No silent overwrites.
- **Audit log** records every conflict resolution so Manager can see how often it happens.
- Applies to: activities, sessions, registrations, clubs, club memberships, budget transactions, welfare appointments, certificate templates, role assignments.

### 15.10 Account lifecycle — out of scope for v1
- Identity provider (university IdP) is the source of truth for whether a user can log in.
- When a student graduates, an Employee leaves the university, or any user's IdP account is disabled, SAMA simply sees "can no longer authenticate". No special in-app workflow.
- Active registrations, owned activities, etc. remain in SAMA records for historical integrity but the actor cannot log in to manage them.
- **Implication for Coordinator departures**: if a Coordinator leaves with open activities, Manager must manually reassign ownership. Surfaced as a Manager nag ("Activity X has an inactive owner") — implemented as a daily reconciliation against the IdP feed.
- **Implication for student departures mid-semester**: Coordinator sees the student is still Registered for future events; system flags "user account inactive" on the roster. Coordinator decides per case whether to cancel the registration. No auto-cancel.
- Detailed lifecycle workflows (Alumni status conversion, role re-assignment automation) are deferred to v2.

### 15.11 Data retention
- **Keep everything.** All records (activities, registrations, attendance, certificates, surveys, follow-ups, media, welfare notes, audit log) are retained indefinitely for historical reporting.
- **Soft delete only (in-app).** When a Manager (or system) "deletes" a record, the row is marked with `deleted_at` (and `deleted_by`, `deletion_reason`). It disappears from default views but remains queryable for audit, reports, and undelete.
  - Every entity that supports deletion has a `deleted_at` column.
  - Default queries filter out soft-deleted records.
  - Soft-deleted records are excluded from student-facing views immediately.
  - **Manager has a "Deleted items" view that includes ALL deletable entities** — activities, clubs, registrations, attendance, transactions, follow-ups, media, **and welfare records** (counseling notes, health appointments, visit logs). Restore action is available on every row.
  - Restore reverses the soft delete and is itself audit-logged.
  - Deleting a welfare record from the deleted-items view does NOT hard-delete; it just stays soft-deleted (no further state to move to in v1).
- **Hard delete is out of scope for v1.** PDPL right-to-erasure or any other legal-compliance hard-deletion is handled out-of-band (legal request → IT → DBA), not through the application. To be revisited post-v1 with a documented runbook.
- **Audit log**: append-only at the application layer (no soft-delete on AuditEvent — those rows never disappear).
- **Reporting**: reports include or exclude soft-deleted records based on a toggle; default excludes.

---

## 16. End-to-end scenarios

These scenarios trace real interactions across modules to expose gaps.

### Scenario A — Coordinator runs a 4-session program

1. Coordinator opens "New Activity" → type **Program**, fills title "Public Speaking 101", adds 4 sessions (Tue/Thu for 2 weeks), capacity 25, eligibility "all programs, year ≥ 1", completion threshold 75% (3 of 4 sessions), planned budget 500 SAR.
2. Coordinator submits → state **Submitted**. Manager gets in-app + email notification.
3. Manager reviews, approves with approved_amount = 500. State → **Approved**. Coordinator gets notification.
4. Coordinator publishes. State → **Published**. Activity appears in catalog for eligible students.
5. `registration_opens_at` arrives → state → **RegistrationOpen**. Notification to subscribed students (eligibility-matched).
6. 30 students try to register; 25 get **Registered**, 5 go to waitlist.
7. One Registered student cancels 3 days before; top of waitlist auto-promoted; gets in-app + email + push notification with calendar.ics.
8. Session 1: Employee opens session, displays QR. Students scan; 22 marked Present, 3 marked Absent. Coordinator manually marks 1 of the absentees Present (was at the door, system glitch) — audit logged.
9. Sessions 2–4 proceed similarly. After session 4 (`end_at` reached), system computes completion: 20 students hit ≥75% → **Completed**; 5 → **Failed**.
10. Certificates auto-generated for the 20; emailed; downloadable in their profile. Verifiable via public URL.
11. Coordinator records 2 budget transactions during the program (catering 200, supplies 150). Actual = 350; remaining = 150; variance shown in dashboard.
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

### Scenario L — Manual closure with survey-gated certificates

1. The 4-session program from Scenario A has finished its last session yesterday. State remains **InProgress**; Coordinator's dashboard shows a "Ready to close" badge.
2. Coordinator opens the activity, reviews attendance, records final budget transactions, uploads 12 photos to the gallery, creates 2 follow-up tasks ("Send thank-you to facilitator", due in 3 days; "Submit faculty report", due in 7 days), and skips the optional post-event report.
3. Coordinator clicks **Close activity**. System:
   - Sets state → **Completed**.
   - Computes completion: 20 students Completed, 5 Failed.
   - Generates 20 certificates (locked).
   - Dispatches the standard survey to all 25 attendees in-app + email + push.
   - Logs ActivityClosure record + AuditEvent.
4. Student opens their profile → sees "Public Speaking 101 — Certificate (Locked). Submit your feedback to unlock." Clicks → fills the 4 standard questions + 1 custom question added by Coordinator.
5. On submit: SurveyResponse stored anonymously; SurveyDispatch row marked submitted; certificate unlocks; in-app + email "Your certificate is ready" notification fires.
6. Three days later, 5 students still haven't filled the survey → +3d reminder fires. After +7d, second reminder. After +30d, those 5 certificates auto-unlock; in-app + email "Your certificate has been released" fires.
7. Coordinator opens survey results: aggregate rating 4.3/5, NPS 65, 18 free-text comments — no names attached.
8. One follow-up task hits its due date — owner gets push notification "Submit faculty report due today".

### Scenario M — Reopen for attendance correction

1. After Scenario L, a student emails Coordinator: "I was at session 3 but the QR didn't scan."
2. Coordinator clicks **Reopen activity** with reason "Attendance correction for student X".
3. System: state → **InProgress**; AuditEvent + ActivityClosure.reopened_at logged. Existing certificates remain valid; surveys remain accessible.
4. Coordinator marks the student Present for session 3 → recomputed status: that student moves from Failed → Completed.
5. Coordinator clicks **Close activity** again. System: state → Completed. Now-completed student gets a new certificate (locked behind survey, same flow).
6. Other 19 students whose certificates already exist are unaffected — no duplicates issued.

### Scenario N — Cloning for next semester

1. New semester starts; Coordinator wants to run "Public Speaking 101" again.
2. Opens last semester's activity, clicks **Clone**. New Draft created: title "Public Speaking 101 (Copy)", 4 sessions with blank dates, same eligibility/capacity/budget plan/surveys/attachments.
3. Coordinator edits: removes "(Copy)" from title, sets new dates, adjusts budget, updates poster attachment.
4. Submits → standard approval flow runs.

### Scenario P — Selective trip with approval and reapply

1. Coordinator creates "Cultural exchange trip" — `requires_approval = true`, `reapply_policy = one_retry`, application form: 3 questions (open text "why?", single choice "year", multi-choice "languages").
2. 40 students apply for 5 spots; each fills the form. Registration state = Pending; capacity (5) is not yet consumed.
3. Coordinator opens application queue, filters by year + language, picks 5 to approve. The other 35 are rejected with reasons ("limited spots; thanks for applying").
4. One rejected student reapplies (their `one_retry` second chance) with a stronger answer. Coordinator approves; system warns "approving exceeds capacity" — Coordinator confirms (manual capacity raise from 5 → 6, audit-logged).
5. Another rejected student tries to reapply a third time. System blocks: "your application has been finalized for this activity."

### Scenario Q — Late cancellation decided post-event

1. Activity with cancellation policy = "deadline 24h + late-cancellation request". Cutoff is yesterday at 14:00; activity is today at 14:00.
2. At 11:00 today, a student submits "Request to cancel" with reason "I have a fever" — request enters Coordinator's queue.
3. Coordinator is in meetings all day; activity happens at 14:00. Student is absent; system auto-marks them NoShow at 16:00 (when activity ends).
4. Two days later, Coordinator reviews the queue (overdue badge visible), reads the reason, decides to approve the late cancellation.
5. System: registration → Cancelled (was NoShow), audit log captures both transitions and the human override. The "high no-show students" report no longer counts this student for that activity.

### Scenario R — Football team with hybrid capacity

1. Coordinator creates "Football team" as a Program — capacity 30, multi-session (weekly trainings + matches), `per_session_signup_enabled = true`, `per_session_capacity_enabled = true`, `signup_flow = register_first`.
2. 30 students register; team is the "squad of 30".
3. For Tuesday training, Coordinator sets per-session capacity = 20 (jerseys/equipment limit). 20 students sign up; sign-up form blocks the 21st with "session full — try Thursday training".
4. Tuesday: 18 of the 20 signed-up students show. 2 walked in without signing up (one came back from injury). Employee marks all 20 Present; system shows "session capacity exceeded by 0" warning (still within capacity since 18 + 2 = 20). All attendances recorded.
5. Thursday: 25 students sign up; per-session capacity is enforced — only first 20 can sign up. On the day, 22 attend (some Tuesday-only people decided to come). System: 20 from sign-up + 2 walk-ins → "session capacity exceeded by 2" warning, attendance recorded for all 22.
6. End of semester: Coordinator closes activity; completion calc uses `attended_sessions / total_sessions ≥ threshold`.

### Scenario S — Soft-delete and restore including welfare

1. A counselor accidentally creates a CounselingNote for the wrong student. Notices it, requests deletion via Manager.
2. Manager opens the note, soft-deletes with reason "wrong student — duplicate of correct entry". Note disappears from default views.
3. Two days later, a colleague says "wait, the original was actually right; the duplicate should have stayed". Manager opens "Deleted items" → "Welfare records" → finds the note → clicks Restore.
4. Note returns to normal state. Audit log shows: created → soft-deleted → restored, all with timestamps and actors.
5. (Hard delete is not available in v1 — if there were a legal need to permanently erase the data, Manager would file a request to IT for an out-of-band DBA operation.)

### Scenario O — Anonymous survey integrity

1. A Coordinator suspects a specific harsh comment came from a particular student and asks Manager to identify the source.
2. Manager checks the system: SurveyResponse table has no student_id; only SurveyDispatch shows that student submitted, not what they said. The system architecturally cannot answer the request.
3. Manager explains anonymity guarantee to the Coordinator. The audit log captures Manager's lookup attempts (which return nothing identifying).

---

## 17. Business rules registry

A consolidated list to make gaps obvious. Each rule has an ID for reference.

### Activity & approval
- **BR-A1**: An activity must be in state Approved before it can be Published.
- **BR-A2**: Manager-authored activities skip Submitted (auto-Approved on save).
- **BR-A3**: Activity type cannot change after creation.
- **BR-A4**: Editing an Approved/Published activity's date/time/location is allowed; changes auto-notify registrants and waitlisters.
- **BR-A5**: Increasing budget on an Approved/Published activity requires Manager approval; decreasing is free.
- **BR-A6**: Cancellation requires a reason.
- **BR-A7**: Coordinators can only edit/cancel their own activities (or co-coordinated). Managers can act on any.
- **BR-A8**: Club Coordinators can edit/cancel club activities for their assigned clubs. They cannot act on activities outside their assigned clubs.

### Roles & access
- **BR-RA1**: Roles are additive. A staff member can hold multiple roles simultaneously; their effective permissions are the union of all role permissions.
- **BR-RA2**: Non-Manager role permissions are module-scoped. A Nurse role grants access only within the Health module. A Coordinator role grants access only within the Activities module. Holding one role does not bleed permissions into another module.
- **BR-RA3**: Manager is a superset role with full access across all modules and all data in the department. No module boundary applies to Manager.
- **BR-RA4**: Only Manager can assign, modify, or revoke roles — from the Settings page. No delegation of role-assignment authority in v1.
- **BR-RA5**: Club Coordinator is a scoped role — a user assigned as Club Coordinator for Club A has no Club Coordinator authority over Club B unless separately assigned.
- **BR-RA6**: Club Advisor is a read-only observer role scoped to assigned clubs. No approval authority in v1. External Club Advisor accounts (faculty, external professionals) are a v2 feature.
- **BR-RA7**: Club Leader is a student-facing system role granted per-club by Manager or Club Coordinator. It grants the student authority to create and submit activity requests for that club only.

### Clubs
- **BR-CL1**: A club activity request submitted by a Club Leader routes to all assigned Club Coordinators for that club simultaneously (OR logic — any one can act; first to act resolves, others' pending items clear).
- **BR-CL2**: Club activity approval is two-step: Club Coordinator (step 1) → Manager (final). Both steps use the same Approve / Reject / Request-changes actions.
- **BR-CL3**: Manager sees all club activity requests from the moment of submission and can override Phase 1, approving directly at any time.
- **BR-CL4**: Club Advisors are not in the approval chain. They receive a FYI notification after Manager final approval.
- **BR-CL5**: A club must have at least one Club Coordinator assigned before a Club Leader can submit activity requests. If no Club Coordinator is assigned, submission is blocked with a message directing the Club Leader to contact the Manager.
- **BR-CL6**: Club Coordinator assignments and Club Advisor assignments are many:many (a club can have multiple of each; a staff member can be assigned to multiple clubs in each role).
- **BR-CL7**: Club Coordinator assignment and removal is logged in the audit trail.
- **BR-CL8**: The two-step approval flow is triggered only when the activity's creator has the Club Leader role for the linked club. A Coordinator creating an activity linked to a club follows the standard one-step flow.
- **BR-CL9**: Club creation requires Manager approval. A Club Leader submits a club formation request; Manager approves or rejects.
- **BR-CL10**: Club Coordinator can initiate a club suspension (pending Manager confirmation). Manager can permanently archive a club.
- **BR-CL11**: Club Leaders can view their own club's detail and member roster. They cannot see other clubs' member lists or budgets.
- **BR-CL12**: Club metadata (name, description, meeting schedule, contact email) can be edited by the assigned Club Coordinator or Manager. Club Leader can propose changes via a request; Coordinator applies them.
- **BR-CL13**: Membership requests are approved by the Club Coordinator (assigned) or Manager. Club Leader can view pending requests but cannot approve or reject them in v1.
- **BR-CL14**: On a Club Leader's activity submission, notifications go to all Club Coordinators assigned to that club and (for awareness) all Club Advisors assigned to that club.
- **BR-CL15**: After a Club Coordinator approves step 1, the Manager receives a notification: "[Club Name] activity '[Title]' has passed coordinator review and awaits your approval."
- **BR-CL16**: If Manager rejects at step 2, the activity returns to Submitted with coordinator_approval_phase = coordinator_approved so the Club Leader can review the Manager's reason without redoing coordinator review.

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
- **BR-AT3**: Program completion = `present_sessions / total_sessions ≥ completion_threshold`.
- **BR-AT4**: Single-session activity completion = present at the session.
- **BR-AT5**: ~~Optional deliverable requirement gates Completion regardless of attendance.~~ *(Deferred: deliverables not in v1.)*
- **BR-AT6**: Attendance can be edited within X days post-session by the Coordinator or Employee assigned to the activity; thereafter only Manager.

### Certificates
- **BR-C1**: Certificates are auto-generated when a registration reaches Completed (which only happens after manual closure of the activity).
- **BR-C2**: Each certificate has a unique verification code with public verify URL.
- **BR-C3**: Revocation requires a reason and is shown on verify URL.
- **BR-C4**: Certificate download is gated on the student submitting the standard post-activity survey. Manager/Coordinator can override per-student. Auto-release after 30 days post-closure.

### Post-event (closure, surveys, gallery, follow-ups, clone)
- **BR-PE1**: Activities transition to Completed only via manual close by Coordinator (own) or Manager. No auto-close on `end_at`.
- **BR-PE2**: A Completed activity can be reopened by Coordinator (own) or Manager with reason; state returns to InProgress. Existing certificates are not retracted automatically.
- **BR-PE3**: Every activity has an auto-attached standard survey (overall rating, facilitator rating, would-recommend, open comment). Coordinator may add custom questions but cannot remove standard ones.
- **BR-PE4**: Survey responses are anonymous to all staff. Schema must not link a response to a student. Dispatch tracking (sent/submitted) is separate from response content.
- **BR-PE5**: Surveys dispatch on closure (not on `end_at`). Reminders at +3 and +7 days. No hard close on the survey window.
- **BR-PE6**: Media gallery: only Coordinator/Employee/Manager can upload or delete; visible to all logged-in students; per-photo "internal only" flag hides from students.
- **BR-PE7**: Follow-up tasks have an owner, due date, and status. Reminders at -3d, -1d, day-of, and overdue. Open tasks may outlive activity closure.
- **BR-PE8**: Activity cloning copies structure (type, sessions count, eligibility, capacity, budget plan, surveys, attachments) but blanks dates and resets registration/attendance/financial/audit data. Clone produces a Draft.
- **BR-PE9**: Post-event report is optional; not required for closure or certificate issuance.

### Welfare
- **BR-W1**: Welfare appointments are 1:1 only.
- **BR-W2**: Counseling notes are visible only to that counselor + Manager.
- **BR-W3**: Health visit logs visible to all health Employees + Manager (configurable to logging-staff-only — see gap).
- **BR-W4**: Every read of a welfare note/log is audit-logged.

### Budget
- **BR-B1**: All activity types have a Budget tab. Budget is optional at creation; activities with no budget set behave as zero-budget.
- **BR-B2**: Two budget modes: simple (single planned total + optional student_contribution) and detailed (named line items each tagged University / Student / Split). Coordinator chooses at creation.
- **BR-B3**: Both the planned amount and the approved amount are visible to the Coordinator who owns the activity.
- **BR-B4**: Transaction recording is locked until the activity reaches Approved or Active state.
- **BR-B5**: Coordinator can record, edit, and delete their own expense transactions. Manager can record, edit, and delete any expense transaction. Income transactions are system-generated (finance integration) and cannot be manually created or edited by any user. All mutations are audit-logged.
- **BR-B6**: Transaction receipts are lightweight file attachments stored on the transaction only — not linked to the Documents module.
- **BR-B7**: When actual_spent reaches 80% of approved_amount: visual warning in Budget tab + in-app notification to Coordinator and Manager. When actual_spent exceeds approved_amount: red over-budget alert. Recording is never blocked.
- **BR-B8**: In detailed mode, if the student-funded per-head amount implied by line items does not match the registration fee on the activity, a persistent warning is shown. The fields remain independent.
- **BR-B9**: Increasing approved_amount post-approval requires a Budget change request. Decreasing is free (audit-logged, no request needed).
- **BR-B10**: A Budget change request surfaces in both the Approvals inbox and inline in the Budget tab. Manager resolves it in either location.
- **BR-B11**: At most one pending Budget change request per activity at a time.
- **BR-B12**: For Club-organised activities: Club Leader enters planned amount as a budget suggestion in Draft state only. Club Coordinator reviews and may adjust the budget in Draft and Submitted states. Manager sets approved amount at final approval.
- **BR-B12a**: Club Leader write access to budget is restricted to Draft state. Once an activity advances beyond Draft, Club Leader has view-only access to the budget.
- **BR-B12b**: Club Coordinator has write access to budget in Draft and Submitted states for their assigned clubs.
- **BR-B13**: Decreasing approved_amount below actual_spent is allowed but triggers the over-budget alert.
- **BR-B14**: The Budget tab always shows stat cards (Planned, Approved, Spent, Remaining, Expected revenue, Received revenue). Unset values display as "—"; Spent and Received show AED 0 when no transactions exist.
- **BR-B15**: v1 displays a PRF reminder banner on any activity with a budget. Full PRF workflow is deferred to v2.

### Notifications
- **BR-N1**: Critical notifications (activity change, cancellation, waitlist promotion) cannot be opted out.
- **BR-N2**: Notifications are sent via in-app + email + push (per user preference for non-critical).

### Audit
- **BR-AU1**: All state changes, edits, deletions, approvals, role changes, certificate issuance/revocation, and welfare-note reads are logged.
- **BR-AU2**: Audit log is read-only via UI.

### Tenancy & departments
- **BR-T1**: Every domain row carries `tenant_id` and (where applicable) `department_id`. v1 has exactly one Tenant and one Department; the schema supports more.
- **BR-T2**: Authorization checks always evaluate `(user, department, action)`. A Manager of Department A cannot view/modify Department B's data.
- **BR-T3**: Students are tenant-scoped, not department-scoped. A student can register for any activity in any department within their tenant.
- **BR-T4**: A user can hold different roles in different departments (post-v1 reality; v1 = one role per user).
- **BR-T5**: Modules are enabled per-department. Department A may have {activities, clubs} enabled while Department B has {activities, welfare}.

### Cancellation, approval, capacity, finance, retention
- **BR-CX1**: Each activity declares a cancellation policy at creation (no-cancel / anytime / deadline / deadline-with-late-request). Default depends on type.
- **BR-CX2**: Activities with `requires_approval = true` route registrations to a Pending state; capacity is not consumed until Coordinator/Manager approves.
- **BR-CX3**: Pending registrations are not subject to FCFS guarantees; Coordinator selects from the queue. Application queue has no system cap.
- **BR-CX4**: `requires_approval` activities have a Coordinator-defined application form (1–5 questions). Student answers stored on Registration; Coordinator/Manager see them in the queue.
- **BR-CX5**: Reapply policy on rejection is per-activity: `unlimited` / `one_retry` / `final`.
- **BR-CX6**: Late-cancellation requests (when policy = deadline + late-request) **remain in queue indefinitely**. Coordinator can decide retroactively, even after `start_at`. Approval post-event supersedes any system-set NoShow.
- **BR-CX7**: Activity capacity is program-wide ("the team"). Per-session sign-up and per-session capacity are optional layers; attendance is decoupled from sign-up.
- **BR-CX8**: A student can attend a session without prior sign-up; their attendance record is normal.
- **BR-CX9**: Per-session capacity governs sign-ups, not physical attendance. Walk-ins are admitted past capacity with a non-blocking warning.
- **BR-CX10**: Sign-up flow is per-activity: `register_first` (default) requires activity registration before per-session sign-up; `signup_first` lets sign-up create the registration.
- **BR-CX11**: Per-session sign-up can be cancelled by the student up to that session's `start_at`. Activity registration remains intact.
- **BR-FIN1**: SAMA does not process payments. Payment status is sourced read-only from the university finance system via a pluggable adapter. SAMA never stores card data.
- **BR-FIN2**: Refund decisions live in the finance system; SAMA emits cancellation events and reflects status updates.
- **BR-FIN3**: Finance integration mechanism (webhook / poll / bus / file drop) is implementation-time deferred to a separate Finance Integration Spec.
- **BR-RET1**: All records are retained indefinitely. UI deletions are soft deletes (`deleted_at`).
- **BR-RET2**: Audit log is append-only; soft-delete does not apply.
- **BR-RET3**: Manager has a "Deleted items" view covering all deletable entities (including welfare records). Restore action is always available; reverses soft-delete; audit-logged.
- **BR-RET4**: Hard delete is out of scope for v1 — handled out-of-band when legally required.
- **BR-T6**: Module enablement in v1 is install-time only. No in-app UI; reserved for future TenantAdmin.
- **BR-T7**: Cross-department student data: when a student of any department registers for an activity in another department, the receiving Coordinator sees the student's full profile (no minimum-necessary masking in v1).

### Cross-cutting: edits, lifecycle, language, notifications, welfare matrix
- **BR-CC1 (Optimistic locking)**: every editable entity has a `version` field. Save is rejected if version differs; UI shows field-by-field conflict diff and offers reload-and-reapply. No silent overwrites.
- **BR-CC2 (Account lifecycle)**: account activation/deactivation lives in the IdP, not SAMA. SAMA records persist after a user becomes inactive; Manager is nagged when an inactive user owns active activities; no auto-cancel of student registrations on departure.
- **BR-CC3 (Language)**: v1 is English-only. All text is i18n-keyed for later Arabic + RTL addition without refactor. Time zone Asia/Riyadh; timestamps stored in UTC.
- **BR-CC4 (Notification delivery)**: every notification produces a `NotificationDelivery` record with status. 3 retries with exponential backoff. Failed email/SMS automatically surfaces in the user's in-app inbox. Manager has an "Undelivered notifications" report.
- **BR-CC5 (In-app authoritative)**: compliance-relevant messages (approval decision, cancellation, waitlist promotion, registration confirmation) are always delivered in-app even if email/SMS fails.
- **BR-AC1 (Self check-in)**: per-activity `self_checkin_enabled` flag. When on, students scan a session-rotating QR; check-in valid only within `start_at − 15min` to `end_at`.
- **BR-AC2 (Public catalog)**: per-activity `is_public` flag. Public view exposes title, brief description, dates, capacity status. Never names, photos, or eligibility internals.
- **BR-WL1 (Waitlist auto-confirm)**: promotion is automatic; no separate confirmation window. Promoted student → Registered immediately; standard cancellation flow handles the "can't make it" case.
- **BR-WF1 (Welfare permission matrix)**: per-role-per-module permission matrix (`none` / `summary` / `view` / `manage`). Manager configures. Defaults: counselors silo, nurses silo, Manager sees all; adjacent roles may receive `summary` (dates only, no content).
- **BR-WF2 (Welfare audit)**: every read of a welfare note is audit-logged regardless of role.
- **BR-WF3 (Student welfare view)**: student sees appointment dates / staff / status of their own welfare records. Notes content is staff-only in v1.

### Cross-cutting (round 22–23)
- **BR-PG1 (Program-per-term)**: weekly clubs / recurring meetings are modeled as one Program-type activity per academic term with weekly sessions; new term = new Program (clone-from-closed supported).
- **BR-CRT1 (Certificate hours)**: `Activity.cert_hours` is staff-set; default value pre-populated from the sum of session durations; editable.
- **BR-PHO1 (Profile photo)**: source is university feed by default; student may upload an override that enters moderation before display. One-click revert to feed.
- **BR-GST1 (Guest registration)**: per-activity `allow_guest_registration` flag. Non-students register via a public signed URL with name/email/phone + email verification. Guests are `User` rows with `kind = guest`; no password, no department role, no eligibility-rule matching. Access to their own data via tokenized magic links.
- **BR-GST2 (Guest paid)**: guests for paid activities go through the same external finance gateway as students (§7.8). SAMA tracks `fee_status` identically.
- **BR-GST3 (Guest completion)**: attendance, completion threshold, NoShow, certificate issuance, and survey gating apply to guests identically to students. Certificate is emailed; verifiable at the public verify URL.
- **BR-GST4 (Guest data boundary)**: guests are excluded from eligibility-rule matching, welfare modules, the catalog, cross-activity search, and student engagement dashboards.
- **BR-CLS1 (Ready-to-close)**: Manager dashboard widget lists InProgress activities past `end_at` (sortable). No automatic notifications, escalations, or auto-closure.
- **BR-SUR1 (Survey audience)**: survey results — including comments — are visible only to the activity's owning Coordinator(s) and Manager. Never to students or unrelated staff. Anonymity guarantee preserved at the data layer.
- **BR-SUR2 (Question library)**: Manager-curated, tenant-wide, versioned. Coordinators pick from library and/or add ad-hoc questions per activity. Suggested additions submitted to Manager.

### Student Portal & SSO (Round 29)
- **BR-SP1**: All users authenticate via a single university SSO. There are no separate credentials for SAMA vs. the Student Portal. One identity per person.
- **BR-SP2**: A user with only student roles is routed to the Student Portal. A user with only staff roles is routed to SAMA. A user with both student and staff roles is presented with access to both surfaces. The exact UX for dual-access (surface switcher, separate entry points, or post-login selector) is to be determined during design.
- **BR-SP3**: Club officers (Club Leader, Vice President, Secretary, Treasurer, or any other designated officer role) do not receive SAMA access by virtue of their club role alone. Their elevated access is the "Workspace" tab within the Student Portal.
- **BR-SP4**: All club officers within a club have identical permissions in the Student Portal "Workspace" tab (V1). Differentiated officer permissions are deferred to V2.
- **BR-SP5**: Activity requests submitted by Club Leaders via the Student Portal are created as Drafts in the SAMA backend and are immediately visible to the assigned Club Coordinator(s) in SAMA.

---

## 18. Non-functional requirements

### 18.1 Platforms & UX
- Responsive web + PWA (installable, offline cache for read-only views, web push).
- Modern evergreen browsers + iOS Safari + Android Chrome.
- Accessibility: WCAG 2.1 AA target.

### 18.2 Performance
- p95 page load < 2.5s on 4G.
- Catalog and roster lists handle 10k+ rows with pagination/virtualization.
- Notifications dispatched within 30s of trigger.

### 18.3 Security
- Role-based access enforced server-side (never client-only).
- Welfare data encrypted at rest.
- All API calls authenticated; CSRF protection; input validation.
- Audit log captures actor + IP for sensitive actions.
- Files (attachments, receipts, certificates) stored with signed URLs (time-limited).

### 18.4 Authentication
- v1: local accounts (email + password, MFA optional).
- Later phase: Microsoft SSO (OIDC). Designed to plug in without schema change.

### 18.5 Reliability
- Background jobs (state transitions, notifications) idempotent; retry with backoff.
- Daily backups; PITR (point-in-time recovery) target 24h.

### 18.6 Observability
- Structured app logs.
- Error tracking (Sentry-like).
- Basic metrics: registrations/day, certificates/day, notification delivery rate, error rate.

### 18.7 Data scale assumptions (sizing)
- Students: ~30k.
- Activities/year: ~500–2000.
- Registrations/year: ~50k–200k.
- Certificates/year: ~30k–100k.
- These are guesses — confirm with stakeholders.

---

## 19. Open questions & gaps

These are decisions still pending or assumptions you should pressure-test.

### 19.1 Gaps from explicit decisions
*(Rounds 20–21 resolved the items previously listed here — welfare permission matrix in §11.0, student-visible welfare summary in §11.4, waitlist auto-confirm in §7.3, self check-in flag in §6.1. This section is now empty; reintroduce items if new explicit-decision gaps are surfaced.)*

### 19.2 Things not yet asked (still open)
- **Group registration**: can a student register a group of friends, or is each registration individual? Default: individual.
- **Attendance threshold**: §5.3 defaults to 80% for programs. Confirm; allow per-activity override at creation.
- **Staff scheduling conflicts**: §15.5 doesn't currently warn when an Employee is assigned to two overlapping activities. Add?
- **Capacity for waitlist**: unlimited or capped (e.g. max 50 on waitlist per activity)?
- **Multi-currency**: confirm single currency for v1; tenant settings (§4.0) supports per-tenant currency for future SaaS.
- **Notification quiet hours**: §15.1 mentions per-user quiet hours; confirm whether this is needed in v1.
- **Bulk operations on registrations**: Coordinator may need bulk-email-all-registered, bulk-mark-attendance-from-list, bulk-export-roster. Confirm which are v1.
- **Activity cloning / templates** (covered for closed activities in §16 Scenario M): are there pre-built templates for common activity types at creation time? Probably v2.
- **Provider choice for email/SMS**: SES vs. SendGrid vs. local SMTP; SMS provider Twilio vs. local SAR provider. Implementation detail; flagged for the build phase.
- **Backup and disaster recovery**: RPO/RTO targets; off-site replication. IT-managed; document in a separate Ops doc.

*(Resolved round 22: recurring activities → §10.5 Program-per-term; certificate hours → §9.1.1 manual with auto-default; profile photo → §4.1 feed with moderated student override.)*
*(Resolved round 23: visitors / non-students → §7.1.6 guest registration with magic-link, opt-in per activity.)*

### 19.3 Remaining sub-questions (after rounds 17–19)

Most round-16 sub-questions were resolved in rounds 17–19. The few remaining:

- **Finance reference number format** (§7.8): how should SAMA generate reference numbers? Format constraints come from the finance side and belong in the Finance Integration Spec.
- **Auto-decision deadline default** (§7.1.5): the optional "auto-reject after X days unprocessed" setting needs a recommended default (e.g. 14 days?). Confirm.
- **Anytime-until-after-start cancellation type**: the four cancellation policy options cover most cases. Is "anytime until X minutes after start" needed (e.g. allow drop-out within first 30 minutes)? Probably not, but worth one sentence in the policy chooser.
- **Per-session waitlist**: when per-session capacity is enabled and a session is full, does the system maintain a per-session waitlist (auto-promotion if someone un-signs-up)? Currently §7.4 implies no per-session waitlist. Confirm or add.
- **Cross-department reporting**: a tenant-wide report (e.g. "all activities across Student Activities + Alumni") needs a TenantAdmin role to view. Out of scope for v1, flagged for v2.

### 19.4 Gaps from post-event decisions (rounds 13–15)
- **Re-close after reopen — survey behavior**: if a reopened activity adds a brand-new attendee whose registration becomes Completed, does that student receive the survey only, or are previously-submitted surveys re-opened for editing? Default: only new attendees get a fresh dispatch; previous responses are immutable. Confirm.
- **Survey edit window for students**: once submitted, can a student edit their answers? Default: no (immutable to preserve aggregate integrity). Confirm.
- **Auto-release fallback (30 days)**: configurable globally or per-activity? Should Manager be able to disable auto-release for high-stakes activities?
- **Internal-only photos**: the per-photo "internal only" flag is granular. Is bulk-mark-internal needed? Confirm UX.
- **Follow-up task ownership transfer**: can a task owner reassign? Default: yes (logged). Confirm.
- **Follow-up task SLAs / escalation**: if a task is overdue by N days, escalate to Manager? Currently only notifications fire to the owner.
- **Clone — what about co-coordinators and employee assignments**: should those carry over by default, or always start fresh? Default suggested: assignments do NOT carry; Coordinator (cloner) becomes owner; co-coordinators/employees re-assigned manually. Confirm.
- **Survey export**: can Manager export raw (anonymous) responses to CSV for external analysis? Likely yes; confirm and ensure export does not include any dispatch-side identifying data.
- **Closing partial completions**: what happens when Coordinator closes an activity with attendance still missing for some sessions? System currently warns (pre-close checklist) but doesn't block. Confirm this is intentional.
- **Reopen audit visibility to students**: should students be told "this activity was reopened — your records may have been updated"? Currently only Coordinators, Employees, and Manager are notified. Decide.
- **Survey impact on activities without certificates**: a Campaign-type activity with no certs — is the standard survey still mandatory? Currently yes (auto-attached). Confirm Coordinator can opt out for awareness campaigns.
- **Media gallery storage costs**: at scale (hundreds of activities × dozens of photos), storage and CDN costs add up. Need a quota/policy decision before launch.

*(Resolved round 23: ready-to-close → §14.1 Manager dashboard widget, no notifications; anonymous comments → §14.3 staff-only audience clarified, no public moderation needed; survey question library → §14.3 Manager-curated, versioned, with Coordinator suggestion flow.)*

*(Resolved round 24 — Budget module decisions, now reflected in §4.8, §6.1, §12, §17:*
- *Budget structure: single planned amount at creation (not line items). Transactions recorded post-approval are the detail breakdown.*
- *Budget is optional — activities with no planned amount set behave as zero-budget.*
- *All activity types (Event, Program, Volunteering, Task, External) have a Budget tab.*
- *Transaction recording locked until Approved / Active state.*
- *Warning threshold: 80% of approved amount. Visual indicator in Budget tab + notification to Coordinator and Manager.*
- *Coordinator has full edit/delete on their own transactions. Manager can edit/delete any.*
- *v1: expense transactions only. Income and adjustment types deferred to v2.*
- *Budget change requests appear in both the Approvals inbox and inline in the activity's Budget tab.*
- *Coordinator can see both planned and approved amounts.*
- *Transaction receipts are separate from the Documents module — lightweight attachment on the transaction only.*
- *Club-organised activities: Club Leader enters planned amount; Manager sets approved amount at approval.*
- *Budget tab empty state: stat cards always shown even when no budget is set — unset values display as "—", Spent shows AED 0. No blank empty-state.)*

*(Resolved round 25 — Co-funded budget model, now reflected in §4.8, §6.1, §12, §17:*
- *Two budget modes: simple (single total) and detailed (line items with University / Student / Split funding tags). Coordinator chooses at creation.*
- *Budget tab gains a Revenue section: Expected revenue vs. Received vs. Pending, sourced from the finance system (§7.8). Not manually entered.*
- *Income transactions are system-generated by the finance integration — not coordinator-enterable. Adjustment type remains deferred.*
- *Registration fee validation: in detailed mode, if student-funded per-head total mismatches the activity's registration fee, system shows a persistent warning. Fields remain independent.*
- *PRF (Purchase Request Form) workflow is deferred to v2. v1 shows an informational banner on budgeted activities reminding any authenticated employee that a PRF is required via the standard process.*
- *Budget tab stat cards expanded to six: Planned, Approved, Spent, Remaining, Expected revenue, Received revenue.)*

*(Resolved round 27 — Role architecture & club approval, now reflected in §3, §4.1, §4.5, §6.2, §10, §17:*
- *Roles are additive and module-scoped. Manager is the superset with no module boundary. Nurse/Counselor permissions are Health/Counseling module-only. Coordinator permissions are Activities module-only.*
- *Two new roles added to the matrix: Club Coordinator (internal, first-step approver for assigned clubs) and Club Advisor (internal or external observer, no approval authority in v1).*
- *Club Leader formalised as a student-facing system role granted per-club.*
- *"Supervisor" role dropped — Club Coordinator covers the function.*
- *Club activity approval is two-step: Club Coordinator (step 1, any one of the assigned coordinators acts — OR logic) → Manager (final). Manager can override at any time.*
- *Manager sees all Submitted activities from Phase 1 onward. Club Advisors receive FYI notification after Manager final approval.*
- *advisor_id on Club model replaced by ClubCoordinatorAssignment and ClubAdvisorAssignment many:many tables.*
- *Club approvals appear in the same Approvals inbox, tagged with the club name.*
- *Role assignment is Manager-only from the Settings page. No delegation in v1.)*

### 19.4a Resolved decisions — Round 28 (2026-05-12)

The following gaps were resolved in Round 28 and their decisions are now reflected throughout this PRD:

- **Gap 3** (Manager-Welfare): "Manager-Welfare" is not a separate sub-role. The term is removed from §11. The Manager role inherently holds welfare oversight. WelfareAssignment grants Employee-level welfare staff access, not a distinct Manager-Welfare role.
- **Gap 4** (Two-step club approval trigger): Triggered by `created_by has Club Leader role for the linked club`. A Coordinator creating an activity on behalf of a club follows the standard one-step flow. Updated in §6.2.2.
- **Gap 6** (Club Leader budget): Club Leaders can draft/suggest a budget (write access in Draft state only). Flow: Club Leader creates draft including budget suggestion → Club Coordinator reviews/adjusts and formally submits → Manager approves. Mechanically Draft→Submitted→Approved. Updated in §12.9 and §3.2.
- **Gap 1** (Staff terminology): "Staff" removed as a role name throughout §3. Replaced with specific role names (Coordinator, Manager, etc.) or "authenticated employee" as appropriate.
- **Gap 2** (Role table completeness): Club Coordinator → "Clubs (assigned)"; Club Advisor → "Clubs (assigned, notify-only)". Footnote added: Manager implicitly holds every role's permissions across all modules.
- **Gap 5** (Standard approval flow): Confirmed single-step: Coordinator submits → Manager approves. Note added in §6.2.1: activities not linked to a club, or club activities not created by a Club Leader, always follow this flow.
- **Gap 7** (Club creation): Club creation requires Manager approval. A Club Leader submits a club formation request; Manager approves or rejects. Added to §10.1.
- **Gap 8** (Club deactivation/archival): Club Coordinator can suspend a club (pending Manager confirmation). Manager can permanently archive. Added to §10.1.
- **Gap 9** (Club Advisor permissions): Activities = View only, Budget = View only, Clubs = View assigned clubs only, Reports = None. Updated in §3.2 and §3.3.
- **Gap 10** (Notification on submission): On Club Leader submission, notifications to all assigned Club Coordinators + Club Advisors (awareness only). Added to §6.2.2.
- **Gap 11** (Notification after step-1 approval): Manager receives "[Club Name] activity '[Title]' has passed coordinator review and awaits your approval." Added to §6.2.2.
- **Gap 12** (Rejection in two-step flow): Coordinator rejection → Draft. Manager rejection → Submitted with coordinator_approval_phase=coordinator_approved (Club Leader sees reason without redoing Coordinator review). Added to §6.2.2.
- **Gap 13** (Club Leader club visibility): Club Leaders can view own club detail and members; cannot see other clubs' member lists or budgets. Added to §10.6.
- **Gap 14** (Club metadata editing): Club Coordinator or Manager edits club metadata. Club Leader can propose changes via free-text request. Added to §10.7.
- **Gap 15** (Membership request approval): Approved by Club Coordinator or Manager. Club Leader can view pending requests but cannot approve/reject in v1. Added to §10.8.
- **Gap 16** (BR numbering): Business rules audited; no duplicates found. New BRs BR-CL8 through BR-CL16 and BR-B12a/BR-B12b added.
- **Gap 17** (Assignment types): §4.1 updated with who assigns, cardinality, and permission granted for all 4 assignment types.
- **Gap 18** (WelfareAssignment): Clarified as granting Employee-level welfare access to a specific service; assigned by Manager. "Manager-Welfare" is not a role.
- **Gap 19** (Round 28 log entry): This entry. Date 2026-05-12. 20 gaps closed in total (Gaps 1–20).
- **Gap 20** (coordinator_approval_phase): Added to §4.2 Activity table: `coordinator_approval_phase ENUM('pending','coordinator_approved') NULLABLE`, non-null only when status='submitted' and trigger condition (Club Leader creator) is met.

Total gaps closed in Round 28: 20.

### 19.5 Decisions deferred
- **Microsoft SSO**: deferred to a later phase. Local auth in v1.
- **TenantAdmin & multi-tenant provisioning**: schema-ready; UX/operations not designed for v1.
- **v2 modules** (Alumni, Colleges, etc.): module catalog is open-ended; specific module scopes belong in their own PRDs.
- **Finance Integration Spec**: separate document required before paid-activity build (see §19.3).
- **PRF workflow** (Purchase Request Form): full multi-step chain (Coordinator → Manager → Procurement → Finance → President) is a v2 feature. v1 shows a reminder banner only. See §12.8.
- **External Club Advisor accounts**: faculty or professionals outside the department assigned as Club Advisors need a limited external account type (scoped to their club(s), read-only, magic-link auth). Deferred to v2. v1: Club Advisors are internal staff only.

### 19.6 Architectural assumptions to validate
- **Single Manager in v1**, but the schema supports multiple Managers and per-department role assignments via `DepartmentRole` (§4.0). No retrofit needed when a second Manager joins.
- **Single Department in v1** (Student Activities). Schema includes `department_id` on all activities/clubs/welfare/budget/audit rows. Adding Alumni or Colleges as new departments later is a config + data-load operation, not a schema change. Each department can enable/disable modules independently.
- **Single Tenant in v1** (one university). `tenant_id` is on every row from day one. Migrating to multi-tenant SaaS is primarily an operational concern (per-tenant provisioning, per-tenant URLs/branding, tenant-scoped admin role).
- **All times in a single time zone** (Asia/Riyadh, UTC+3, no DST). Stored UTC; displayed Riyadh. Confirmed round 20.
- **Storage**: file uploads (attachments, receipts, certificates, photos) need a blob store managed by university IT. Per-activity media quota = 500 MB; per-photo limit = 20 MB; no video in v1.

---

## 20. High-level implementation phases

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
- Completion logic.
- **Manual closure flow** (Coordinator clicks Close → completion calc → certificate generation).
- Certificates with public verify.
- **Standard surveys** (auto-attached, anonymous, dispatched on closure, +3d/+7d reminders).
- **Survey-gated certificate download** + 30-day auto-release fallback.
- **Reopen activity** with reason.
- **Activity cloning** (Draft from past activity).
- Coordinator + Manager + Employee + Student dashboards (pre-built), including "Ready to close" badge.
- CSV/PDF export of rosters and attendance.

### Phase 2 — Clubs, budget, post-event extras
- Clubs, memberships, committees, club-sponsored activities.
- Activity budgets: planned/approved/actual, transactions, alerts, change requests.
- **Media gallery** (per-activity, with internal-only flag, archive view for students).
- **Follow-up tasks** (CRUD, dashboard, due-date reminders, "all open follow-ups" view for Manager).
- **Custom survey questions** (Coordinator adds beyond standard) + survey result viewing/export.
- **Optional post-event report** template.
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

## 21. Out of scope for v1
- Native mobile apps.
- Multi-language UI (Arabic).
- Multi-tenant / multi-department deployment.
- Payment gateway integration.
- Microsoft SSO (deferred to Phase 4).
- Full data-retention automation.

---

## 22. Decisions log (captured during requirements)

| # | Decision | Source |
|---|----------|--------|
| 1 | Roles: Manager, Coordinator, Employee, Student | earlier rounds |
| 2 | Activity types: Event, Program, Workshop, Campaign | earlier rounds |
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
| 21 | Closure: manual close only (Coordinator clicks "Close activity"); no auto-close on `end_at` | round 13 |
| 22 | Post-closure edits: reopen allowed by Coordinator/Manager with reason; certificates remain valid | round 13 |
| 23 | Coordinator post-event report: optional (template available) | round 13 |
| 24 | Surveys: standard auto-attached for every activity + optional Coordinator customization | round 14 |
| 25 | Survey timing: dispatched on closure with reminders; gates certificate download where certificates apply | round 14 |
| 26 | Survey anonymity: anonymous to all staff (schema-enforced) | round 14 |
| 27 | Certificate timing: generated and unlocked at manual closure (gated by survey if applicable) | round 14 |
| 28 | Student deliverables: not in v1 | round 15 |
| 29 | Media gallery: photos visible to all logged-in students (per-photo internal-only flag) | round 15 |
| 30 | Follow-up tasks: structured tasks with owner, due date, status, reminders | round 15 |
| 31 | Activity cloning: yes, clone-only (no separate lessons-learned database) | round 15 |
| 32 | Cancellation policy: per-activity choice (no-cancel / anytime / deadline / deadline + late-request) | round 16 |
| 33 | Data retention: keep all records forever; UI deletes are soft deletes; hard delete is infrastructure-level only | round 16 |
| 34 | Payments: SAMA does NOT process payments; read-only integration with university finance system | round 16 |
| 35 | Capacity model: hybrid — program-wide capacity + optional per-session sign-up + optional per-session capacity; attendance decoupled from sign-up | round 16 |
| 36 | Registration approval: default auto-confirm (FCFS); per-activity `requires_approval` flag for selective opportunities (Pending state, Coordinator decides) | round 16 |
| 37 | Single Manager in v1, but design supports multiple Managers and per-department roles via DepartmentRole | round 16 |
| 38 | Single department / single tenant in v1; schema includes `tenant_id` + `department_id` to support future multi-department (Alumni, Colleges) and SaaS multi-tenancy | round 16 |
| 39 | Survey responses are internal-only — never visible to other students; Coordinator can flag, Manager can delete with reason; anonymity preserved | round 16 |
| 40 | Media quota: 500 MB per activity, 20 MB per photo, no video in v1; storage infrastructure is IT-managed | round 16 |
| 41 | Late-cancellation requests remain in queue indefinitely; Coordinator can decide retroactively post-event (override system-set NoShow) | round 17 |
| 42 | Reapply policy on rejection: per-activity choice (`unlimited` / `one_retry` / `final`) | round 17 |
| 43 | Application queue: no cap; Coordinator manages | round 17 |
| 44 | Application form: per-activity multi-question form (1–5 questions, types: text/single/multi-choice) | round 17 |
| 45 | Per-session sign-up flow: per-activity choice (`register_first` default / `signup_first`) | round 18 |
| 46 | Walk-in attendance allowed past per-session capacity with non-blocking warning | round 18 |
| 47 | Finance integration mechanism deferred to a separate Finance Integration Spec; SAMA built with pluggable adapter | round 18 |
| 48 | Payment-required-to-attend: per-activity flag with Employee override at check-in (current PRD default confirmed) | round 18 |
| 49 | Soft-delete UX: "Deleted items" view covers all entities including welfare records (with restore) | round 19 |
| 50 | Hard-delete: out of scope for v1 — handled out-of-band when legally required | round 19 |
| 51 | Cross-department student profile visibility: full profile to receiving Coordinator (no minimum-necessary masking in v1) | round 19 |
| 52 | Module enablement: install-time only in v1; no in-app UI; reserved for future TenantAdmin role | round 19 |
| 53 | Concurrent edits handled by optimistic locking with version field and field-diff conflict UI | round 20 |
| 54 | Account lifecycle out of scope for v1; IdP is source of truth; SAMA reacts via nag on inactive owners only | round 20 |
| 55 | Language: English only in v1; i18n keys from day one for later Arabic + RTL. Time zone Asia/Riyadh | round 20 |
| 56 | Notification delivery tracked per channel; failed email/SMS surfaces in-app + Manager report; 3 retries with backoff | round 20 |
| 57 | Self check-in: per-activity `self_checkin_enabled` flag with rotating session QR + time window | round 21 |
| 58 | Public catalog: per-activity `is_public` flag exposing only title, dates, brief description, capacity status | round 21 |
| 59 | Waitlist promotion is auto-confirm (no separate confirmation window); cancel flow handles "can't make it" | round 21 |
| 60 | Welfare visibility is a per-role-per-module permission matrix (`none`/`summary`/`view`/`manage`); Manager configures; student sees their own appointment metadata but not notes | round 21 |
| 61 | Terminology: "Course" renamed to "Program" globally (glossary, schema enums, scenarios, decisions) | round 22 |
| 62 | Recurring activities (clubs that meet weekly): one Program-type activity per academic term with weekly sessions; new term = new Program | round 22 |
| 63 | Certificate hours: `Activity.cert_hours` is staff-set; default = sum of session durations; editable | round 22 |
| 64 | Profile photo: university feed first; student may upload an override (moderated); one-click revert to feed | round 22 |
| 65 | Guest registration: per-activity opt-in. Non-students register via public signed URL with email verification; `User.kind = guest`; magic-link access only; works for paid activities through the same finance gateway | round 23 |
| 66 | Survey comments are visible only to owning Coordinator(s) + Manager. Not a social-media-style feature; no public moderation surface needed | round 23 |
| 67 | Ready-to-close: Manager dashboard widget only; no notification escalation, no auto-closure | round 23 |
| 68 | Survey question library: Manager-curated, tenant-wide, versioned. Coordinators pick from library and/or add ad-hoc questions; suggested additions go to Manager for approval | round 23 |
| 69 | Manager-Welfare is not a separate sub-role; Manager role covers all welfare oversight. WelfareAssignment grants Employee-level welfare access per service | round 28 |
| 70 | Two-step club approval triggered by creator having Club Leader role for linked club; Coordinator-created club activities use standard one-step flow | round 28 |
| 71 | Club Leader budget: write access in Draft state only; Coordinator write access in Draft and Submitted; Manager sets approved amount | round 28 |
| 72 | Club creation requires Manager approval on a Club Leader's formation request | round 28 |
| 73 | Club suspension: Coordinator initiates, Manager confirms. Club archival: Manager only | round 28 |
| 74 | Club Advisor permissions: Activities/Budget view only for assigned clubs, Clubs view only, Reports none | round 28 |
| 75 | Notification on Club Leader submission: all assigned Coordinators + all assigned Advisors (awareness). Notification on step-1 approval: Manager receives confirmation message | round 28 |
| 76 | Manager rejection at step 2 returns activity to Submitted with coordinator_approval_phase=coordinator_approved (Club Leader sees reason without redoing step 1) | round 28 |
| 77 | Club Leader visibility: own club detail and members only; cannot see other clubs' member lists or budgets | round 28 |
| 78 | Club metadata changes: Coordinator or Manager edits; Club Leader proposes via free-text request | round 28 |
| 79 | Membership request approval: Club Coordinator or Manager; Club Leader can view but not approve/reject in v1 | round 28 |
| 80 | coordinator_approval_phase ENUM('pending','coordinator_approved') NULLABLE added to Activity table; non-null only when status='submitted' and trigger condition met | round 28 |
| 81 | Platform surface architecture: hybrid model (two UI surfaces, one shared backend). SAMA = internal staff tool, desktop-first. Student Portal = student-facing product, mobile-first PWA. | round 29 |
| 82 | SSO model: single university SSO for both surfaces. No separate credentials. Role-based routing: staff only → SAMA; student only → Student Portal; both → access to both surfaces. | round 29 |
| 83 | Part-time student/staff edge case: a user holding both a student identity and a staff role must be explicitly handled in the auth layer — they receive access to both surfaces. Exact UX TBD in design. | round 29 |
| 84 | Club Leader / club officer access: all club officers are students and access the system exclusively via the Student Portal "Workspace" tab. They never access SAMA. Their submissions create Drafts in SAMA for the Club Coordinator to process. | round 29 |
| 85 | V1 flat officer permissions: all club officers (regardless of title) have identical access in the Student Portal "Workspace" tab. Differentiated officer permissions deferred to V2. | round 29 |
| 86 | Round 30 — Workspace tab naming: Club officer management tab in Student Portal named "Workspace" to indicate action/work orientation rather than "My Club" which implies a passive membership view. | round 30 |

---

*End of PRD. The PRD is substantively complete for v1 scope. Remaining open items are narrow and listed in §19.2 / §19.3 (e.g. finance reference-number format, auto-decision deadline default, per-session waitlist behavior, authenticated employee scheduling-conflict warnings, bulk operations confirm). Section §4.0 (Tenancy and departments) is the most architecturally consequential addition; even a v1 single-department deployment must carry `tenant_id` and `department_id` from day one.*


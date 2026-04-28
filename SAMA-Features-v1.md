# Student Activities Department

## Student Activities Management App (SAMA)
### Feature Specification Document

| | |
|---|---|
| **Version** | 1.0 |
| **Date** | April 2026 |
| **Status** | Internal Review |

> This document describes the full feature set of the Student Activities Management App — a unified system for the Department of Student Services to plan, manage, and report on all departmental activities. It covers every module, how it works, how it connects to other modules, and the business rules that govern it.

---

## Table of Contents

1. [Overview](#overview)
2. [Technical Notes](#technical-notes)
3. [01 · Activity Management & Hub](#01--activity-management--hub)
4. [02 · Event Module](#02--event-module)
5. [03 · Program Module](#03--program-module)
6. [04 · Task & Project Module](#04--task--project-module)
7. [05 · Approval Workflow](#05--approval-workflow)
8. [06 · External Module](#06--external-module)
9. [07 · Volunteering Module](#07--volunteering-module)
10. [08 · Transportation Module](#08--transportation-module)
11. [09 · Notifications](#09--notifications)
12. [10 · Document Management](#10--document-management)
13. [11 · Certificate Generation](#11--certificate-generation)
14. [12 · Sports Roster Management](#12--sports-roster-management)
15. [13 · Post-Activity Feedback Surveys](#13--post-activity-feedback-surveys)
16. [14 · Student Participation Transcript](#14--student-participation-transcript)
17. [15 · Reports & Analytics](#15--reports--analytics)
18. [16 · People Registry](#16--people-registry)
19. [18 · Student Portal](#18--student-portal)

---

## Overview

The Student Activities Management App (SAMA) is a web-based management system built specifically for the Student Activities Department. It replaces fragmented spreadsheets, email chains, and WhatsApp threads with a single, connected workspace.

Everything the department manages — whether an event, a sports season, a task, an external announcement, or a volunteering drive — is modelled as an **Activity**. Each Activity has a type, an owner, a status, and a set of participants. The type determines which features and sub-modules become available. This means the system has one unified interface rather than five separate tools.

### The Five Activity Types

| Type | What it covers | Key characteristic |
|---|---|---|
| **Event** | Workshops, competitions, cultural nights, orientations, ceremonies | Has a defined date, venue, registration, and optional QR check-in |
| **Program** | Sports seasons, recurring training sessions, long-running programs | Made up of repeating sessions; participants enrol once, attendance per session |
| **Task / Project** | Internal work items, document submissions, facility upgrades, Admin tasks | Has subtasks, assignees, and deadlines; no public-facing component |
| **External** | Third-party events and conferences we announce to students | Registration is on an external URL; we optionally track our participants |
| **Volunteering** | Students volunteering internal or with external organisations or causes | Tracks hours, outcomes, and certificates per participant. Certificates can be by us or the organizers |

### Users & Roles

SAMA uses Microsoft login (Azure Active Directory / Microsoft Entra ID) for all users. Staff, students, and club leaders all sign in with their university Microsoft account — no separate password or registration is needed. External guests who register for public events do not need a login.

| Super Admin | Ops Manager | Activity Coordinator | Club Leader | Student | External Guest |
|---|---|---|---|---|---|
| Full platform access | All activities + reports | Assigned activities only | Their club events only | Self-service portal | Public registration, no login |

| Role | What they can do |
|---|---|
| **Super Admin** | Full access to all features, system configuration, user management, and audit log. |
| **Operations Manager** | Create and manage any activity. Approve or reject submitted activities. View all reports and finance data. Send notifications. |
| **Activity Coordinator** | Create and manage activities assigned to them. Manage participants, run check-in, upload documents, manage transport. |
| **Club Leader** | Create events on behalf of their student club. The event goes through the same approval process. Cannot access other clubs' or department activities. |
| **Student** | Log in via Microsoft to register for events, view participation history, and download their QR ticket. Cannot create or manage activities but can submit activity or project idea or plan. |
| **External Guest** | Register for public events via a form without logging in. Receives confirmation email with QR ticket. Should confirm their email. |

> **ℹ️ INFO:** Microsoft login is implemented via NextAuth.js with the Microsoft Entra ID (Azure AD) provider. Any user with a valid university Microsoft account can log in instantly — no separate account creation or password management needed.

---

## 01 · Activity Management & Hub

*The central workspace for all departmental activities*

The Activity Hub is the default home screen for all staff. It shows every activity across all five types in one view, with filters to narrow down to what each person needs.

### Creating an Activity

Any staff member with Coordinator role or above (including Club Leaders for their own club) can create an activity. The creation process works as follows:

- Select the activity type — Event, Program, Task, External, or Volunteering. The form immediately adapts to show only the fields relevant to that type.
- Fill in the base information: title, description, category, start and end dates, semester, and whether the activity is public (visible on the student portal) or internal only.
- Fill in type-specific details — venue, capacity, session schedule, subtasks, external URL, or volunteering hours target depending on the type selected.
- Optionally attach sub-modules: Transportation, Documents, or a Feedback Survey.
- Save as draft. The activity sits in draft state until it is submitted for approval.

### Activity Hub — Filtering & Search

- The Hub displays all activities in a list, defaulting to the current semester and active/draft statuses.
- Staff can filter by: activity type, category, status, semester, date range, and assigned owner.
- A search bar searches across activity titles, descriptions, and tags.
- Coordinators only see activities they are assigned to. Ops Managers and Super Admins see everything.
- Club Leaders only see activities belonging to their club. And events created by other clubs (view only).

### Activity Status Lifecycle

| Status | Meaning | How it gets here |
|---|---|---|
| **Draft** | Created but not yet submitted. Only visible to the creator and admins. | Default state on creation |
| **Pending Approval** | Submitted for review. Locked from editing until a decision is made. | Coordinator/Club Leader submits |
| **Approved / Active** | Approved by Ops Manager. Public activities are visible on the student portal. | Ops Manager approves |
| **Rejected** | Returned to the creator with a comment explaining why. | Ops Manager rejects |
| **Completed** | Activity is over. Post-close checklist done. Archived for reporting. | Coordinator marks complete. Ops manager should close. |
| **Cancelled** | Activity cancelled before it ran. Participants notified automatically. | Coordinator or Ops Manager cancels |

### Approval Process

The approval process is intentionally simple. When a coordinator or club leader finishes drafting an activity, they press "Submit for Approval." This triggers the following:

- The activity status changes to Pending Approval and becomes locked — no edits while under review.
- The Ops Manager receives an email notification with a direct link to the activity review screen.
- The Ops Manager opens the activity, reviews all details, and either Approves or Rejects it.
- If approved: the activity becomes Active. If it is a public activity, it immediately appears on the student portal.
- If rejected: the Ops Manager must enter a reason. The activity reverts to Draft and the creator receives an email with the rejection reason. They can edit and resubmit.

> **📝 NOTE:** There is only one approval step — the Ops Manager. There is no multi-step chain. This keeps the process fast and clear. If a more complex chain is needed later (e.g. adding a Finance sign-off for paid events), it can be added as a configuration option.

### Semesters

Every activity belongs to a semester (e.g. "Fall 2025–26", "Spring 2026"). Semesters are managed by the Ops Manager or Super Admin. The current semester is set as the default for all new activities and all Hub filters. Previous semesters can be browsed for historical reference and reporting.

### Calendar View

In addition to the list view, the Activity Hub includes a Calendar view showing all activities plotted on a monthly/weekly calendar, colour-coded by activity type. Coordinators can switch between list and calendar at any time. Clicking an activity on the calendar opens its detail page. The calendar is especially useful for spotting scheduling conflicts and planning a busy semester at a glance.

---

## 02 · Event Module

*Full lifecycle management for one-off and short-run events*

An Event is any activity with a defined date, time, and venue. It can be a workshop, a competition, a cultural night, an orientation, a ceremony, or any other gathering. Events can be Private (Students only) or public (students and guests can register). Some events might not need registration, like cultural night or club fairs.

### Event Creator vs. Event Organiser

SAMA distinguishes between the person who creates the event in the system and the people who actually run it on the ground:

| Role | Who it is | What they do in the system |
|---|---|---|
| **Event Creator** | A staff member or Club Leader who enters the event into SAMA. | Creates the activity record, sets the details, submits for approval. May or may not be present at the event itself. Responsible of SAMA entries. |
| **Event Organiser(s)** | One or more people — staff, club members, or external partners — who manage the event on the day. | Added to the event record by the creator. They appear on the event's public page as the contact. They can manage participants, run check-in, and upload documents. |

This matters because a staff administrator might create and submit 10 events in a semester on behalf of different clubs and organising teams. The organiser is who participants actually deal with.

### Event Details

- Title, Arabic title (optional), description, category, dates and time, semester, banner image.
- Venue: selected from the venue registry.
- Capacity: maximum number of participants. If no limit is needed, leave blank.
- Visibility: Public (shown on the student portal and open for registration) or Internal (staff-facing only).
- Organised by: a student club or the department itself.
- Tags: free-text labels for filtering and searching (e.g. "inter-university", "freshman", "ramadan").

### Registration

When a public event has registration enabled, a registration form is attached to it. The system provides a built-in form with standard fields. Staff can add additional custom fields on top of the standard ones if needed.

| Field | Notes |
|---|---|
| Full Name | Required on all forms |
| Email | Required. University email for students; any email for external guests |
| Phone Number | Optional but recommended |
| Student ID | Optional — shown only if the event is flagged as student-only |
| Custom fields | Staff can add additional text, dropdown, or yes/no fields specific to this event (e.g. "Dietary requirement", "T-shirt size", "Team name") |

- Students who are logged in via Microsoft have their name and email pre-filled. They just confirm and submit.
- External guests (public events) fill the form without logging in. Their name and email are recorded in the system as a guest Person record.
- The registration deadline can be set. After the deadline, registration is closed unless a coordinator manually adds someone.
- For internal events, participants are added manually by staff — there is no public form.

### Capacity & Waitlist

- When the event reaches its capacity limit, new registrations are automatically placed on a waitlist with a numbered position.
- When a confirmed participant cancels (or is removed by staff), the system automatically notifies the next person on the waitlist.
- The notified person has a configurable window (default: 24 hours) to confirm their spot. If they do not respond, the system moves to the next person in the queue.
- Staff can manually override the waitlist — promoting any specific person regardless of their position.

### QR Check-in & Attendance

QR check-in is optional and configured per event. When enabled:

- Every confirmed participant receives a unique, digitally signed QR code in their confirmation email.
- On the day, a coordinator or volunteer opens the scanner page on any smartphone — no app needed, it works in the mobile browser.
- Scanning a QR code marks the participant as attended and records the time and the staff member who scanned.
- Paid events use single-use QR codes — re-scanning an already-used code shows a red alert and does not re-admit.
- If QR is not available, staff can use the manual check-in fallback: search the participant list by name and check them in directly.
- No-shows are marked explicitly so reports can distinguish between "did not attend" and "not recorded."

### Transfers & Late Additions

- Staff can add participants after the registration deadline (the system records it as a late addition for transparency).
- If transfers are enabled on an event, a confirmed participant can transfer their spot to another person before the transfer deadline.

---

## 03 · Program Module

*Long-running activities made of recurring sessions — sports seasons, training programs*

A Program is a long-running activity with multiple sessions over a period of time. A football season running from September to May, a weekly wellness program, a coaching series — all of these are Programs. Participants enrol in the program once; attendance is then tracked session by session.

### Program Setup

- Program title, description, category, season label (e.g. "2025–2026 Season"), semester, and default venue.
- Enrollment settings: whether enrollment is open, the enrollment deadline, and maximum participants.
- Session schedule: the frequency of sessions — for example, "Every Tuesday and Thursday, 6pm–8pm." The system uses this to generate the session list.

### Session Generation & Holiday Awareness

When a coordinator sets the program's session schedule, the system generates all individual sessions for the season automatically. Before confirming, the coordinator sees a calendar preview showing every generated session.

Sessions that fall on university public holidays or exam periods are automatically flagged and removed from the generated list. The coordinator can restore any removed session or add custom one-off exceptions before confirming. Once confirmed, all sessions are created in bulk.

### Enrollment

- Staff can enrol participants manually or allow students to self-enrol via the student portal.
- When the maximum participant count is reached, further enrolments land on a waitlist (same logic as Events).
- Each enrolled participant gets a confirmation email with the program schedule and venue.

### Per-Session Attendance

- Each session has its own attendance record independent of other sessions.
- Attendance is taken via QR scan or manual check-in, identical to the Event module.
- The system tracks a running attendance percentage per participant across all sessions so far.
- If a participant's attendance drops below a configurable threshold (default: 70%), an email is automatically sent to them and the coordinator.

### Session Management

- Individual sessions can be cancelled with a reason. Enrolled participants are automatically notified by email.
- A different venue can be set for a specific session, overriding the program default.
- A coach or session lead can be assigned per session.

---

## 04 · Task & Project Module

*Internal work tracking — submissions, projects, admin work*

Not all departmental work is a public-facing event. Submitting competition documents, upgrading the student lounge, organising the logistics for a campus visit, writing a report — all of these are Tasks or Projects. This module tracks them without any public-facing component.

### Simple Task vs. Project

| Type | Use when... | Structure |
|---|---|---|
| **Simple Task** | The work has one owner, one deadline, and one outcome. | Single record with owner, due date, status, and file attachments. |
| **Project** | The work involves multiple steps, people, or deliverables. | A parent activity with multiple subtasks, each having its own assignee, due date, and status. |

### Task Fields & Behaviour

- Title, description, priority (low / medium / high / urgent), due date, assigned owner, and status.
- Status options: To Do, In Progress, Done, Blocked.
- File attachments: upload related documents, emails, or reports directly onto the task.
- Internal comments: staff can leave notes and updates on the task (visible only to staff).

### Subtasks (Projects)

- Each subtask has its own assignee, due date, and status independently of the others.
- The parent project shows overall progress as a percentage based on how many subtasks are done.
- A subtask can be marked as Blocked with a note explaining what is holding it up.

### Overdue Detection & Alerts

- When a task or subtask passes its due date without being marked as Done, the system sends an automatic email alert to the assignee and the activity owner.
- Overdue tasks are highlighted in the Activity Hub so the Ops Manager can see them at a glance.

---

## 05 · Approval Workflow

*Simple, clear sign-off before any activity goes live*

Every activity that is meant to go live — Events, Programs, External announcements, and Volunteering Assignments — goes through a single approval step. Tasks do not require approval.

### How It Works

- The creator drafts the activity and, when ready, presses Submit for Approval.
- The Ops Manager receives an email notification with a summary of the activity and a link to the review screen.
- On the review screen, the Ops Manager sees all activity details: title, dates, venue, organiser, participant capacity, any attached documents, and transport or budget details if added.
- The Ops Manager either approves or rejects.

### If Approved

- The activity status moves to Active.
- If the activity is public, it immediately appears on the student portal and registration opens.
- The creator receives an email confirmation.

### If Rejected

- The Ops Manager must enter a rejection reason before confirming.
- The activity status reverts to Draft.
- The creator receives an email with the rejection reason and a direct link back to the activity to edit it.
- The creator makes changes and can resubmit. The Ops Manager sees the resubmission with a note that it was previously rejected.

### Ops Manager Inbox

The Ops Manager has a dedicated "Pending Approvals" view in their dashboard showing all activities currently awaiting their review, sorted by submission date. Each entry shows the activity title, type, creator name, and the date submitted.

> **📝 NOTE:** Club Leaders go through the same approval process as coordinators. An event created by a club leader is reviewed and approved by the Ops Manager just like any other activity.

---

## 06 · External Module

*Announce third-party events and track our participants*

Sometimes the department wants to promote an event organised by another institution — a conference, an inter-university competition, or an external workshop. The External Module handles this: we create a record for the event, share it with students, and optionally track which of our students participated.

### Creating an External Activity

- External organiser name, external registration URL, event date and location, and a description for the announcement.
- Category and semester — so it appears in the right place in reports.
- Visibility: Public (shown on student portal with a link to the external registration page) or Internal (informational only).

### Tracking Our Participants

Since registration happens on the external organiser's website, SAMA cannot automatically know who from our community signed up. There are two ways to track this:

- Staff manually adds students who confirmed participation after the event.
- Students self-report: a logged-in student can mark themselves as "I attended this" on the activity page. This is recorded as a self-reported participation.

> **📝 NOTE:** There is no QR code, no payment, and no waitlist for External activities. They are informational records with optional participant tracking.

---

## 07 · Volunteering Module

*Manage student volunteer assignments and track hours*

The Volunteering Module manages formal volunteering assignments — situations where students are sent or apply to volunteer for an external cause, an NGO, a community event, or an off-campus project. The department tracks who went, how many hours they contributed, and the outcome.

Not only external, also this module should track our volunteering activities.

### Creating a Volunteering Assignment

- Assignment title, description, the external organisation name and contact, location, target hours, and semester.
- Whether the assignment is open for student applications or staff-assigned only.
- Maximum number of volunteers (optional).

### Participant Management

- If open for applications: students apply through the student portal. Staff review applications and confirm or decline.
- If staff-assigned: coordinator selects students directly from the People directory.
- Each confirmed volunteer has a status: Assigned, Active, Completed, Withdrawn.

### Hours Tracking

- After the assignment, the coordinator logs the actual hours contributed per participant.
- Students can see their logged hours in their student portal and they are included in the Participation Transcript.
- Total volunteer hours per student are automatically calculated across all assignments and shown in reports.

### Certificates

After a volunteering assignment is completed, the coordinator can issue participation certificates to all or selected volunteers. The certificate includes the student's name, the organisation name, the number of hours, and the activity date. See Feature 12 (Certificate Generation) for details on how certificates are produced.

---

## 08 · Transportation Module

*Logistics for any activity that involves travel — linked directly to the activity*

Transportation is not a standalone tool — it is a sub-module that attaches to any activity (Event, Program session, or Volunteering Assignment) that involves moving participants from one place to another. When a coordinator creates an event to Abu Dhabi, they add a Transportation record to that same event. Everything is in one place.

### Adding Transportation to an Activity

From any activity's detail page, a coordinator can open the Transportation tab and add one or more transport arrangements. Multiple vehicles can be added to the same activity (e.g. two buses, one for males and one for females).

| Field | Description |
|---|---|
| Vehicle type | Bus, van, university shuttle, private vehicle, etc. |
| Vehicle reference | Plate number or booking reference — used for conflict detection |
| Driver name & contact | Name and phone number of the driver |
| Departure datetime | Date and time of departure |
| Return datetime | Estimated return time |
| Departure location | Where participants meet (e.g. "Main Gate, Building A") |
| Destination | Where the group is going |
| Capacity | Maximum passengers for this vehicle |
| Status | Planned, Departed, Returned, or Cancelled |

### Passenger Management

- Once transport is set up, the coordinator assigns passengers from the activity's confirmed participants.
- The system enforces vehicle capacity — no more passengers can be assigned than the vehicle can carry.
- Each assigned passenger receives an automatic email notification with: departure time, meeting point, driver name and contact number, and the destination.

### Conflict Detection

- If the same vehicle reference (plate or booking number) is already assigned to another activity at the same date and time, the system blocks the save and shows the conflicting activity.
- This prevents the same bus from being double-booked across two different activities.

### Status Tracking

- The coordinator updates the transport status: Departed when the vehicle leaves, Returned when the group is back.
- If a transport is cancelled, any assigned passengers are automatically notified by email.

> **ℹ️ INFO:** Because Transportation is attached to the activity itself, coordinators and managers always see travel logistics in context. When reviewing an event to Abu Dhabi, the vehicle, driver, passenger list, and departure time are all visible on the same page as the event details.

---

## 09 · Notifications

*Automatic email communications to participants and staff*

SAMA sends emails automatically for key events. All emails go to university email addresses. The system never sends to personal or external email addresses for students — only to their @university.ac.ae address as retrieved from Microsoft login.

### Automatic Triggers

| Trigger | Who receives it | What it contains |
|---|---|---|
| Registration confirmed | Registrant | Event details, venue, date/time, and QR code (if check-in is enabled) |
| Added to waitlist | Registrant | Waitlist position number and what to expect |
| Waitlist spot offered | Next person on waitlist | A spot is available — confirm within 24 hours or it moves to the next person |
| Activity cancelled | All confirmed participants | Cancellation reason and any next steps |
| Activity approved | Activity creator | The activity is live — link to view it on the portal |
| Activity rejected | Activity creator | Rejection reason and a link to edit and resubmit |
| Task assigned | Assignee | Task title, due date, and direct link |
| Task overdue | Assignee and activity owner | Task name and how many days overdue |
| Session cancelled | All enrolled program members | Which session, reason, and next session date |
| Transport assigned | Assigned passenger | Departure time, meeting point, driver name and contact |
| Low attendance warning | Student and coordinator | Current attendance percentage and the threshold that triggered it |
| Certificate issued | Participant | Certificate attached as PDF, with a verification link |

### Manual Broadcast

Coordinators can send a free-text message to all confirmed participants of any activity at any time. They write a subject and body, preview the recipient count, and send. Every manual broadcast is logged so there is a record of all communications sent per activity.

> **📝 NOTE:** WhatsApp notifications are planned for a future phase. The system is designed so that WhatsApp can be added as a second channel for any existing trigger without rebuilding the notification engine.

---

## 10 · Document Management

*Organised, versioned file storage attached to every activity*

Every activity can have documents attached to it. Documents are not stored as a flat pile of files — they are categorised by type so staff always know what documents exist and what is still missing for an activity.

### Document Types

| Type | Purpose | Visibility |
|---|---|---|
| Proposal | Activity plan submitted for approval | All staff |
| Risk Assessment | Safety and risk evaluation for off-campus or sports activities | All staff |
| Consent Form | Signed consent for minors or off-campus trips | All staff |
| Budget Document | Quote, invoice, or approved budget letter | Finance only (Ops Manager + Super Admin) |
| Approval Letter | Official sign-off document | All staff |
| Post-Event Report | Summary written by the coordinator after the activity ends | All staff |
| Receipt | Payment receipts linked to budget line items | Finance only |
| Certificate Template | The design file used to generate participant certificates | Internal only |
| Other | Any file that does not fit the above categories | All staff |

### Version History

- If a document of the same type is uploaded again (e.g. a revised proposal), the system creates a new version rather than replacing the old one.
- All previous versions remain downloadable. Staff can see who uploaded each version and when.
- This ensures there is always a clear record of how a document evolved — important for audit and accountability.

### Visibility Controls

- **internal_only:** visible to all staff involved with this activity.
- **finance_only:** visible only to the Ops Manager and Super Admin. Coordinators cannot see these documents even if they manage the activity. This is enforced at the database level, not just the interface.
- **public:** visible on the public activity listing page (e.g. an event agenda PDF).

### Document Approval Sub-flow

Proposals and Risk Assessments can be flagged as requiring approval. When flagged:

- The document is marked as "Pending Review" after upload.
- The Ops Manager is notified to review the document.
- The Ops Manager approves or rejects it with a comment.
- The document status and the reviewer's comment are shown on the activity page.

### File Security

Every uploaded file is automatically scanned for malware before it becomes accessible. Files that fail the scan are quarantined and the uploader is notified. Files are stored securely with access controlled by the visibility setting — a direct link to a finance_only document does not work unless the viewer has the right role.

---

## 11 · Certificate Generation

*Automated PDF certificates for participants — no manual design work*

After an activity ends, coordinators can issue participation certificates to participants in bulk. Certificates are generated automatically as PDFs from a pre-set template — no manual design or export work needed.

### How It Works

- The coordinator opens the activity's Participants tab and selects who should receive a certificate (all confirmed, all who attended, or a custom selection).
- The coordinator selects the certificate type: Attendance, Completion, Volunteering Hours, or Achievement.
- The system generates a PDF for each selected participant in the background.
- Once all PDFs are ready, each participant receives an email with their certificate attached.
- Participants who are logged-in students can also download their certificates directly from the student portal.

### Certificate Contents

| Field | Source |
|---|---|
| Participant full name (English) | From their Person record |
| Participant full name (Arabic) | From their Person record if available |
| Student ID | From their Person record if available |
| Activity title | From the activity |
| Activity date | From the activity |
| Hours contributed | From the volunteering hours log — for volunteering certificates only |
| Issuing coordinator name | From the staff member who issued the certificate |
| University name and logo | From the platform configuration |
| Unique verification code | Generated automatically — a UUID that can be scanned or typed at a verification URL |

### Certificate Template

The department uploads a certificate template (an HTML/CSS design) once during system setup. The system slots each participant's details into the template and renders the final PDF. Arabic names are rendered correctly using right-to-left text formatting. The template can be updated at any time and all future certificates will use the new design.

### Verification

Every certificate has a unique code printed at the bottom. Anyone who receives a certificate can verify it is authentic by visiting the platform's verification page and entering the code. The verification page shows: participant name, activity name, date, and type of certificate — without showing any other personal data. This is useful for employers, scholarship committees, or academic records.

> **📝 NOTE:** Download count is tracked per certificate. The coordinator and admin can see how many times each certificate has been downloaded — useful for confirming a student actually retrieved their certificate.

---

## 12 · Sports Roster Management

*Squad management for sports programs — connected to attendance and participation*

When a Program is a sports season (e.g. the football team's training season), the Sports Roster adds a layer of team management on top of the standard enrollment and attendance features. It is an optional add-on available on any Program where the coordinator enables it.

### Roster Fields per Player

| Field | Notes |
|---|---|
| Jersey number | Assigned number for the season |
| Playing position | e.g. Striker, Goalkeeper, Midfielder |
| Squad status | Starter, Reserve, Trialist, Injured, or Suspended |
| Kit size | Clothing size for kit allocation |
| Kit issued date | Date the kit was handed to the player — tracks who has received it |
| Coach notes | Private notes from the coach per player. Not visible to the student. |
| Emergency contact | Name and phone number of the player's emergency contact |

### Connection to Other Modules

- Roster entries are linked to the player's Participation record in the program — so enrollment, attendance, and roster information are all in one place per player.
- Attendance is tracked per session as normal (see Program Module). The roster adds the squad context on top.
- If a player is marked as Injured or Suspended in the roster, their status is visible to the coach when reviewing session attendance — so absences can be contextualised.
- Kit issuance is tracked on the roster. The coordinator can see at a glance which players have and have not collected their kit.

### Printable Team Sheet

The coordinator can export a printable team sheet PDF from the roster at any time. It lists all players with their jersey number, position, and squad status. Useful for match day, travel, or internal review.

---

## 13 · Post-Activity Feedback Surveys

*Collect participant feedback and measure activity quality*

After any Event or Program ends, a feedback survey can be sent to participants automatically. The results feed directly into the Reports module to help the department measure quality and identify what works.

### Survey Configuration

- The coordinator sets whether the survey is sent automatically when the activity is marked as completed, and how many hours after completion it should be sent (default: 2 hours).
- Surveys can be anonymous (responses not linked to individual names) or named. Anonymous setting cannot be changed once responses exist.
- Custom questions can be added to the default set.

### Default Survey Questions

- Overall rating: 1 to 5 stars (required)
- What did you enjoy most about this activity? (open text)
- What could be improved? (open text)
- Would you attend again? (Yes / No / Maybe)
- How did you hear about this activity? (Portal / Email / WhatsApp / Staff / Friend)

### Results

- The coordinator sees a results dashboard for each activity: average rating, number of responses, response rate (responses vs. participants surveyed), and individual responses if not anonymous.
- If the average rating falls below 3.0, the Ops Manager receives an automatic alert.
- Results feed into the Reports module for cross-activity satisfaction analysis.

---

## 14 · Student Participation Transcript

*An official record of a student's activities, hours, and certificates*

The Participation Transcript is an official PDF document that summarises everything a student has done through the department. It is used for job applications, scholarship applications, dean's letters, and visa documentation.

### Who Generates It

Transcripts are generated by admin staff (Ops Manager or Coordinator). A student cannot generate their own transcript — this ensures the document is official and controlled. The generating staff member's name and the generation date are recorded.

### What the Transcript Shows

- University letterhead and the student's full name in English and Arabic.
- Student ID.
- A table of all confirmed participations: activity name, type (event, volunteering, program, etc.), role, date, and hours where applicable.
- Total volunteer hours accumulated across all activities.
- A list of certificates earned with the certificate type and date issued.
- Generation date, the name of the staff member who generated it, and a unique verification code.

### Verification

Like certificates, transcripts carry a unique verification code. The verification page confirms the transcript is genuine by showing a summary of its contents — useful for third parties like employers or scholarship offices.

### Filtering

Staff can generate a transcript for a specific semester (e.g. "Fall 2025–26 only") or for all time. Only confirmed and completed participations are included — waitlisted, cancelled, and pending records are excluded.

---

## 15 · Reports & Analytics

*Cross-activity dashboards for coordinators and management*

The Reports module gives both coordinators and management a clear picture of how the department is performing. Coordinators see data for their own activities; Ops Managers and Super Admins see everything across all activities and semesters.

### Scope & Access

| Role | What they see in Reports |
|---|---|
| **Coordinator / Club Leader** | Data for their own activities only — participant counts, attendance rates, budget vs. actual, feedback scores. |
| **Ops Manager** | All activities across all coordinators and clubs. Full semester dashboards. Budget totals. Satisfaction comparisons. |
| **Super Admin** | Everything the Ops Manager sees, plus system-level metrics. |

### Participation Reports

- Total registrations, confirmed participants, no-shows, and waitlist size per activity.
- Participation rate by activity category across a semester.
- Top activities by headcount — which events and programs had the highest turnout.
- Participation trends across semesters — are more students engaging this year than last year?

### Attendance Reports

- Per-session attendance rates for programs.
- Overall program attendance percentage per enrolled participant.
- Low-attendance roster: a list of students below the threshold across all programs they are enrolled in.

### Budget & Finance Reports

- Total approved budget vs. actual spend per activity.
- Revenue collected (from paid events) vs. costs.
- Net surplus or deficit per activity.
- Top expense categories aggregated across all activities in a semester.

### Satisfaction Reports

- Average satisfaction rating per activity.
- Average satisfaction by activity category (sports, cultural, academic, volunteering).
- Coordinator-level averages: how do different coordinators' activities compare on participant satisfaction?
- Satisfaction trend across semesters.
- Red-flag list: all activities with an average rating below 3.0, with a link to the feedback detail.
- Top-rated activities per semester.

### Semester Comparison

Staff can select any two semesters and compare them side by side on any metric: number of activities, total participants, average satisfaction, total volunteer hours, and total budget spend. This is the primary tool for the annual report to university leadership.

### Calendar & Visual Overview

All reports have a companion calendar view that shows activities plotted on a timeline, colour-coded by type. This gives a visual sense of how busy different periods of the semester were and where there were gaps.

### Exports

- All reports can be exported as CSV.
- Budget and finance reports can additionally be exported as Excel (.xlsx).
- The export always reflects the current filter and date range — staff see exactly what they export.

---

## 16 · People Registry

*One record per person — across all activities and all time*

The People Registry is the master list of everyone who has ever participated in a departmental activity. Each person has one record regardless of how many activities they have been part of. Staff, students, and external guests all have a Person record.

### What a Person Record Contains

- Full name (English and Arabic), email (university email for students), phone number, and student ID if applicable.
- Person type: Student, Staff, Faculty, or External Guest.
- For students: a link to their university Microsoft account (populated automatically on first login).
- Preferred language (English or Arabic) — affects which language notifications are sent in.
- All Participation records linked to this person — every activity they have ever been part of.

### Deduplication

When someone registers for an event with an email that already exists in the registry, the system matches the registration to their existing Person record rather than creating a duplicate. This means a student's full participation history is always consolidated in one place.

### Privacy & Data

- Personal data is only collected to the extent needed for each activity type. External guest forms ask only for name, email, and phone.
- Students can view their own data through the student portal.
- Super Admin can export or anonymise a person's data on request.

> **📝 NOTE:** The People Registry is not a substitute for the university's Student Information System. It is a participation record. The university's SIS remains the authoritative source for student academic data.

---

## 18 · Student Portal

*A self-service view for students — log in with Microsoft*

The Student Portal is the student-facing side of SAMA. Students log in using their university Microsoft account and see a simplified, read-only-mostly view focused on their own activities and registrations.

### What Students Can Do

- Browse public events and programs for the current semester — with filters for category and date.
- View their status and in which club are they registered in.
- Apply to be a club member. Exit clubs etc.
- Register for open events. If they are already logged in, their name and email are pre-filled.
- View their upcoming registrations with status (confirmed, waitlisted) and download their QR ticket.
- See their full participation history across all semesters.
- View their total volunteer hours.
- Download any certificates issued to them.
- Apply for volunteering assignments that are open for applications.
- Self-report participation on External activities they attended.
- Submit post-activity feedback surveys.

### What Students Cannot Do

- Create or edit any activity — that is staff-only.
- See other students' participation data.
- Generate their own Participation Transcript — this is generated by admin staff on request.
- See internal documents, budget information, or staff comments.

> **ℹ️ INFO:** Microsoft login means zero friction for students — they click "Sign in with Microsoft," their university account is recognised, and they are in. No registration form, no password reset emails, no forgotten accounts.

---

## Technical Notes

### Microsoft Login

All user authentication is handled via Microsoft Entra ID (Azure Active Directory). Users click "Sign in with Microsoft" and are authenticated using their university Microsoft 365 account. No passwords are stored in SAMA. Student and staff profiles are created automatically on first login based on their Microsoft account details. This is implemented using the NextAuth.js library with the Microsoft Entra ID provider.

### Connections Between Modules

The modules in SAMA are not isolated tools — they share data and reinforce each other. The table below summarises the key cross-module connections:

| When you use... | It connects to... | How |
|---|---|---|
| Event Module | Transportation | Add a transport arrangement directly on the event. Participants assigned to transport are drawn from the event's confirmed registrants. |
| Event Module | Document Management | Upload the event proposal, risk assessment, and post-event report all on the event page. Documents are versioned and access-controlled. |
| Event Module | Notifications | Confirmations, reminders, cancellations, and waitlist updates are all sent based on changes to the event's participant list. |
| Program Module | Sports Roster | Enrolment in a sports program automatically creates a roster entry. Attendance and roster status are visible together per player. |
| Program Module | Transportation | Transport can be added to individual sessions of a program — e.g. away matches or off-campus training days. |
| Volunteering Module | Certificates | Hours logged on a volunteering assignment flow directly into the certificate content when the certificate is issued. |
| Volunteering Module | Transcript | Volunteer hours contribute to the student's total hours shown on their Participation Transcript. |
| Approval Workflow | Document Management | Documents attached to an activity at submission time are visible to the approver during the review process. |
| Reports | All modules | Every registration, attendance record, budget entry, and feedback response feeds into the Reports module automatically. |
| Venue Registry | Events & Programs | Venue selection on any activity runs a conflict check against all other activities using the same venue at the same time. |

---

*— End of Document —*

*Student Activities Management App · Feature Specification · April 2026*

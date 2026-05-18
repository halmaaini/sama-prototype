# SAMA — Tech Stack & Architecture Recommendations

> Companion to `SAMA-PRD-v1.md`. Covers the recommended technology choices, rationale, and architecture decisions needed to take the prototype to production. Tech-stack agnostic decisions (what to build) live in the PRD; this document covers how to build it.

---

## 1. TL;DR

| Layer | Recommended choice |
|---|---|
| Frontend | **Next.js 15** (React 19, App Router) |
| Backend API | **NestJS** (Node.js, TypeScript) |
| Database | **PostgreSQL 16** |
| Auth | **University SSO (OIDC/SAML)** via Passport.js + local-password fallback for v1 |
| Job queue | **BullMQ + Redis** |
| Real-time | **Server-Sent Events (SSE)** via NestJS |
| File storage | **S3-compatible** (AWS S3 or MinIO for self-hosted) |
| Email | **Resend** (or SendGrid) |
| PDF generation | **Puppeteer** (headless Chrome, server-side) |
| QR codes | **qrcode** npm package |
| API contract | **OpenAPI 3.1** auto-generated from NestJS decorators via `@nestjs/swagger` |
| Deployment | Frontend: Vercel · Backend + Workers: Railway or VPS · DB: managed PostgreSQL |

---

## 2. Architecture overview

SAMA has three user-facing surfaces and one shared backend — all defined in PRD §2.5.

```
┌────────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
│   SAMA (staff)     │   │  Student Portal (PWA) │   │   HSE Portal     │
│   Next.js app      │   │  Next.js app          │   │  Next.js app     │
│   Desktop-first    │   │  Mobile-first PWA     │   │  Simple queue UI │
└────────┬───────────┘   └──────────┬────────────┘   └───────┬──────────┘
         │                          │                          │
         └──────────────────────────┴──────────────────────────┘
                                    │
                        ┌───────────▼────────────┐
                        │   NestJS REST API       │
                        │   (single backend)      │
                        └─────────┬──────────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              │                   │                    │
     ┌────────▼───────┐  ┌───────▼──────┐   ┌────────▼──────┐
     │  PostgreSQL 16  │  │  Redis       │   │  S3 Storage   │
     │  (primary DB)   │  │  (BullMQ +   │   │  (files, PDFs,│
     │                 │  │   SSE cache) │   │   photos)     │
     └─────────────────┘  └──────────────┘   └───────────────┘
```

Three separate Next.js deployments (SAMA, Student Portal, HSE Portal) — all calling the same NestJS API. They share no code at the routing layer but can share a component library.

---

## 3. Frontend — Next.js 15

### Why Next.js, not plain React

The prototype is plain React (no build process). Production requires:
- **Routing** — the prototype has a toy `go()` switcher. App Router gives file-based routing, nested layouts, and parallel routes (important for SAMA's sidebar + detail panel patterns).
- **SSR / SSG** — the public certificate verification page (PRD §9.2, Scenario K), the public activity catalog (BR-AC2), and the guest registration page (§7.1.6) all need to be accessible without login. Next.js SSR handles these naturally.
- **PWA** — the Student Portal must be a PWA (PRD §2.5). Next.js + `next-pwa` covers service workers and offline caching.
- **API routes** — not used for business logic (that lives in NestJS), but useful for auth callbacks (OIDC redirect handling) and signed-URL proxying.

### Migration from prototype

The prototype's UI primitives (`ui.jsx`, `icons.jsx`) translate directly to React components. A developer migrates the prototype screen by screen, replacing mock `SAMA.ACTIVITIES` with `useQuery()` calls to the NestJS API.

### Key libraries

| Need | Library |
|---|---|
| Server state / API calls | **TanStack Query v5** (React Query) |
| UI state | **Zustand** (replaces prototype's `store.jsx`) |
| Forms | **React Hook Form + Zod** (validation at form layer + shared Zod schemas with backend) |
| Date/time | **date-fns** (lightweight; avoid moment.js) |
| Calendar / scheduling UI | **react-big-calendar** or **FullCalendar** (Hub calendar view, §1.2) |
| QR scanner (check-in) | **html5-qrcode** (camera-based scan on Employee's device) |
| Rich text (briefing notes, post-event reports) | **Tiptap** (ProseMirror-based, headless) |
| Drag and drop (board view) | **@dnd-kit/core** |
| Charts (reports) | **Recharts** |
| PDF viewer (embedded Appendix A, HSE form) | **react-pdf** |
| Virtualized lists (activity hub, large rosters) | **TanStack Virtual** |
| PWA | **next-pwa** |

### Three Next.js deployments

| App | Entry | Notes |
|---|---|---|
| `apps/sama` | `sama.univ.edu` | Staff tool. Desktop-first. Auth required. |
| `apps/portal` | `portal.univ.edu` | Student PWA. Mobile-first. Auth required + magic-link for guests. |
| `apps/hse` | `hse.univ.edu` | HSE Portal. Desktop. SSO only. Minimal surface. |

Managed as a **monorepo** (Turborepo) with a shared `packages/ui` component library and `packages/api-client` (auto-generated from the OpenAPI spec — see §9).

---

## 4. Backend — NestJS

### Why NestJS over Next.js API routes or a lightweight framework (Express, Fastify, Hono)

- **NestJS** is a full application framework: dependency injection, module system, guards, interceptors, pipes. A system of SAMA's complexity (9 data modules, 8+ role types, audit interceptors on every write, complex middleware) would become unmanageable in a flat Express app.
- **API routes in Next.js** are fine for BFF patterns and auth callbacks — not for a system with background workers, scheduled jobs, SSE streams, and a multi-module architecture. Mixing business logic into the frontend deployment makes independent scaling impossible.
- NestJS is **TypeScript-first** — matches the shared Zod schema approach with the frontend and auto-generates the OpenAPI spec via `@nestjs/swagger`.

### Module structure

Each PRD domain section maps to a NestJS module — mirrors the PRD's own structure:

```
src/
  modules/
    auth/           § SSO, local auth, JWT sessions, role guards
    users/          §4.1 User & identity, provisioning
    activities/     §4.2, §5, §6 Activity lifecycle + sessions
    registrations/  §4.3, §7 Registration, waitlist, approvals
    attendance/     §4.3, §8 Attendance + completion
    certificates/   §4.4, §9 Cert templates + issuance
    clubs/          §4.5, §10 Clubs, UDSU, reactivation, acknowledgment
    budget/         §4.8, §12 Budget, transactions, change requests
    welfare/
      counseling/   §4.6, §11
      health/       §4.7, §11
    notifications/  §4.9 Multi-channel delivery
    audit/          §4.10 Append-only event log
    reports/        §4.11, §14.9, §15 Dashboards + OBEF report
    surveys/        §4.12
    media/          §4.13
    tasks/          §4.14
    trips/          §4.17 Off-campus, risk assessments, HSE, consent forms
    settings/       §15a Admin settings
    provisioning/   §4.16 SIS sync, CSV import
  workers/
    scheduler/      Cron jobs: state transitions, nightly SIS sync, cert generation
    notifications/  BullMQ consumer for async notification delivery
    pdf/            BullMQ consumer for PDF generation queue
  shared/
    guards/         RolesGuard, TenantGuard, ModuleGuard
    interceptors/   AuditInterceptor (auto-logs every write), TenantInterceptor
    decorators/     @Roles(), @CurrentUser(), @Tenant()
    database/       TypeORM entities + migrations
```

### Key libraries

| Need | Library |
|---|---|
| ORM | **TypeORM** (mature PostgreSQL support, migrations, soft-delete, optimistic locking — all needed per PRD) |
| Validation | **class-validator + class-transformer** (NestJS native) + **Zod** for shared schemas exported to frontend |
| Auth | **Passport.js** — `passport-saml` (university SSO) + `passport-local` (v1 password fallback) + **@nestjs/jwt** for session tokens |
| Job queue | **BullMQ** (Redis-backed) — for async PDF generation, email dispatch, SIS sync, notification fanout |
| Scheduled jobs | **@nestjs/schedule** — for every-minute state-transition evaluations (§5.4), daily SIS sync (§4.16), cert auto-generation |
| Real-time | **@nestjs/event-emitter** + custom SSE controller — lightweight; no WebSocket overhead needed for notifications |
| PDF | **Puppeteer** — renders HTML templates to PDF (certificates, Appendix A risk assessment, transcripts). Run in a dedicated BullMQ worker process to avoid blocking the API. |
| QR codes | **qrcode** — generate rotating session QR codes + certificate verification QR |
| Email | **Resend SDK** (clean API, good deliverability, `.ics` attachment support for registration confirmations) |
| File storage | **AWS SDK v3** (S3-compatible; swap endpoint for MinIO in dev) |
| OpenAPI | **@nestjs/swagger** — auto-generates spec from decorators; zero extra work |
| Magic links | **nanoid** (token generation) — for guest registration flow (§7.1.6) and cert verification codes |
| CSV parsing | **PapaParse** or **csv-parse** — for SIS batch import and guest bulk import |
| Push notifications | **web-push** — for Student Portal PWA service worker push (§4.9) |

---

## 5. Database — PostgreSQL 16

### Why PostgreSQL

The PRD's data model is clearly relational: complex foreign-key relationships (Activity → Sessions → Registrations → Attendance → Certificates), multi-column constraints (one registration per student per activity), JSON fields (eligibility rules, hazard assessment rows, OBEF sub-types), and soft deletes everywhere. PostgreSQL handles all of this natively.

### Key PostgreSQL features used directly from the PRD

| PRD requirement | PostgreSQL feature |
|---|---|
| Soft deletes (`deleted_at` on 10+ entities) | TypeORM `@DeleteDateColumn()` with query filtering |
| Optimistic locking (§15.9, `version` field on Activity) | TypeORM `@VersionColumn()` |
| Append-only audit log (§4.10) | Separate `audit_events` table; application layer never deletes rows |
| Multi-tenancy (§4.0) — `tenant_id` + `department_id` on all entities | Row-level filtering in guards + TypeORM scopes |
| ENUM fields (`status`, `role_in_club`, `obef_kpi`, `trip_classification`, etc.) | PostgreSQL native ENUM types |
| JSON fields (eligibility rules, hazard rows, checklist configs) | JSONB column with GIN index |
| Full-text search (activity title, description, tags) | `tsvector` column + GIN index — no external search engine needed at v1 scale |
| Scheduled expiry (registration windows, magic-link tokens) | Cron job reads against indexed timestamp columns |

### Schema design notes

- Every table: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `tenant_id UUID NOT NULL`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`.
- Soft-delete tables also have `deleted_at TIMESTAMPTZ` + a partial unique index excluding soft-deleted rows where needed.
- `AuditEvent` table is **insert-only at the application layer**. Use a PostgreSQL role with `INSERT ONLY` privilege on this table to enforce it at the DB layer too.
- Migrations managed with TypeORM migration files (checked into git, run in CI before deploy).

---

## 6. Infrastructure services

### 6.1 Job queue — BullMQ + Redis

The PRD requires several async/scheduled workloads that must run outside the request/response cycle:

| Job | Trigger | Notes |
|---|---|---|
| **Activity state transitions** (RegistrationOpen, RegistrationClosed, InProgress) | Cron every 60s | §5.4 |
| **Waitlist auto-promotion** | Event-driven (registration cancelled) | §7.3 |
| **Certificate generation** | Event-driven (activity → Completed) | Puppeteer PDF; queued to avoid blocking API |
| **Survey dispatch** | Event-driven (activity → Completed) | §14.3 |
| **Nightly SIS sync** | Cron nightly | §4.16 |
| **Notification fanout** | Event-driven | Announcement → many recipients; queued per recipient |
| **Email delivery** | Event-driven | Consumed from notification queue |
| **Magic-link expiry cleanup** | Cron daily | §7.1.6 |
| **48h pending-removal-review timeout** | Event-driven (deadline passes) | §10.8, BR-CL25 |
| **HSE escalation timeline** (Day 1/3/5 reminders) | Cron every hour | §6.8.2 |
| **Board acknowledgment 7-day reminder** | Cron daily | §10.11 |

BullMQ uses Redis as its backing store. The same Redis instance also serves as the session cache if you move to Redis-backed JWT sessions.

### 6.2 Real-time — Server-Sent Events (SSE)

PRD §4.9 requires in-app notifications. SSE is sufficient — the system needs to push events to the browser, not receive messages from it (no bidirectional WebSocket needed).

- NestJS SSE endpoint: `GET /notifications/stream` — authenticated, streams `Notification` events as they are written.
- Frontend: `EventSource` in a React context, updates the TanStack Query cache directly.
- Fallback: long-polling if the deployment environment blocks SSE (some corporate networks).

### 6.3 File storage — S3-compatible

Files stored in SAMA:
- Activity attachments (posters, agendas, consent forms)
- Insurance documents (international trip consent, §7.1.7)
- Receipt uploads on budget transactions (§4.8, BR-B6)
- Media gallery items (photos/videos, §4.13)
- Student-uploaded profile photos (§4.1)
- Generated PDFs (certificates, Appendix A, transcripts) — write by the PDF worker, read by frontend

**Recommendation**: AWS S3 in production, MinIO in development (same SDK, swap endpoint via env var). Never serve private files directly from S3 — generate signed URLs (15-minute expiry) in the API.

### 6.4 PDF generation — Puppeteer

PDFs needed per the PRD:
- **Certificates** (§9.1) — branded template + QR code + verification code; auto-issued on completion
- **DSS Risk Assessment — Appendix A** (§4.17, §6.8.1) — structured form, printable
- **Annual Club Summary** (§10.12) — table + stats
- **Transcript** (§4.1, BR-SP18) — student activity history
- **OBEF report export** (§14.9) — CSV is the primary export; PDF optional

Puppeteer renders a styled HTML template (React component rendered to static HTML by Next.js, or a standalone Handlebars template) to PDF. Run in a **dedicated BullMQ worker** — Puppeteer is memory-heavy and must not share the API process.

### 6.5 Email — Resend

Required per PRD:
- Registration confirmation with `.ics` calendar attachment
- Activity cancellation / date change notifications
- Announcement broadcasts (§6.7)
- Waitlist promotion (§7.3)
- Magic-link for guest email verification (§7.1.6)
- Certificate delivery to guests (§7.1.6)
- Survey dispatch links (§4.12)
- Staff invitations (§4.16)
- HSE escalation reminders (§6.8.2)

Resend supports `.ics` attachments, React Email templates (composable, version-controlled email HTML), and delivery webhooks (needed for PRD §15.1 "undelivered notification" tracking — `Notification.state = failed`).

### 6.6 Push notifications — Web Push

The Student Portal is a PWA (PRD §2.5). Push notifications require a service worker + Web Push API. Use the `web-push` npm package in NestJS to send pushes via the VAPID protocol. Notification preferences (§4.9) are stored in `NotificationPreference` — respected per channel before dispatching.

---

## 7. Authentication

### Strategy

```
v1: university email + local password (students + staff)
Later phase: university SSO (SAML 2.0 or OIDC) replaces local password
```

The PRD (§2.5, §4.1) calls for Microsoft SSO eventually. Design for it from day one — use Passport.js with a SAML/OIDC strategy that you can swap in without changing the rest of the auth layer.

### Session model

- **JWT (short-lived, 15min)** + **refresh token (7 days, stored in HttpOnly cookie)**.
- JWT payload: `{ sub: userId, tenantId, departmentRoles: [...], kind: 'student'|'staff' }`.
- Role resolution happens at login — the JWT carries the resolved role set. Refresh on role change (Manager reassigns a role → affected user's next refresh sees the update).

### Role routing (PRD §2.5)

After successful auth, the API returns the user's `kind` and roles. The frontend (whichever surface) inspects this and redirects:
- `kind = staff`, no student role → SAMA
- `kind = student`, no staff role → Student Portal
- Both → surface chooser (design TBD per PRD §2.5)
- HSE Portal: separate SSO entry; only users with `hse_staff` flag get in

### Magic links (PRD §7.1.6 — guests)

Guest magic links are **not JWTs**. They are opaque tokens (`nanoid`, 32 chars) stored in a `magic_link_tokens` table (`token_hash, registration_id, expires_at, used_at`). The API validates the hash on each request and issues a time-limited guest session token scoped to that registration only. No main-app access.

### Guards (NestJS)

Three guards, applied in this order:
1. `AuthGuard` — validates JWT; populates `req.user`
2. `TenantGuard` — ensures the requested resource belongs to `req.user.tenantId`
3. `RolesGuard` — checks `@Roles(...)` decorator against `req.user.departmentRoles`, with module-scope enforcement (a Nurse guard passes only inside Health module routes)

---

## 8. Key integrations

### 8.1 SIS (Student Information System) — §4.16

- **Mechanism**: nightly cron job in NestJS calls the university's SIS API (or processes a dropped file from the SIS) to sync the student roster.
- **Fields synced**: student_id, full_name, email, program, year, enrollment_status.
- **Match logic**: email first, student_id second. On match → upsert. On no match → insert new record.
- **Enrollment change**: if status changes to inactive/withdrawn → flag student in SAMA + notify affected Coordinators.
- **Fallback**: Manager uploads CSV via Settings → People (§15a.2). Same upsert logic.

### 8.2 Finance system — §7.7, §7.8

- **Integration style**: event-based. SAMA sends a "payment reference created" event to the finance system when a paid registration is confirmed. Finance system responds asynchronously via webhook with `fee_status = paid | failed | refunded`.
- **SAMA never handles money** — it only tracks `fee_status` and triggers events. No payment gateway in SAMA.
- **Webhook endpoint**: `POST /webhooks/finance` — validates HMAC signature, updates `Registration.fee_status`, triggers refund notification to student if `refunded`.

---

## 9. OpenAPI spec — the key to plug-and-play

### Why this matters

Without an OpenAPI spec, the frontend developer must read the NestJS source code to know what endpoints exist, what parameters they take, and what they return. With it, the frontend gets a **generated API client** — typed, auto-complete, zero manual wiring.

### How it works in NestJS

`@nestjs/swagger` reads NestJS decorators and auto-generates an OpenAPI 3.1 YAML file. No separate spec to maintain.

```typescript
// NestJS controller — spec is derived from this, not written separately
@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {

  @Post()
  @Roles('coordinator', 'manager')
  @ApiOperation({ summary: 'Create a new activity (Draft)' })
  @ApiResponse({ status: 201, type: ActivityDto })
  create(@Body() dto: CreateActivityDto, @CurrentUser() user: User) { ... }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit activity for approval (§6.2)' })
  @ApiResponse({ status: 200, type: ActivityDto })
  @ApiResponse({ status: 403, description: 'Not the owner or wrong state' })
  submit(@Param('id') id: string) { ... }
}
```

The spec is served at `/api/docs` (Swagger UI for developers) and at `/api/openapi.json` (machine-readable).

### Frontend API client — auto-generated

Use **`openapi-typescript-codegen`** or **`orval`** to generate a fully-typed TypeScript client from the spec:

```bash
# Run after each NestJS deploy to regenerate the client
npx orval --input http://api.univ.edu/api/openapi.json --output packages/api-client/src
```

The frontend imports from `@sama/api-client` — typed request functions, typed response shapes. No hand-written `fetch()` calls. When the backend changes a field, TypeScript compilation tells the frontend immediately.

### What the spec covers

- Every endpoint: route, method, path params, query params, request body shape, response shape, error codes
- Auth requirements per endpoint (`BearerAuth`)
- Role requirements (documented in `@ApiOperation` summary)
- Pagination shapes, filter params
- File upload endpoints (multipart)

### Recommended workflow

1. Backend dev writes NestJS controller + DTO → spec auto-updates.
2. Frontend dev runs `npm run generate:api` in the monorepo → typed client regenerates.
3. Both surfaces (SAMA, Portal) import from the same `packages/api-client`.
4. On breaking change: TypeScript compiler catches mismatches before CI fails.

---

## 10. Development tooling

| Tool | Purpose |
|---|---|
| **Turborepo** | Monorepo task orchestration (build, lint, test in parallel across apps) |
| **TypeScript** (strict mode) | All packages: frontend, backend, shared schemas |
| **ESLint + Prettier** | Consistent style; enforced in CI |
| **Vitest** | Unit tests (fast, native TypeScript, works in NestJS and Next.js) |
| **Playwright** | E2E tests for critical flows (registration, approval, cert download) |
| **Docker Compose** | Local dev: PostgreSQL + Redis + MinIO in one `docker compose up` |
| **GitHub Actions** | CI: lint → type-check → unit tests → E2E (on PR); deploy on merge to main |
| **Prisma or TypeORM migrations** | Database migrations in source control; run in deploy pipeline before pod starts |

---

## 11. Deployment

### Recommended setup (cost-efficient for a single university)

| Component | Platform | Notes |
|---|---|---|
| SAMA (Next.js) | Vercel | Edge-cached static assets; automatic preview deployments per PR |
| Student Portal (Next.js PWA) | Vercel | Same — separate Vercel project |
| HSE Portal (Next.js) | Vercel | Same |
| NestJS API | **Railway** or **Render** | Container-based; easy env var management; auto-deploy on push |
| BullMQ workers (PDF, notifications) | Railway — separate service | Same container image as API; different entrypoint. Scale independently. |
| PostgreSQL | **Supabase** or **Neon** | Managed PostgreSQL; automatic backups; pgBouncer for connection pooling |
| Redis | **Upstash** (serverless Redis) | Pay-per-use; perfect for BullMQ at university scale |
| S3 storage | **AWS S3** | Or Cloudflare R2 (cheaper egress) |
| Email | **Resend** | Free tier covers early usage |

### Alternative: self-hosted (if university IT policy requires it)

Replace Vercel → **Nginx + PM2** on a VPS, Supabase → **managed PostgreSQL on the same server**, Upstash → **Redis on the same server**. The code doesn't change — only the deployment targets. Docker Compose handles the full stack locally and can be adapted for a self-hosted server.

---

## 12. What the prototype has already decided

The prototype (`sama-prototype/lib/*.jsx`) is not throwaway — it is a **working UI specification**. A developer opening it immediately knows:

- All screen layouts, component hierarchies, and navigation structure
- Which data fields appear where (every mock data shape in `data.jsx`)
- Interaction patterns (sidebar + detail panel, tabs, modals, toasts)
- The full color system, spacing, and typography via `ui.jsx`
- Which icons are used for which concepts via `icons.jsx`

**What the developer does NOT need to redesign:**
- Any screen layout
- Component API (Avatar, Card, Btn, Chip, Stat, Segmented, Input — all defined)
- Navigation structure (sidebar primary + secondary + command palette)
- Role switcher pattern (bottom-left role picker)

**What still requires engineering decisions:**
- TypeORM entity definitions (derive from PRD §4 data models)
- API endpoint design (derive from PRD §5–§14 + OpenAPI spec approach above)
- Auth middleware and role guard implementation
- BullMQ job definitions and retry policies
- S3 folder structure and signing policy
- Email template design (React Email components)
- PDF template HTML/CSS (certificates, Appendix A)

---

## 13. Questions to answer before development starts

These are not product questions (the PRD answers those) — they are operational/infrastructure questions:

1. **Self-hosted vs. cloud?** Does the university's IT policy require data to stay on-premise? This affects deployment platform choice (§11) but not code.
2. **SSO now or later?** The PRD says "local password in v1, SSO later." Can you flip this — do SSO from day 1? It simplifies the auth layer significantly and avoids building a password-reset flow you'll later discard.
3. **What SIS does the university use?** (Ellucian Banner, Oracle PeopleSoft, a custom system?) This determines the SIS integration method (REST API, SFTP file drop, database read replica).
4. **Which finance system?** Determines webhook shape for `fee_status` updates (§7.8).
5. **Microsoft 365 tenant?** If yes, Resend + Microsoft 365 relay is the email path; `@nestjs/azure-service-bus` might be relevant for SSO integration.
6. **Team size and composition?** One full-stack developer vs. a frontend + backend split determines whether to start with the monorepo approach or a simpler two-repo setup.

# IIM Lucknow — Visitor Management System

Phase 1 MVP for digital visitor entry at Main Gate: pre-registration, walk-in kiosk, gate passes with QR codes, check-in/out, security dashboard, blacklist, and audit trail.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **SQLite** (local dev) / **PostgreSQL** (production) + **Prisma ORM**
- **Tailwind CSS** for UI
- JWT session cookies (SSO-ready; mock auth for pilot)

## Phase 1 Features (Implemented)

| PRD Requirement | Status |
|---|---|
| Pre-registration by hosts | ✅ Host portal |
| Walk-in kiosk with OTP | ✅ `/kiosk` |
| ID capture (manual entry) | ✅ Kiosk form |
| Host notification | ✅ Mock SMS/WhatsApp/email (console logs) |
| Gate pass + QR code | ✅ Printable pass at `/pass/[code]` |
| Check-in / check-out | ✅ Guard portal |
| Real-time security dashboard | ✅ `/admin` |
| Blacklist cross-check | ✅ Admin blacklist + kiosk block |
| Overstay alerts | ✅ Dashboard flags |
| Audit trail | ✅ Immutable audit log |
| RBAC (5 roles) | ✅ Guard, Host, Admin, IT Admin, Audit |

## Prerequisites

- Node.js 20+

## Setup

```bash
cd ~/Projects/iim-lucknow-vms
cp .env.example .env

npm install
npm run setup
npm run dev
```

SQLite is used by default (`prisma/dev.db`) — no Docker or PostgreSQL required for local development. For production, switch `prisma/schema.prisma` to `postgresql` and set `DATABASE_URL` accordingly.

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

All accounts use password: `password123`

| Email | Role |
|---|---|
| prof.sharma@iiml.ac.in | Host |
| guard@iiml.ac.in | Security Guard |
| admin@iiml.ac.in | Admin |
| it@iiml.ac.in | IT Admin |
| audit@iiml.ac.in | Audit (read-only) |

## User Flows

### Pre-registered visitor
1. Host logs in → **Pre-invite Visitor**
2. Visitor receives SMS/email with visit code (logged to console in dev)
3. Visitor shows QR at gate → Guard scans/enters code → **Check In** → Gate pass printed

### Walk-in visitor
1. Visitor uses **Kiosk** (`/kiosk`) → OTP → ID + host selection
2. Host gets notification → approves in Host portal
3. Guard checks in at Gate Operations

### Blacklist
- Admin adds entry at `/admin/blacklist`
- Matching name/phone/ID blocked at registration

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/visits` | Create pre-registration |
| PATCH | `/api/visits/[id]` | Approve/reject/cancel |
| POST | `/api/walk-in` | Kiosk walk-in registration |
| POST | `/api/otp` | Send/verify OTP |
| POST | `/api/check-in` | Guard check-in |
| POST | `/api/check-out` | Guard check-out |
| GET | `/api/dashboard` | Live campus stats |
| GET | `/api/pass/[code]` | Public pass lookup |
| GET | `/api/public/hosts` | Host directory for kiosk |

## Phase 2 Roadmap

- IIM Lucknow SSO (LDAP/AD) integration
- WhatsApp Business API + SMS gateway
- Hindi UI strings (i18n)
- Academic Block gate
- CSV/PDF report exports
- Offline kiosk mode with sync
- Boom barrier QR integration

## Architecture

```
Web Portal (Host/Admin)  │  Kiosk  │  Guard Terminal
         │                      │            │
         └────────── REST API (Next.js) ─────┘
                         │
              PostgreSQL + Audit Log
```

## Security Notes

- ID numbers masked in UI (`idDocumentLast4`)
- JWT in httpOnly cookies, 8-hour expiry
- All mutations logged to append-only `AuditLog`
- Change `JWT_SECRET` before production deployment

## License

Internal use — IIM Lucknow Estate Office / IT Department.

# Product Requirements Document

## Visitor Management System — IIM Lucknow

**Version:** 1.0  
**Date:** June 28, 2026  
**Status:** Draft

---

## 1. Executive Summary

IIM Lucknow's campus hosts a high volume of daily visitors — industry guests, interview candidates, delivery personnel, parents, alumni, and event attendees. Currently, visitor entry is managed manually via paper registers at security gates, creating security gaps, no audit trail, and a poor first impression for guests. This PRD defines the requirements for a digital Visitor Management System (VMS) that streamlines entry, improves campus security, and creates a professional, trackable visitor experience.

---

## 2. Problem Statement

| Pain Point | Current State |
|---|---|
| No digital record | Paper registers, illegible entries, easy to fake |
| No pre-registration | Walk-ins cause bottlenecks at gates |
| No real-time tracking | Security cannot tell who is on campus at any time |
| No host notification | Guards manually call hosts to verify visitors |
| No overstay alerts | Visitors can stay beyond permitted time undetected |
| Compliance gaps | No audit trail for sensitive visits (placements, Board meetings) |

---

## 3. Goals & Success Metrics

### Goals

- Reduce gate processing time per visitor from ~3–4 min to under 60 seconds
- Achieve 100% digital visitor log with zero paper dependency within 90 days of go-live
- Enable real-time campus occupancy visibility for security and admin

### Success Metrics

- Gate wait time ≤ 60 seconds per visitor
- Host notification delivered within 30 seconds of visitor arrival
- System uptime ≥ 99.5%
- Visitor data retrievable within 10 seconds for any audit query
- ≥ 80% of hosts using pre-invite feature within 3 months

---

## 4. Stakeholders

| Stakeholder | Role |
|---|---|
| Security & Estate Office | Primary operators; gate check-in/check-out |
| Academic & Admin Office | Host department for most visitors |
| PGP/FPM/MBA Students | Occasional hosts for personal guests |
| Faculty & Staff | Hosts for professional visitors |
| IT Department | System owner, infrastructure, integrations |
| Director's Office | Compliance, audit access |
| Visitors (external) | End users of check-in kiosk/OTP flow |

---

## 5. Scope

### In Scope

- Pre-registration of visitors by hosts (web + mobile)
- Walk-in visitor registration at gate kiosk
- ID capture (Aadhaar/PAN/passport scan or manual entry)
- Host notification via SMS/WhatsApp/email on arrival
- Gate pass generation (printable + QR code)
- Check-out logging
- Real-time dashboard for security
- Admin reports and audit exports
- Overstay and blacklist alerts

### Out of Scope (Phase 1)

- Vehicle/parking management
- Biometric integration
- Integration with LMS or academic systems
- Visitor Wi-Fi provisioning

---

## 6. User Roles & Permissions

| Role | Capabilities |
|---|---|
| **Security Guard** | Register walk-ins, scan QR gate passes, mark check-out, flag incidents |
| **Host (Faculty/Staff/Student)** | Pre-invite visitors, approve/reject arrivals, view own visitor history |
| **Admin / Estate Office** | Full dashboard, generate reports, manage blacklists, configure settings |
| **IT Admin** | System configuration, user management, integrations |
| **Director / Audit** | Read-only access to all logs and reports |

---

## 7. Functional Requirements

### 7.1 Pre-Registration (Host Side)

- Host logs in via IIM Lucknow SSO (existing credentials)
- Fills: visitor name, phone, organization, purpose, expected date/time, duration
- System generates a unique visit code + QR code sent to visitor via SMS/WhatsApp/email
- Host can cancel or modify invitation up to 1 hour before scheduled arrival
- Recurring visitor option (e.g., weekly contractor) with bulk invite

### 7.2 Walk-in Registration (Gate Kiosk)

- Touch-screen kiosk at Main Gate and Academic Block gate
- Visitor enters phone number → OTP verification
- Guard scans/photographs government ID
- Visitor selects host from directory or enters name/department
- System auto-notifies host; guard waits for approval (timeout: 5 min)
- On approval, system prints gate pass with QR code and time-stamped validity

### 7.3 Gate Pass & Entry

- QR code scanned at boom barrier or turnstile (future integration)
- Pass shows: visitor name, photo, host, purpose, valid from–to, pass ID
- Guard can manually verify if QR scan fails
- Single-use pass; re-entry requires new scan or guard override

### 7.4 Host Notification & Approval

- Push notification + WhatsApp/SMS to host on visitor arrival
- Host approves or rejects with one tap (mobile-first UI)
- If host unreachable in 5 min → escalate to department secretary
- Host can add "escort required" flag for sensitive visits

### 7.5 Check-Out

- Guard scans QR at exit or manually marks departure
- System logs exit timestamp
- Gate pass invalidated post-checkout

### 7.6 Overstay Alerts

- If visitor has not checked out within permitted duration + 30 min buffer → SMS alert to host and security supervisor
- Dashboard flags active overstays in red

### 7.7 Blacklist Management

- Admin can add individuals to blacklist (name + ID number + reason)
- On registration, system cross-checks against blacklist
- Match → guard alerted immediately, entry blocked pending admin decision

### 7.8 Dashboard (Security & Admin)

- Live view: visitors currently on campus (name, host, location, time in)
- Today's summary: total entries, pending approvals, overstays, denied entries
- Search by name, ID, host, date, purpose
- Filter by gate, department, visitor type

### 7.9 Reports & Audit

- Exportable logs: CSV/PDF by date range, department, visitor type
- Automated daily summary emailed to Estate Office at 11 PM
- Audit trail: every action logged with user ID + timestamp (immutable)
- Retention: visitor data stored for 2 years per standard institutional policy

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Page load < 2 sec; gate pass generation < 5 sec |
| **Availability** | 99.5% uptime; offline mode for kiosk (local cache + sync on reconnect) |
| **Security** | Data encrypted at rest and in transit (AES-256, TLS 1.3); RBAC enforced |
| **Privacy** | ID scans stored securely; visible only to security and admin; PDPA-compliant |
| **Scalability** | Support up to 500 concurrent visitors; 1,000 registrations/day |
| **Usability** | Kiosk UI operable in < 4 taps for pre-registered visitor; Hindi + English support |
| **Accessibility** | WCAG 2.1 AA for web portal |

---

## 9. System Architecture (High Level)

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│  Web Portal (Host/Admin)  │  Kiosk App  │  Mobile App  │
└───────────────┬─────────────────────────────────────────┘
                │ HTTPS / REST API
┌───────────────▼─────────────────────────────────────────┐
│                   APPLICATION LAYER                     │
│   Auth (SSO)  │  Visit Engine  │  Notification Service │
│   Blacklist   │  Report Engine │  Audit Logger         │
└───────────────┬─────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────┐
│                     DATA LAYER                          │
│   PostgreSQL (visitor records)  │  Redis (sessions)     │
│   S3-compatible (ID scans)      │  Audit log (append-only)│
└─────────────────────────────────────────────────────────┘

Integrations: IIM-L SSO │ WhatsApp Business API │ SMS Gateway
```

---

## 10. User Flows

**Pre-registered Visitor**

`Host sends invite → Visitor receives QR → Arrives at gate → Guard scans QR → Auto-verified → Gate pass printed → Entry → Checkout scan`

**Walk-in Visitor**

`Arrives at gate → Kiosk OTP verification → ID capture → Host selected → Host notified → Host approves → Gate pass printed → Entry → Checkout scan`

**Denied Entry**

`Blacklist match OR Host rejects → Guard notified → Visitor declined → Incident logged`

---

## 11. Phased Rollout

| Phase | Timeline | Scope |
|---|---|---|
| **Phase 1 — Pilot** | Month 1–2 | Main Gate only; pre-registration + walk-in; manual checkout |
| **Phase 2 — Expand** | Month 3–4 | Academic Block gate; automated notifications; overstay alerts; dashboard live |
| **Phase 3 — Full** | Month 5–6 | All gates; blacklist; full reporting; QR boom barrier integration (if hardware ready) |

---

## 12. Assumptions & Dependencies

- IIM Lucknow SSO (LDAP/Active Directory) available for integration
- WhatsApp Business API account provisioned by IT
- Hardware: touch-screen kiosks and receipt printers to be procured by Estate Office
- Campus Wi-Fi coverage at all gate points (or 4G SIM fallback for kiosks)
- Legal clearance obtained for storing visitor ID scan data

---

## 13. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Guard resistance to digital system | Medium | Training sessions + simple UI; paper backup for first 30 days |
| Kiosk hardware failure | Medium | Offline mode; guard can register manually via tablet |
| WhatsApp API delays | Low | SMS as fallback; email as tertiary |
| Privacy concerns on ID storage | Low | Strict RBAC; data masked in UI; admin-only raw access |
| Low host adoption of pre-invite | Medium | Nudge emails; placement office mandates it for interview visitors |

---

## Appendix: Implementation Status (MVP)

This repository includes a Phase 1 MVP. See [README.md](../README.md) for setup, demo accounts, and feature coverage against this PRD.

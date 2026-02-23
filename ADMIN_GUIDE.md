# Admin Guide — Ates Barberos

## Overview

The admin panel is the central control hub for managing appointments, customers, services, working hours, and barber profiles. It is accessible at `/admin` after logging in.

---

## Navigation Tabs

| Tab | Icon | Purpose |
|-----|------|---------|
| **Calendar** | Calendar | View/manage all appointments and create new ones |
| **Customers** | Users | View, search, and edit customer profiles |
| **Services** | Scissors | Manage haircut/service offerings and prices |
| **Slots** | Clock | Configure working hours per barber per day |
| **Profile** | User Cog | Update admin account credentials |

---

## Appointment Flow

### How a Customer Appointment Works (Public Booking)

```
Customer fills out Home.vue form
  → selects barber, service, date, time
  → POST /api/appointments
  → status: "confirmed" immediately (slot is reserved on the spot)
  → email sent to customer: "confirmation" + 30min reminder scheduled
  → email sent to barber: "booking confirmed"
```

> **Note:** The `pending` status only exists as a legacy/manual override — it is only set if the request body explicitly includes `status: "pending"`. Under normal operation (both customer and admin bookings), appointments are confirmed immediately.

### How an Admin Appointment Works

```
Admin opens booking modal (+ button or "Book Appointment")
  → selects mode: Appointment or Block Time
  → sets barber, date/time range
  → optionally selects service and customer
  → POST /api/appointments (with JWT)
  → status: "confirmed" immediately (no pending)
  → email sent if customer email is provided
```

---

## Calendar Tab

### Two View Modes

- **Month Calendar** — overview with appointment count dots per day. Click a day to open the detail popup.
- **Day View** — hourly timeline for a selected date, showing each appointment as a block spanning its full duration. Toggle with the view button in the header.

### Creating an Appointment (Admin)

Click the **+ Book Appointment** button to open the booking modal.

#### Mode: Appointment

Used for booking a real customer appointment.

| Field | Required | Notes |
|-------|----------|-------|
| From (date + time) | Yes | Start of appointment |
| To (date + time) | No | End time — if set, determines calendar block size; if omitted with a service selected, service duration is used |
| Service | No | Selecting a service auto-fills price and end time |
| Customer (search) | No | Type to search existing customers — auto-fills name/phone/email |
| Customer Name | No | Required for public bookings, optional for admin |
| Phone | No | Same as above |
| Email | No | If provided, confirmation email is sent |

**Key behaviour:** The admin bypasses working-hour restrictions and past-date restrictions. Overlap with existing appointments is still blocked.

#### Mode: Block Time

Used to block a time range (break, lunch, holiday, etc.) — no customer or service needed.

| Field | Required | Notes |
|-------|----------|-------|
| From (date + time) | Yes | Start of block |
| To (date + time) | Yes | End of block (mandatory) |
| Label | No | Short note shown in calendar (e.g. "Lunch", "Break") |

Block time creates an `isBlock: true` appointment. It appears in the calendar with a distinct style and prevents customer bookings from landing in that slot.

**Multi-day block:** If From date ≠ To date, a separate block entry is created for each day in the range.

---

## Appointment Statuses

| Status | Colour | Meaning |
|--------|--------|---------|
| `confirmed` | Green | Default state — all new bookings (customer or admin) start here |
| `completed` | Blue/Grey | Service done |
| `cancelled` | Red/Strikethrough | Cancelled by admin or customer |
| `pending` | Yellow | Manual override only — not used in normal flow |

### Status Transitions (Admin Actions)

- **Cancel** → sends rejection email to customer; cancels any scheduled reminder emails.
- **Mark as Completed** → sends completion email to customer and barber.
- **Reschedule** (change time) → if email option is checked, sends time-change notification to both customer and barber.

---

## Conflict Detection

The system prevents double-booking automatically:

- **Public customers** can only pick pre-validated 30-minute boundary slots.
- **Admin** can pick any time but is still blocked if the new slot **overlaps** an existing pending/confirmed/completed appointment.
- When confirming a pending appointment, the backend re-checks for overlaps against all other confirmed appointments.

---

## Customers Tab

- **Search** customers by name, phone, or email.
- **View** booking history (total bookings, last appointment date).
- **Edit** name, phone, email, notes, and marketing opt-in.
- **Add** a new customer manually.
- Customer records are **auto-created/updated** whenever an appointment is booked with their phone number.

---

## Services Tab

- **Add** a new service: name, duration (minutes), price.
- **Edit** an existing service inline.
- **Deactivate** a service — it is hidden from the public booking page but existing appointments are unaffected.
- Service duration directly controls how many calendar slots an appointment occupies when selected in the booking modal.

---

## Slots Tab (Working Hours)

Configure when each barber is available, per day of the week.

- Select a barber and a day.
- Set start time and end time.
- Mark the day as available or unavailable.
- Public customers can only book within these hours. Admin ignores these restrictions.

---

## Restrictions (Off Dates)

From the Calendar view, toggle the **off-date switch** on a selected date to mark it as unavailable.

- Off dates block all public bookings for that day (API returns empty availability).
- The admin can still manually create appointments on off dates.

---

## Email Notifications Summary

| Trigger | Recipient(s) |
|---------|-------------|
| Customer books online | Customer ("confirmation") + Barber ("booking confirmed") + 30min reminder to both |
| Admin creates appointment | Customer ("confirmation") + Barber ("booking confirmed") + 30min reminder (if email provided) |
| Admin cancels | Customer ("rejection") |
| Admin marks completed | Customer + Barber ("completion") |
| Time is changed | Customer + Barber ("time change") — only if checkbox is ticked |
| Customer cancels via email link | Barber notified; reminder emails cancelled |

Emails are only sent if the Resend API key is configured in the backend `.env`.

---

## Profile Tab

- Change the admin **username** and/or **password**.
- JWT token has a 24-hour TTL — after expiry the admin is automatically redirected to the login page.

---

## Technical Notes for Admins

- **Duration is derived from end time** when no service is selected. Set the "To" time to control how long the block appears in the calendar.
- **Timezone:** The system runs on German time (Europe/Berlin). All dates displayed and stored are normalized to midnight German time.
- **Default admin credentials** (first run only): username `admin`, password `admin` — change these immediately after setup via the Profile tab.

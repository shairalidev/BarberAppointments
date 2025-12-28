# Notification System - Quick Reference

## 📊 Notification Matrix

| Notification | Who Sends To | When | Automatic? | Status |
|-------------|--------------|------|-----------|--------|
| Booking Received | Customer | Immediately on booking | ✅ Yes | ✅ Working |
| New Booking Alert | Barber | Immediately on booking | ✅ Yes | ✅ Working |
| Confirmation | Customer | When admin accepts | ⚠️ Conditional* | ✅ Working (via respond modal) |
| Booking Confirmed | Barber | When admin accepts | ⚠️ Conditional* | ✅ Working (via respond modal) |
| 30-min Reminder | Customer | 30 min before appointment | ✅ Yes | ✅ Working |
| 30-min Reminder | Barber | 30 min before appointment | ✅ Yes | ✅ Working |
| Completion | Customer | When admin marks complete | ⚠️ Conditional* | ❌ **NOT WORKING** |
| Completion | Barber | When admin marks complete | ⚠️ Conditional* | ❌ **NOT WORKING** |
| Rejection | Customer | When admin rejects | ⚠️ Conditional* | ✅ Working (via respond modal) |

*Conditional = Only sent if `sendEmail: true` is included in the API request

---

## 🔄 Complete Appointment Lifecycle

```
1. Customer Books
   ↓
   📧 Customer: "Booking Received" (IMMEDIATE - AUTO)
   📧 Barber: "New Booking Alert" (IMMEDIATE - AUTO)
   
2. Admin Reviews (Status: pending)
   
3a. Admin Accepts
    ↓
    📧 Customer: "Confirmation" (IMMEDIATE - MANUAL*)
    📧 Barber: "Booking Confirmed" (IMMEDIATE - MANUAL*)
    📅 Schedule: 30-min reminders (AUTO)
    ↓
    ⏰ 30 Minutes Before Appointment
    📧 Customer: "30-min Reminder" (AUTO)
    📧 Barber: "30-min Reminder" (AUTO)
    ↓
    Appointment Happens
    ↓
    Admin Marks Complete
    ↓
    📧 Customer: "Completion" (IMMEDIATE - MANUAL* - ❌ BUG)
    📧 Barber: "Completion" (IMMEDIATE - MANUAL* - ❌ BUG)

3b. Admin Rejects
    ↓
    📧 Customer: "Rejection" (IMMEDIATE - MANUAL*)
    🚫 Cancel scheduled reminders
```

---

## ⚡ Email Scheduler Details

- **Check Interval**: Every 30 seconds
- **Processing**: Automatically processes queued emails
- **Retry Logic**: Up to 3 attempts
- **Status**: Starts automatically when server starts

---

## 🐛 Known Issues

1. **Completion emails not sent** when using "Complete" button in admin panel
   - Use: The completion action doesn't include `sendEmail: true`
   - Fix: Update `updateAppointmentStatus()` to include email flag

2. **Some status changes don't trigger emails** when using confirm modal
   - Only works correctly via "Respond" modal (accept/reject)
   - "Complete" button doesn't send emails

---

## ✅ What's Working Well

- ✅ Immediate booking notifications (customer & barber)
- ✅ 30-minute reminder system (automatic, reliable)
- ✅ Email queue system with retry logic
- ✅ Accept/Reject via respond modal sends emails correctly
- ✅ Email service configuration checks
- ✅ Error handling and logging

---

*Quick reference for Barber Appointment System notifications*

# Barber Appointment System - Functionality & Flow

## 🎯 App Overview

A barber shop appointment booking system with customer-facing booking and admin management panel.

---

## 📱 Customer Booking Flow

### **Step 1: Visit Website**
- Customer visits the booking page
- Views available services and pricing

### **Step 2: Select Services**
- Choose one or multiple services
- See total price and duration calculated automatically
- Proceed to date/time selection

### **Step 3: Choose Date & Time**
- Select barber (if multiple available)
- Pick date from calendar
- Choose available time slot
- System shows only available slots based on:
  - Barber working hours
  - Existing appointments
  - Service duration

### **Step 4: Enter Details**
- Enter name, phone number, email (optional)
- Add notes (optional)
- Submit booking request

### **Step 5: Confirmation**
- Booking request created (status: pending)
- Customer receives email: "Booking received, waiting for confirmation"
- Barber receives email: "New booking request"

---

## 👨‍💼 Admin Operations

### **1. Dashboard & Calendar**
- View all appointments in calendar view
- See appointments by date
- Quick overview of daily schedule

### **2. Appointment Management**

#### **View Appointments**
- Filter by status: pending, confirmed, completed, cancelled
- View appointment details (customer, services, time, notes)

#### **Accept/Reject Requests**
- Accept pending appointment → Status changes to "confirmed"
  - Customer receives confirmation email
  - Barber receives confirmation notification
  - 30-minute reminders scheduled automatically

- Reject pending appointment → Status changes to "cancelled"
  - Customer receives rejection email
  - Scheduled reminders cancelled

#### **Mark as Completed**
- Mark confirmed appointment as completed
  - Customer receives completion email
  - Barber receives completion notification

#### **Quick Book Appointment**
- Admin can create appointments directly
- Select date, time, services, customer details
- Appointment created with "confirmed" status

### **3. Service Management**
- **View Services**: See all available services
- **Add Service**: Create new service (name, price, duration, description)
- **Edit Service**: Update service details
- **Delete Service**: Remove service from system

### **4. Time Slot Management (Working Hours)**
- **View Weekly Schedule**: See working hours for each day
- **Add Time Slots**: Set start/end times for each day
- **Delete Time Slots**: Remove working hours for specific days
- System uses these hours to calculate available booking times

### **5. Customer Management**
- **View Customers**: See all customers who have booked
- **View Customer History**: See all appointments for a customer
- **Search Customers**: Filter by name or phone
- **View Customer Details**: Name, phone, email, booking count

### **6. Profile Settings**
- **Barber Profile**: Update name, email, phone, specialties, bio
- **Admin Profile**: Update admin name, email, change password
- **Language Toggle**: Switch between English and German
- **Theme Toggle**: Switch between light and dark mode

---

## 🔄 Complete Booking Lifecycle

```
1. Customer Books
   ↓ Status: pending
   ↓ Email: Customer & Barber notified

2. Admin Reviews
   ↓ Admin sees in "Requests" tab

3. Admin Accepts
   ↓ Status: confirmed
   ↓ Email: Confirmation sent to customer & barber
   ↓ 30-minute reminders scheduled

4. Appointment Day
   ↓ 30 minutes before: Reminder emails sent
   ↓ Appointment happens

5. Admin Marks Complete
   ↓ Status: completed
   ↓ Email: Completion sent to customer & barber
```

---

## ⚙️ System Features

### **Automatic Features**
- ✅ Real-time availability checking
- ✅ Automatic email notifications
- ✅ 30-minute reminder emails (automatic)
- ✅ Previous day cleanup (automatic at midnight)
- ✅ Conflict detection (prevents double booking)

### **Email Notifications**
- Customer booking received
- Barber new booking alert
- Appointment confirmation (customer & barber)
- 30-minute reminders (customer & barber)
- Appointment completion (customer & barber)
- Appointment rejection

### **Time Management**
- All times use German timezone (CET/CEST)
- Calendar shows only current and future appointments
- Previous day appointments automatically deleted at midnight
- Working hours configurable per day

### **Security**
- Admin login required for management
- JWT token authentication
- Protected admin routes

---

## 📊 Admin Tabs Overview

1. **Calendar** - View appointments in calendar format
2. **Requests** - Pending appointments needing approval
3. **Customers** - Customer database and history
4. **Services** - Manage service offerings
5. **Time Slots** - Manage working hours
6. **Profile** - Barber and admin settings

---

## 🎨 User Interface Features

- Responsive design (mobile-friendly)
- Dark/Light theme toggle
- English/German language support
- Real-time updates
- Toast notifications for actions
- Loading states
- Empty states with helpful messages

---

## 🔧 Key System Operations

### **Booking Availability**
- Calculates available slots based on:
  - Selected services duration
  - Barber working hours
  - Existing appointments
  - Time slot conflicts

### **Appointment Statuses**
- **pending**: Waiting for admin approval
- **confirmed**: Approved and scheduled
- **completed**: Service finished
- **cancelled**: Rejected or cancelled

### **Data Cleanup**
- Automatic cleanup runs daily at midnight (German time)
- Deletes all appointments from previous days
- Keeps calendar clean with only current/future appointments

---

*Simple and straightforward booking system for barber shops*





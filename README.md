# BarberPro - Professional Barber Appointments System

A modern, full-stack web application for managing barber appointments with professional UI/UX, admin authentication, and comprehensive management features.

## ✨ Features

### Customer Features
- **Professional Booking Flow**: 3-step booking process with service selection, date/time picker, and customer details
- **Real-time Availability**: Dynamic time slot availability based on selected services and barber
- **Responsive Design**: Mobile-first design with Bootstrap 5 and custom animations
- **Service Selection**: Multiple service selection with pricing and duration display
- **Interactive Calendar**: Week view calendar with intuitive date selection

### Admin Features
- **Secure Authentication**: JWT-based admin login system
- **Dashboard Overview**: Statistics cards showing today's appointments, available barbers, and pending bookings
- **Appointment Management**: View, filter, and update appointment statuses
- **Service Management**: Add, edit, and delete services with pricing and duration
- **Barber Management**: Manage barber profiles and availability
- **Time Slot Management**: Configure weekly time slots for each barber
- **Professional UI**: Modern admin panel with sidebar navigation and animations

## 🚀 Tech Stack
- **Frontend**: Vue.js 3, Vue Router, Bootstrap 5, Axios, Font Awesome
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Database**: MongoDB
- **Authentication**: JWT tokens with secure password hashing

## 📁 Project Structure
```
BarberAppointments/
├── frontend/              # Vue.js application
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, LoginModal, Toast)
│   │   ├── views/         # Page components (Home, Appointments, Admin)
│   │   ├── utils/         # Authentication utilities
│   │   └── router/        # Vue Router configuration
├── backend/               # Node.js API server
│   ├── models/           # MongoDB models (Admin, Appointment, Barber, Service)
│   ├── routes/           # API routes with authentication
│   └── server.js         # Express server configuration
├── setup.bat             # Initial setup script
├── setup-admin.bat       # Admin user setup script
├── start-backend.bat     # Backend start script
└── start-frontend.bat    # Frontend start script
```

## 🛠️ Quick Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation
1. **Run the main setup script**:
   ```bash
   setup.bat
   ```

2. **Setup admin user** (run after starting the backend):
   ```bash
   setup-admin.bat
   ```

### Manual Setup
1. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

### Environment Configuration

**Backend (.env)**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barber_appointments
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Frontend (.env)**:
```env
VUE_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Option 1: Use batch files (Recommended)
1. Start backend: `start-backend.bat`
2. Start frontend: `start-frontend.bat`
3. Setup admin: `setup-admin.bat` (first time only)

### Option 2: Manual start
1. **Start MongoDB service**
2. **Start backend server**:
   ```bash
   cd backend
   npm run dev
   ```
3. **Start frontend server**:
   ```bash
   cd frontend
   npm run serve
   ```

## 🌐 Access the Application
- **Customer Interface**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Backend API**: http://localhost:5000/api

## 🔐 Admin Access
**Default Admin Credentials**:
- Username: `admin`
- Password: `admin`

⚠️ **Important**: Change these credentials immediately after first login!

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/setup` - Create default admin (first time setup)

### Public Endpoints (No Auth Required)
- `GET /api/services/public` - Get all services for booking
- `GET /api/barbers/public` - Get available barbers for booking
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/availability` - Check time slot availability

### Protected Admin Endpoints (Auth Required)
- `GET /api/appointments` - Get all appointments
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/barbers` - Get all barbers
- `POST /api/barbers` - Create new barber
- `PUT /api/barbers/:id` - Update barber
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/timeslots` - Get all time slots
- `POST /api/timeslots` - Create new time slot
- `DELETE /api/timeslots/:id` - Delete time slot

## 🎨 UI/UX Features

### Professional Design Elements
- **Gradient Backgrounds**: Modern gradient designs throughout the application
- **Smooth Animations**: CSS transitions and hover effects
- **Professional Typography**: Inter font family with proper font weights
- **Consistent Color Scheme**: Blue primary color with proper contrast ratios
- **Responsive Layout**: Mobile-first design that works on all devices
- **Interactive Elements**: Hover states, focus indicators, and loading states

### Admin Panel Features
- **Dashboard Statistics**: Real-time overview of business metrics
- **Sidebar Navigation**: Easy access to all admin functions
- **Data Tables**: Sortable and filterable appointment listings
- **Form Modals**: Professional forms for adding/editing data
- **Status Management**: Visual status indicators with color coding
- **Quick Actions**: Shortcut buttons for common tasks

## 🔧 Development

### Adding New Services
```javascript
// Example service object
{
  "name": "Premium Haircut",
  "description": "Professional haircut with styling",
  "duration": 45,
  "price": 35.00
}
```

### Adding New Barbers
```javascript
// Example barber object
{
  "name": "John Smith",
  "specialties": ["Haircut", "Beard Trim", "Hair Styling"],
  "available": true
}
```

## 🛡️ Security Features
- JWT token-based authentication
- Password hashing with bcryptjs
- Protected admin routes
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📱 Mobile Responsiveness
- Mobile-first responsive design
- Touch-friendly interface elements
- Optimized booking flow for mobile devices
- Collapsible navigation menu
- Responsive admin panel

## 🚀 Future Enhancements
- Email notifications for appointments
- SMS reminders
- Payment integration
- Customer accounts and history
- Advanced reporting and analytics
- Multi-location support
- Online reviews and ratings

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

---

**BarberPro** - Elevating the barber shop experience with modern technology! 💈✨
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Barber = require('./models/Barber');
const Service = require('./models/Service');
const TimeSlot = require('./models/TimeSlot');
const Appointment = require('./models/Appointment');

async function professionalSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear all existing data
    console.log('🧹 Cleaning database...');
    await Admin.deleteMany({});
    await Barber.deleteMany({});
    await Service.deleteMany({});
    await TimeSlot.deleteMany({});
    await Appointment.deleteMany({});
    console.log('✅ Database cleaned');

    // Create Admin User (Shair Ali Barber)
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin', 10);
    const admin = await Admin.create({
      username: 'admin',
      password: hashedPassword,
      name: 'Shair Ali Barber',
      email: 'shair.ali@barberpro.com'
    });
    console.log('✅ Admin user created:', admin.name);

    // Create Barber Profile (Same person as admin)
    console.log('💈 Creating barber profile...');
    const barber = await Barber.create({
      name: 'Shair Ali Barber',
      email: 'shair.ali@barberpro.com',
      phone: '+1-555-0123',
      bio: 'Master barber with 15+ years of experience. Specializing in modern cuts, classic styles, and premium grooming services.',
      specialties: [
        'Classic Haircuts',
        'Modern Styling',
        'Beard Grooming',
        'Hot Towel Shaves',
        'Hair Treatments',
        'Wedding Grooming',
        'Corporate Styling'
      ],
      available: true
    });
    console.log('✅ Barber profile created:', barber.name);

    // Create Comprehensive Services
    console.log('✂️ Creating services...');
    const services = await Service.insertMany([
      // Hair Services
      { name: 'Classic Haircut', description: 'Traditional scissor cut with styling', duration: 30, price: 35 },
      { name: 'Premium Haircut & Style', description: 'Luxury cut with wash, style, and finishing', duration: 45, price: 55 },
      { name: 'Buzz Cut', description: 'Clean, professional buzz cut', duration: 15, price: 20 },
      { name: 'Fade Cut', description: 'Modern fade with precision blending', duration: 40, price: 45 },
      { name: 'Scissor Cut & Style', description: 'Detailed scissor work with professional styling', duration: 50, price: 60 },
      
      // Beard Services
      { name: 'Beard Trim & Shape', description: 'Professional beard trimming and shaping', duration: 20, price: 25 },
      { name: 'Full Beard Grooming', description: 'Complete beard care with oils and styling', duration: 30, price: 40 },
      { name: 'Mustache Trim', description: 'Precision mustache trimming', duration: 10, price: 15 },
      
      // Shaving Services
      { name: 'Hot Towel Shave', description: 'Traditional hot towel straight razor shave', duration: 45, price: 50 },
      { name: 'Head Shave', description: 'Complete head shave with hot towel treatment', duration: 35, price: 45 },
      
      // Combo Services
      { name: 'The Complete Gentleman', description: 'Haircut, beard trim, and hot towel shave', duration: 75, price: 85 },
      { name: 'Hair & Beard Combo', description: 'Haircut with beard trimming and styling', duration: 50, price: 65 },
      { name: 'Quick Touch-Up', description: 'Fast trim and style for maintenance', duration: 20, price: 30 },
      
      // Premium Services
      { name: 'Wedding Grooming Package', description: 'Complete grooming for your special day', duration: 90, price: 120 },
      { name: 'Executive Package', description: 'Premium cut, shave, and grooming for professionals', duration: 60, price: 80 },
      { name: 'Hair Treatment & Cut', description: 'Nourishing treatment followed by precision cut', duration: 70, price: 90 },
      
      // Additional Services
      { name: 'Eyebrow Trim', description: 'Professional eyebrow grooming', duration: 15, price: 20 },
      { name: 'Nose/Ear Hair Trim', description: 'Clean grooming of unwanted hair', duration: 10, price: 15 },
      { name: 'Hair Wash & Style', description: 'Professional wash and styling only', duration: 25, price: 25 },
      { name: 'Consultation', description: 'Style consultation and recommendations', duration: 15, price: 0 }
    ]);
    console.log('✅ Services created:', services.length);

    // Create Time Slots (Monday to Saturday)
    console.log('⏰ Creating time slots...');
    const timeSlots = [];
    
    // Monday to Friday: 8:00 AM - 7:00 PM
    for (let day = 1; day <= 5; day++) {
      timeSlots.push({
        barberId: barber._id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '19:00',
        isAvailable: true
      });
    }
    
    // Saturday: 8:00 AM - 5:00 PM
    timeSlots.push({
      barberId: barber._id,
      dayOfWeek: 6,
      startTime: '08:00',
      endTime: '17:00',
      isAvailable: true
    });
    
    await TimeSlot.insertMany(timeSlots);
    console.log('✅ Time slots created:', timeSlots.length);

    // Create Sample Appointments
    console.log('📅 Creating sample appointments...');
    const today = new Date();
    const appointments = [];
    
    // Get some services for appointments
    const haircut = services.find(s => s.name === 'Classic Haircut');
    const beardTrim = services.find(s => s.name === 'Beard Trim & Shape');
    const premiumCut = services.find(s => s.name === 'Premium Haircut & Style');
    const combo = services.find(s => s.name === 'Hair & Beard Combo');
    
    // Create appointments for the next few days
    for (let i = 1; i <= 7; i++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + i);
      
      // Skip Sundays (day 0)
      if (appointmentDate.getDay() === 0) continue;
      
      // Create 2-3 appointments per day
      const dailyAppointments = [
        {
          customerName: 'John Smith',
          customerPhone: '+1-555-0101',
          customerEmail: 'john.smith@email.com',
          notes: 'Regular customer, prefers short on sides',
          barberId: barber._id,
          services: [haircut._id],
          totalPrice: haircut.price,
          totalDuration: haircut.duration,
          date: appointmentDate,
          time: '09:00',
          status: i <= 2 ? 'confirmed' : 'pending'
        },
        {
          customerName: 'Michael Johnson',
          customerPhone: '+1-555-0102',
          customerEmail: 'mike.johnson@email.com',
          notes: 'First time customer',
          barberId: barber._id,
          services: [combo._id],
          totalPrice: combo.price,
          totalDuration: combo.duration,
          date: appointmentDate,
          time: '11:00',
          status: i <= 3 ? 'confirmed' : 'pending'
        },
        {
          customerName: 'David Wilson',
          customerPhone: '+1-555-0103',
          customerEmail: 'david.wilson@email.com',
          notes: 'Business professional, needs clean look',
          barberId: barber._id,
          services: [premiumCut._id, beardTrim._id],
          totalPrice: premiumCut.price + beardTrim.price,
          totalDuration: premiumCut.duration + beardTrim.duration,
          date: appointmentDate,
          time: '14:30',
          status: i <= 1 ? 'completed' : i <= 4 ? 'confirmed' : 'pending'
        }
      ];
      
      appointments.push(...dailyAppointments);
    }
    
    // Add some past appointments (completed)
    for (let i = 1; i <= 3; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      
      appointments.push({
        customerName: `Customer ${i}`,
        customerPhone: `+1-555-010${i + 3}`,
        customerEmail: `customer${i}@email.com`,
        barberId: barber._id,
        services: [haircut._id],
        totalPrice: haircut.price,
        totalDuration: haircut.duration,
        date: pastDate,
        time: '10:00',
        status: 'completed'
      });
    }
    
    await Appointment.insertMany(appointments);
    console.log('✅ Sample appointments created:', appointments.length);

    // Summary
    console.log('\n🎉 Professional seed data completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👤 Admin: ${admin.name} (username: admin, password: admin)`);
    console.log(`   💈 Barber: ${barber.name}`);
    console.log(`   ✂️ Services: ${services.length} professional services`);
    console.log(`   ⏰ Time Slots: ${timeSlots.length} weekly slots`);
    console.log(`   📅 Appointments: ${appointments.length} sample appointments`);
    console.log('\n🔗 Access:');
    console.log('   🌐 Customer Booking: http://localhost:3000');
    console.log('   🔧 Admin Panel: http://localhost:3000/admin');
    console.log('   📧 Admin Login: admin / admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

professionalSeed();
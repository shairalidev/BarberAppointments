require('dotenv').config();
const mongoose = require('mongoose');
const Barber = require('./models/Barber');
const Service = require('./models/Service');
const TimeSlot = require('./models/TimeSlot');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Barber.deleteMany({});
    await Service.deleteMany({});
    await TimeSlot.deleteMany({});

    // Create services
    const services = await Service.insertMany([
      { name: 'Classic Haircut', description: 'Professional haircut with styling', duration: 30, price: 30 },
      { name: 'Beard Trim & Shape', description: 'Precision beard trimming and shaping', duration: 20, price: 20 },
      { name: 'Hair & Beard Combo', description: 'Complete grooming package', duration: 45, price: 45 },
      { name: 'Premium Cut & Style', description: 'Luxury haircut with wash and style', duration: 60, price: 60 },
      { name: 'Quick Trim', description: 'Basic hair trim', duration: 15, price: 15 }
    ]);
    console.log('Services created:', services.length);

    // Create primary barber
    const barbers = await Barber.insertMany([
      { name: 'Master Barber', specialties: ['Haircut', 'Beard Trim', 'Hair Styling', 'Shave'], available: true }
    ]);
    console.log('Barbers created:', barbers.length);

    // Create time slots for the primary barber (Mon-Sat)
    const timeSlots = [];
    const primaryBarber = barbers[0];
    
    // Monday to Friday: 9AM-6PM
    for (let day = 1; day <= 5; day++) {
      timeSlots.push({
        barberId: primaryBarber._id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true
      });
    }
    
    // Saturday: 9AM-4PM
    timeSlots.push({
      barberId: primaryBarber._id,
      dayOfWeek: 6,
      startTime: '09:00',
      endTime: '16:00',
      isAvailable: true
    });
    await TimeSlot.insertMany(timeSlots);
    console.log('Time slots created:', timeSlots.length);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData();

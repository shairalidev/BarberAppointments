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
      { name: 'Haircut', description: 'Professional haircut', duration: 30, price: 25 },
      { name: 'Beard Trim', description: 'Beard styling and trim', duration: 15, price: 15 },
      { name: 'Hair & Beard Combo', description: 'Complete grooming package', duration: 45, price: 35 }
    ]);
    console.log('Services created:', services.length);

    // Create barbers
    const barbers = await Barber.insertMany([
      { name: 'John Smith', specialties: ['Haircut', 'Beard Trim'], available: true },
      { name: 'Mike Johnson', specialties: ['Haircut', 'Hair Styling'], available: true }
    ]);
    console.log('Barbers created:', barbers.length);

    // Create time slots for each barber (Mon-Fri, 9AM-5PM)
    const timeSlots = [];
    for (const barber of barbers) {
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        timeSlots.push({
          barberId: barber._id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true
        });
      }
    }
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

const express = require('express')
const Customer = require('../models/Customer')
const Appointment = require('../models/Appointment')

const router = express.Router()

// Helper to refresh customer stats
const refreshCustomerStats = async (customerId) => {
  const totalBookings = await Appointment.countDocuments({ customer: customerId })
  const lastAppointment = await Appointment.findOne({ customer: customerId }).sort({ date: -1 })

  await Customer.findByIdAndUpdate(customerId, {
    totalBookings,
    lastAppointmentDate: lastAppointment?.date
  })
}

// List customers with optional search
router.get('/', async (req, res) => {
  try {
    const { q } = req.query
    const query = {}

    if (q) {
      query.$text = { $search: q }
    }

    const customers = await Customer.find(query).sort({ updatedAt: -1 })
    res.json(customers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, notes, marketingOptIn = true } = req.body

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' })
    }

    const existing = await Customer.findOne({ phone })
    if (existing) {
      return res.status(409).json({ message: 'Customer with this phone already exists', customer: existing })
    }

    const customer = new Customer({ name, phone, email, notes, marketingOptIn })
    const saved = await customer.save()
    res.status(201).json(saved)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, notes, marketingOptIn } = req.body
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, notes, marketingOptIn },
      { new: true, runValidators: true }
    )

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    await refreshCustomerStats(customer._id)
    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id)
    res.json({ message: 'Customer removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router

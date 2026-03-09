const express = require('express');
const { Webhook } = require('svix');
const EmailOptOut = require('../models/EmailOptOut');

const router = express.Router();

// POST /api/webhooks/email
// Receives bounce/complaint events from Resend and records opt-outs.
// Raw body is required for svix signature verification — see server.js mounting.
router.post('/email', async (req, res) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[emailWebhooks] RESEND_WEBHOOK_SECRET not set — rejecting webhook');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const headers = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  };

  let event;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(req.body, headers);
  } catch (err) {
    console.warn('[emailWebhooks] Invalid webhook signature:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { type, data } = event;

  if (type === 'email.bounced' || type === 'email.complained') {
    const reason = type === 'email.bounced' ? 'bounced' : 'complained';
    const email = (data?.to?.[0] || data?.to || '').toLowerCase().trim();

    if (!email) {
      console.warn('[emailWebhooks] Webhook event missing recipient email:', event);
      return res.status(200).json({ received: true });
    }

    try {
      await EmailOptOut.findOneAndUpdate(
        { email },
        { email, reason },
        { upsert: true, new: true }
      );
      console.log(`[emailWebhooks] Opted out ${email} (${reason})`);
    } catch (err) {
      console.error('[emailWebhooks] Failed to save opt-out:', err.message);
      // Still return 200 so Resend doesn't keep retrying
    }
  }

  return res.status(200).json({ received: true });
});

module.exports = router;

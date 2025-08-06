import { Payment } from '../models/Payment.js';
import { Applicant } from '../models/Applicant.js';
import { User } from '../models/User.js';
import { sendPaymentEmail } from '../utils/sendPaymentEmail.js';

// Get all payments with applicant populated and support applicant filtering
export const getPayments = async (req, res, next) => {
  try {
    // NEW: filter payments by applicant if query param exists
    const filter = {};
    if (req.query.applicant) {
      filter.applicant = req.query.applicant;
    }
    const payments = await Payment.find(filter).populate('applicant');
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

// Create payment
export const createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment); // ✅ respond first

    try {
      const applicant = await Applicant.findById(payment.applicant).populate('agent');
      const superusers = await User.find({ role: 'superuser' });

      const mailOpts = { from: process.env.PAYMENT_SMTP_USER, usePayment: true };

      // Email to Applicant
      if (applicant?.email) {
        await sendPaymentEmail(
          applicant.email,
          'Payment Received',
          `<p>Dear ${applicant.name},</p><p>Your payment of <b>${payment.amount}</b> for <b>${payment.reference}</b> has been recorded.</p>`,
          mailOpts
        );
      }

      // Email to Agent
      if (applicant.agent?.email) {
        await sendPaymentEmail(
          applicant.agent.email,
          `Payment from ${applicant.name}`,
          `<p>Your applicant <b>${applicant.name}</b> has made a payment of <b>${payment.amount}</b> for <b>${payment.reference}</b>.</p>`,
          mailOpts
        );
      }

      // Email to Superusers
      for (const su of superusers) {
        await sendPaymentEmail(
          su.email,
          'New Payment Recorded',
          `<p>A payment of <b>${payment.amount}</b> for <b>${payment.reference}</b> was recorded for applicant <b>${applicant.name}</b>.</p>`,
          mailOpts
        );
      }

    } catch (mailErr) {
      console.error("Email failed (createPayment):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Update payment
export const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment); // ✅ respond first

    try {
      const applicant = await Applicant.findById(payment.applicant).populate('agent');
      const superusers = await User.find({ role: 'superuser' });

      const mailOpts = { from: process.env.PAYMENT_SMTP_USER, usePayment: true };

      // Email to Applicant
      if (applicant?.email) {
        await sendPaymentEmail(
          applicant.email,
          'Payment Updated',
          `<p>Dear ${applicant.name},</p><p>Your payment has been updated.<br>Amount: <b>${payment.amount}</b><br>Purpose: <b>${payment.reference}</b></p>`,
          mailOpts
        );
      }

      // Email to Agent
      if (applicant.agent?.email) {
        await sendPaymentEmail(
          applicant.agent.email,
          `Payment Update: ${applicant.name}`,
          `<p>The payment record of <b>${applicant.name}</b> has been updated.<br>Amount: <b>${payment.amount}</b><br>Purpose: <b>${payment.reference}</b></p>`,
          mailOpts
        );
      }

      // Email to Superusers
      for (const su of superusers) {
        await sendPaymentEmail(
          su.email,
          'Payment Record Updated',
          `<p>The payment for applicant <b>${applicant.name}</b> has been updated.<br>Amount: <b>${payment.amount}</b><br>Purpose: <b>${payment.reference}</b></p>`,
          mailOpts
        );
      }

    } catch (mailErr) {
      console.error("Email failed (updatePayment):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Delete payment
export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' }); // ✅ respond first

    try {
      const applicant = await Applicant.findById(payment.applicant);
      const superusers = await User.find({ role: 'superuser' });

      const mailOpts = { from: process.env.PAYMENT_SMTP_USER, usePayment: true };

      for (const su of superusers) {
        await sendPaymentEmail(
          su.email,
          'Payment Deleted',
          `<p>The payment for applicant <b>${applicant?.name || '(unknown)'}</b> has been deleted from the system.</p>`,
          mailOpts
        );
      }

    } catch (mailErr) {
      console.error("Email failed (deletePayment):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

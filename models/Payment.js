import mongoose from 'mongoose';
import Activity from './Activity.js';
import { Applicant } from './Applicant.js'; // <-- Corrected named import

const paymentSchema = new mongoose.Schema({
  applicant:  { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  amount:     { type: Number, required: true },
  paid:       { type: Boolean, default: false },
  method:     { type: String },
  reference:  { type: String },
  date:       { type: Date, default: Date.now }
}, { timestamps: true });

// Helper for distinguishing create vs update
paymentSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
});

// Log create and update
paymentSchema.post('save', async function(doc) {
  try {
    const isNew = doc.wasNew !== false;
    const applicantDoc = await Applicant.findById(doc.applicant).select('name');
    const applicantName = applicantDoc ? applicantDoc.name : doc.applicant;
    await Activity.create({
      action: isNew ? 'Payment Added' : 'Payment Updated',
      description: isNew
        ? `Payment of Rs. ${doc.amount} was added for applicant ${applicantName}.`
        : `Payment of Rs. ${doc.amount} for applicant ${applicantName} was updated.`,
      date: new Date(),
      user: null // req.user not available here
    });
  } catch (e) {
    console.error('Activity log error (payment):', e);
  }
});

// Log delete
paymentSchema.post('remove', async function(doc) {
  try {
    const applicantDoc = await Applicant.findById(doc.applicant).select('name');
    const applicantName = applicantDoc ? applicantDoc.name : doc.applicant;
    await Activity.create({
      action: 'Payment Deleted',
      description: `Payment of Rs. ${doc.amount} for applicant ${applicantName} was deleted.`,
      date: new Date(),
      user: null
    });
  } catch (e) {
    console.error('Activity log error (payment):', e);
  }
});

export const Payment = mongoose.model('Payment', paymentSchema);

import mongoose from 'mongoose';
import Activity from './Activity.js';
import { Applicant } from './Applicant.js'; // For getting applicant name

const recordSchema = new mongoose.Schema({
  applicant:  { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  type:       { type: String, required: true }, // e.g. 'PCC', 'Visa', etc.
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt:   { type: Date },
  physical:  { type: Date },
  appointment:   { type: Date },
  progressStatus:{type: String},
  notes:      { type: String }
}, { timestamps: true });

// Helper to distinguish create vs update
recordSchema.pre('save', async function(next) {
  this.wasNew = this.isNew;

  // For progressStatus change tracking
  if (!this.isNew) {
    // Fetch the previous record from DB
    const prev = await this.constructor.findById(this._id).lean();
    this._prevProgressStatus = prev ? prev.progressStatus : undefined;
  } else {
    this._prevProgressStatus = undefined;
  }
  next();
});

// Log create, update, and progressStatus change
recordSchema.post('save', async function(doc) {
  try {
    const isNew = doc.wasNew !== false;

    // Get applicant name for better log (optional, fallback to ID)
    let applicantName = doc.applicant;
    try {
      const applicantDoc = await Applicant.findById(doc.applicant).select('name');
      if (applicantDoc) applicantName = applicantDoc.name;
    } catch {}

    // Usual create/update log
    await Activity.create({
      action: isNew ? 'Record Created' : 'Record Updated',
      description: isNew
        ? `A new ${doc.type} record was added for applicant ${applicantName}.`
        : `A ${doc.type} record for applicant ${applicantName} was updated.`,
      date: new Date(),
      user: null
    });

    // Extra: Progress Status Change
    if (!isNew && typeof this._prevProgressStatus !== 'undefined' && this._prevProgressStatus !== doc.progressStatus) {
      await Activity.create({
        action: 'Progress Status Changed',
        description: `Progress status for ${doc.type} record of applicant ${applicantName} changed from "${this._prevProgressStatus}" to "${doc.progressStatus}".`,
        date: new Date(),
        user: null
      });
    }
  } catch (e) {
    console.error('Activity log error (record):', e);
  }
});

// Log delete
recordSchema.post('remove', async function(doc) {
  try {
    let applicantName = doc.applicant;
    try {
      const applicantDoc = await Applicant.findById(doc.applicant).select('name');
      if (applicantDoc) applicantName = applicantDoc.name;
    } catch {}
    await Activity.create({
      action: 'Record Deleted',
      description: `A ${doc.type} record for applicant ${applicantName} was deleted.`,
      date: new Date(),
      user: null
    });
  } catch (e) {
    console.error('Activity log error (record):', e);
  }
});

export const Record = mongoose.model('Record', recordSchema);

import mongoose from 'mongoose';
import Activity from './Activity.js'; // <-- Added

const applicantSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  passport:    { type: String, required: true, unique: true },
  dob:         { type: Date, required: true },
  dExp:        { type: Date, required: true },
  phone:       { type: String, required: true },
  country:     { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  agent:       { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  pstatus:     { type: String, enum: ['Processing', 'Complete'], default: 'Processing' },
  maritalstatus: { type: String, required: true },
  remarks:     { type: String },
  email:       { type: String, required: true },
  documents:   [{ url: String, name: String }]
}, { timestamps: true });

// --- Activity Logging Hooks ---
// Distinguish between create and update
applicantSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
});

// Log create and update
applicantSchema.post('save', async function(doc) {
  try {
    const isNew = doc.wasNew !== false;
    await Activity.create({
      action: isNew ? 'Applicant Created' : 'Applicant Updated',
      description: isNew
        ? `New applicant ${doc.name} was registered.`
        : `Applicant ${doc.name} was updated.`,
      date: new Date(),
      user: null // req.user not available in model hooks
    });
  } catch (e) {
    console.error('Activity log error (applicant):', e);
  }
});

// Log delete
applicantSchema.post('remove', async function(doc) {
  try {
    await Activity.create({
      action: 'Applicant Deleted',
      description: `Applicant ${doc.name} was deleted.`,
      date: new Date(),
      user: null
    });
  } catch (e) {
    console.error('Activity log error (applicant):', e);
  }
});

export const Applicant = mongoose.model('Applicant', applicantSchema);

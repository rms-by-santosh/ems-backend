import mongoose from 'mongoose';
import Activity from './Activity.js'; // <-- Added

const countrySchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  agents:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }]
}, { timestamps: true });

// --- Activity Logging Hooks ---
// Helper to distinguish create vs update
countrySchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
});

// Log create and update
countrySchema.post('save', async function(doc) {
  try {
    const isNew = doc.wasNew !== false;
    await Activity.create({
      action: isNew ? 'Country Created' : 'Country Updated',
      description: isNew
        ? `New country ${doc.name} was added.`
        : `Country ${doc.name} was updated.`,
      date: new Date(),
      user: null // req.user not available here
    });
  } catch (e) {
    console.error('Activity log error (country):', e);
  }
});

// Log delete
countrySchema.post('remove', async function(doc) {
  try {
    await Activity.create({
      action: 'Country Deleted',
      description: `Country ${doc.name} was deleted.`,
      date: new Date(),
      user: null
    });
  } catch (e) {
    console.error('Activity log error (country):', e);
  }
});

export const Country = mongoose.model('Country', countrySchema);

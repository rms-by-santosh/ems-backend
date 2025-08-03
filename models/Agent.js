import mongoose from 'mongoose';
import Activity from './Activity.js'; // <-- added

const agentSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' }]
}, { timestamps: true });

// Log create and update
agentSchema.post('save', async function(doc) {
  try {
    const isNew = doc.wasNew !== false; // custom property to detect if new
    await Activity.create({
      action: isNew ? 'Agent Created' : 'Agent Updated',
      description: isNew
        ? `New agent ${doc.name} was registered.`
        : `Agent ${doc.name} was updated.`,
      date: new Date(),
      user: null // cannot access req.user here
    });
  } catch (e) {
    // Do not throw, just log
    console.error('Activity log error (agent):', e);
  }
});

// Log delete
agentSchema.post('remove', async function(doc) {
  try {
    await Activity.create({
      action: 'Agent Deleted',
      description: `Agent ${doc.name} was deleted.`,
      date: new Date(),
      user: null
    });
  } catch (e) {
    console.error('Activity log error (agent):', e);
  }
});

// Helper for distinguishing create vs update
agentSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
});

export const Agent = mongoose.model('Agent', agentSchema);

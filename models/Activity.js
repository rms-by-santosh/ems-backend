import mongoose from 'mongoose';
const ActivitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;

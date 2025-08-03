import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin', 'superuser'],
    default: 'user'
  },
  name: { type: String, required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', default: null }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

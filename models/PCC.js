import mongoose from 'mongoose';

const pccSchema = new mongoose.Schema({
  applicant:  { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  issuedAt:   { type: Date },
  remarks:    { type: String }
}, { timestamps: true });

export const PCC = mongoose.model('PCC', pccSchema);

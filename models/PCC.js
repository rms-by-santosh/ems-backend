import mongoose from 'mongoose';

const pccSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  process:   { type: String },
  issuedAt:  { type: Date },
  registeredemail: { type: String }
}, { timestamps: true });

export const PCC = mongoose.model('PCC', pccSchema);

import { PCC } from '../models/PCC.js';

// Get all PCC records
export const getPCCRecords = async (req, res, next) => {
  try {
    const pccs = await PCC.find().populate('applicant');
    res.json(pccs);
  } catch (err) {
    next(err);
  }
};

// Add PCC record
export const addPCCRecord = async (req, res, next) => {
  try {
    const pcc = await PCC.create(req.body);
    res.status(201).json(pcc);
  } catch (err) {
    next(err);
  }
};

// Edit PCC record
export const editPCCRecord = async (req, res, next) => {
  try {
    const pcc = await PCC.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pcc) return res.status(404).json({ message: 'PCC record not found' });
    res.json(pcc);
  } catch (err) {
    next(err);
  }
};

// Delete PCC record
export const deletePCCRecord = async (req, res, next) => {
  try {
    const pcc = await PCC.findByIdAndDelete(req.params.id);
    if (!pcc) return res.status(404).json({ message: 'PCC record not found' });
    res.json({ message: 'PCC record deleted' });
  } catch (err) {
    next(err);
  }
};

import { PCC } from '../models/PCC.js';
import { Applicant } from '../models/Applicant.js';
import { sendEmail } from '../utils/sendEmail.js';
import Activity from '../models/Activity.js'; // <-- Default import

// Get all PCC records
export const getPCCRecords = async (req, res, next) => {
  try {
    const pccs = await PCC.find().populate('applicant');
    res.json(pccs);
  } catch (err) {
    next(err);
  }
};

// Get single PCC record by ID
export const getSinglePCCRecord = async (req, res, next) => {
  try {
    const pcc = await PCC.findById(req.params.id).populate('applicant');
    if (!pcc) return res.status(404).json({ message: 'PCC record not found' });
    res.json(pcc);
  } catch (err) {
    next(err);
  }
};

// Add PCC record
export const addPCCRecord = async (req, res, next) => {
  try {
    const pcc = await PCC.create(req.body);

    // Fetch applicant from DB
    const applicant = await Applicant.findById(pcc.applicant);

    if (applicant?.email) {
      await sendEmail(
        applicant.email,
        'PCC Record Created',
        `<p>Dear ${applicant.name},</p><p>Your PCC record has been created.<br>Status: ${pcc.process || 'N/A'}</p>`
      );
    } else {
      console.warn("Applicant email missing for PCC notification. Not sending.", applicant);
    }

    // === Add activity log ===
    await Activity.create({
      action: 'PCC Record Added',
      description: `PCC record for ${applicant ? applicant.name : 'Unknown'} added.`,
      user: req.user?._id, // Ensure req.user exists from your auth middleware
      date: new Date(),
    });

    res.status(201).json(pcc);
  } catch (err) {
    next(err);
  }
};

// Edit PCC record
export const editPCCRecord = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // If status changed to applied, verified, or rejected, clear issuedAt (dispatch date)
    const clearStatus = ["applied", "verified", "rejected", "reapplied","approved"];
    if (updateData.process && clearStatus.includes(updateData.process.toLowerCase())) {
      updateData.issuedAt = null;
    }

    const pcc = await PCC.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!pcc) return res.status(404).json({ message: 'PCC record not found' });

    // Fetch applicant from DB
    const applicant = await Applicant.findById(pcc.applicant);

    if (applicant?.email) {
      await sendEmail(
        applicant.email,
        'PCC Record Updated',
        `<p>Dear ${applicant.name},</p><p>Your PCC record has been updated.<br>Status: ${pcc.process || 'N/A'}</p>`
      );
    } else {
      console.warn("Applicant email missing for PCC notification. Not sending.", applicant);
    }

    // === Add activity log ===
    await Activity.create({
      action: 'PCC Record Updated',
      description: `PCC record for ${applicant ? applicant.name : 'Unknown'} updated.`,
      user: req.user?._id,
      date: new Date(),
    });

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

    // Fetch applicant from DB
    const applicant = await Applicant.findById(pcc.applicant);

    // === Add activity log ===
    await Activity.create({
      action: 'PCC Record Deleted',
      description: `PCC record for ${applicant ? applicant.name : 'Unknown'} deleted.`,
      user: req.user?._id,
      date: new Date(),
    });

    res.json({ message: 'PCC record deleted' });
  } catch (err) {
    next(err);
  }
};

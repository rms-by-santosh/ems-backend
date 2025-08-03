import { Record } from '../models/Record.js';
import { Applicant } from '../models/Applicant.js';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

// Get all records with applicant and nested country
export const getRecords = async (req, res, next) => {
  try {
    const records = await Record.find().populate({
      path: 'applicant',
      populate: { path: 'country' }
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// Get a single record by ID
export const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id).populate({
      path: 'applicant',
      populate: { path: 'country' }
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

// Add new record
export const addRecord = async (req, res, next) => {
  try {
    const record = await Record.create(req.body);
    res.status(201).json(record); // ✅ respond first

    try {
      const applicant = await Applicant.findById(record.applicant).populate('agent');
      const superusers = await User.find({ role: 'superuser' });

      // Mail to Applicant
      if (applicant?.email) {
        await sendEmail(
          applicant.email,
          'Your application record was added',
          `<p>Dear ${applicant.name},</p><p>Your application record was created with status: <b>${record.progressstatus}</b>.</p>`
        );
      }

      // Mail to Agent
      if (applicant.agent?.email) {
        await sendEmail(
          applicant.agent.email,
          `New record for ${applicant.name}`,
          `<p>Your applicant <b>${applicant.name}</b> has a new record. Status: <b>${record.progressstatus}</b>.</p>`
        );
      }

      // Mail to Superusers
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'New Applicant Record Created',
          `<p>A new record has been created for applicant <b>${applicant.name}</b>. Status: <b>${record.progressstatus}</b>.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (addRecord):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Edit record by ID
export const editRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record); // ✅ respond first

    try {
      const applicant = await Applicant.findById(record.applicant).populate('agent');
      const superusers = await User.find({ role: 'superuser' });

      // Mail to Applicant
      if (applicant?.email) {
        await sendEmail(
          applicant.email,
          'Your application record was updated',
          `<p>Dear ${applicant.name},</p><p>Your application record has been updated. New status: <b>${record.progressStatus}</b>.</p>`
        );
      }

      // Mail to Agent
      if (applicant.agent?.email) {
        await sendEmail(
          applicant.agent.email,
          `Record Updated: ${applicant.name}`,
          `<p>The record for your applicant <b>${applicant.name}</b> has been updated. Status: <b>${record.progressStatus}</b>.</p>`
        );
      }

      // Mail to Superusers
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Applicant Record Updated',
          `<p>The record for applicant <b>${applicant.name}</b> has been updated. Status: <b>${record.progressStatus}</b>.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (editRecord):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Delete record by ID
export const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted' }); // ✅ respond first

    try {
      const applicant = await Applicant.findById(record.applicant);
      const superusers = await User.find({ role: 'superuser' });

      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Record Deleted',
          `<p>The record for applicant <b>${applicant?.name || 'unknown'}</b> has been deleted from the system.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (deleteRecord):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

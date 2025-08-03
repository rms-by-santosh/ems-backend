import { Applicant } from '../models/Applicant.js';
import { Agent } from '../models/Agent.js';
import { User } from '../models/User.js';
import { sendApplicantStatusMail } from '../utils/mailTemplates.js';
import { sendEmail } from '../utils/sendEmail.js';

// Get all applicants (with optional filtering by agent and country)
export const getApplicants = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.agent) filter.agent = req.query.agent;
    if (req.query.country) filter.country = req.query.country;

    const applicants = await Applicant.find(filter).populate('agent country');
    res.json(applicants);
  } catch (err) {
    next(err);
  }
};

// Get a single applicant
export const getApplicant = async (req, res, next) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate('agent country');
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    res.json(applicant);
  } catch (err) {
    next(err);
  }
};

// Create applicant
export const createApplicant = async (req, res, next) => {
  try {
    const applicant = await Applicant.create(req.body);
    if (applicant.agent) {
      await Agent.findByIdAndUpdate(applicant.agent, { $push: { applicants: applicant._id } });
    }

    res.status(201).json(applicant); // ✅ Send response first

    try {
      const populated = await Applicant.findById(applicant._id).populate('agent');

      // Mail to Applicant
      if (populated?.email) {
        await sendEmail(
          populated.email,
          'Your Application Has Been Submitted',
          `<p>Dear ${populated.name},</p><p>Your application has been successfully submitted.</p>`
        );
      }

      // Mail to Agent
      if (populated.agent?.email) {
        await sendEmail(
          populated.agent.email,
          `New Applicant Assigned: ${populated.name}`,
          `<p>You have been assigned a new applicant: <b>${populated.name}</b>.</p>`
        );
      }

      // Mail to Superusers
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'New Applicant Created',
          `<p>A new applicant <b>${populated.name}</b> has been added to the system.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (createApplicant):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Update applicant
export const updateApplicant = async (req, res, next) => {
  try {
    const applicant = await Applicant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    res.json(applicant); // ✅ respond first

    try {
      const populated = await Applicant.findById(applicant._id).populate('agent');

      // Mail to Applicant
      if (populated?.email) {
        await sendEmail(
          populated.email,
          'Your Application Has Been Updated',
          `<p>Dear ${populated.name},</p><p>Your application information has been updated.</p>`
        );
      }

      // Mail to Agent
      if (populated.agent?.email) {
        await sendEmail(
          populated.agent.email,
          `Applicant Updated: ${populated.name}`,
          `<p>The details for your applicant <b>${populated.name}</b> have been updated.</p>`
        );
      }

      // Mail to Superusers
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Applicant Updated',
          `<p>Applicant <b>${populated.name}</b> has been updated in the system.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (updateApplicant):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Change applicant status with notification
export const updateApplicantStatus = async (req, res, next) => {
  try {
    const { pstatus, remarks } = req.body;
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { pstatus, remarks },
      { new: true }
    );
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    await sendApplicantStatusMail(applicant); // ✅ handled externally

    res.json(applicant);
  } catch (err) {
    next(err);
  }
};

// Delete applicant
export const deleteApplicant = async (req, res, next) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    res.json({ message: 'Applicant deleted' });

    try {
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Applicant Deleted',
          `<p>The applicant <b>${applicant.name}</b> has been deleted from the system.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (deleteApplicant):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

import { Agent } from '../models/Agent.js';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js'; // ✅ for superuser notification

// Get all agents
export const getAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    next(err);
  }
};

// Get agent by ID
export const getAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);  
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    next(err);
  }
};

// Create agent
export const createAgent = async (req, res, next) => {
  try {
    const agent = await Agent.create(req.body);
    res.status(201).json(agent); // ✅ respond first

    // ✉️ Notify Superusers (after response)
    try {
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'New Agent Added',
          `<p>A new agent has been added: <b>${agent.name}</b> (${agent.email})</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (createAgent):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Update agent
export const updateAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent); // ✅ respond first

    // ✉️ Notify Superusers (after response)
    try {
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Agent Profile Updated',
          `<p>The agent <b>${agent.name}</b>'s profile has been updated.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (updateAgent):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Delete agent
export const deleteAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ message: 'Agent deleted' }); // ✅ respond first

    // ✉️ Notify Superusers (after response)
    try {
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Agent Deleted',
          `<p>The agent <b>${agent.name}</b> has been removed from the system.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (deleteAgent):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// backend/controllers/publicController.js
import { Agent } from "../models/Agent.js";
import { Applicant } from "../models/Applicant.js";
import { Record } from "../models/Record.js";

export const publicAgentByEmail = async (req, res, next) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    // find agent by email (case-insensitive)
    const agent = await Agent.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    }).lean();

    if (!agent) return res.status(404).json({ message: "Agent not found" });

    // fetch applicants for that agent
    const applicants = await Applicant.find({ agent: agent._id })
      .populate("country") // if you have ref to Country
      .lean();

    // fetch records to build progress map
    const records = await Record.find({ applicant: { $in: applicants.map(a => a._id) } })
      .select("applicant progressStatus updatedAt")
      .sort({ updatedAt: 1 }) // later wins if dupes
      .lean();

    const progressByApplicant = {};
    for (const r of records) {
      progressByApplicant[String(r.applicant)] = r.progressStatus || "";
    }

    // minimal public payload
    const safeAgent = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      contact: agent.contact || agent.phone || "",
    };

    const publicApplicants = applicants.map(a => ({
      _id: a._id,
      name: a.name || "",
      contact: a.phone || a.contact || a.email || "",
      countryName: typeof a.country === "object" && a.country ? (a.country.name || "") : "",
      progress: progressByApplicant[String(a._id)] || "",
    }));

    res.json({
      agent: safeAgent,
      applicants: publicApplicants,
    });
  } catch (err) {
    next(err);
  }
};

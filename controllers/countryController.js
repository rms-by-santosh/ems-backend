import { Country } from '../models/Country.js';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

// Get all countries
export const getCountries = async (req, res, next) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (err) {
    next(err);
  }
};

// Get country by ID
export const getCountry = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json(country);
  } catch (err) {
    next(err);
  }
};

// Create country
export const createCountry = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Country name is required" });
    }

    const existing = await Country.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Country name must be unique" });
    }

    const country = await Country.create({ name });
    res.status(201).json(country); // ✅ respond first

    // ✉️ Notify Superusers (after response)
    try {
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'New Country Added',
          `<p>A new country has been added to the system: <b>${country.name}</b>.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (createCountry):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Update country
export const updateCountry = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Country name is required" });
    }

    const existing = await Country.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ message: "Country name must be unique" });
    }

    const country = await Country.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json(country); // ✅ respond first

    // ✉️ Notify Superusers
    try {
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Country Updated',
          `<p>The country has been updated to: <b>${country.name}</b>.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (updateCountry):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

// Delete country
export const deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json({ message: 'Country deleted' }); // ✅ respond first

    // ✉️ Notify Superusers
    try {
      const superusers = await User.find({ role: 'superuser' });
      for (const su of superusers) {
        await sendEmail(
          su.email,
          'Country Deleted',
          `<p>The country <b>${country.name}</b> has been removed from the system.</p>`
        );
      }
    } catch (mailErr) {
      console.error("Email failed (deleteCountry):", mailErr.message);
    }

  } catch (err) {
    next(err);
  }
};

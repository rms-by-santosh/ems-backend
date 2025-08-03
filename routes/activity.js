import express from 'express';
import Activity from '../models/Activity.js';
const router = express.Router();

router.get('/recent', async (req, res) => {
  try {
    const recent = await Activity.find({})
      .sort({ date: -1 })
      .limit(10)
      .populate('user', 'name');
    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recent activity.' });
  }
});

export default router;

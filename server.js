import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/error.js';
import { seedAdminUser } from './utils/seedAdmin.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import countryRoutes from './routes/countryRoutes.js';
import applicantRoutes from './routes/applicantRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import pccRoutes from './routes/pccRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import activityRoutes from './routes/activity.js';
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/pcc', pccRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);
app.use("/api/public", publicRoutes); 

// Error handler
app.use(errorHandler);

// Start DB and server
const start = async () => {
  await connectDB();
  await seedAdminUser();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();

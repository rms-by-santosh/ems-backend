// backend/routes/publicRoutes.js
import express from "express";
import { publicAgentByEmail } from "../controllers/publicController.js";

const router = express.Router();

// GET /public/agent?email=someone@example.com
router.get("/agent", publicAgentByEmail);

export default router;

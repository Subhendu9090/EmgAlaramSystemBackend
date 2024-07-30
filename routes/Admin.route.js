import { Router } from "express";

import { adminLogin } from "../controllers/AdminController.js";

const router = Router();

router.post("/login-admin", adminLogin);

export default router;

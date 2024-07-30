import { Router } from "express";
import { registerTower ,getAllTower,GetEmployeesByTowerId,getSingleTowerByNumberAndNearestEmployee } from "../controllers/TowerController.js";

const router = Router();

router.post("/register-tower", registerTower);
router.get("/get-all-tower", getAllTower);
router.post("/get-employee-by-tower", GetEmployeesByTowerId);
router.post("/get-single-tower-by-number", getSingleTowerByNumberAndNearestEmployee);

export default router;

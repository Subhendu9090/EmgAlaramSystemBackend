import { Router } from "express";
import { registerEmployee, loginEmployee, getAllEmployee, AllEmp } from "../controllers/EmployeeController.js";

const route = Router();

route.post("/register-employee", registerEmployee);
route.post("/login-employee", loginEmployee);
route.get("/all-employee", getAllEmployee);
route.get("/all-emp", AllEmp);
export default route;

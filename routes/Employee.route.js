import { Router } from "express";
import { registerEmployee, loginEmployee, getAllEmployee, AllEmp ,updateLocation, deleteEmployee} from "../controllers/EmployeeController.js";

const route = Router();

route.post("/register-employee", registerEmployee);
route.post("/login-employee", loginEmployee);
route.get("/all-employee", getAllEmployee);
route.get("/all-emp", AllEmp);
route.post("/update-location",updateLocation)
route.delete("/delete-employee/:id",deleteEmployee)

export default route;

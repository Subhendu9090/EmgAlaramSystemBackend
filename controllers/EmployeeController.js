import Tower from "../models/TowerModel.js";
import { GenerateJwt } from "../utils/helper.js";
import bcrypt from "bcryptjs";
import Employee from "../models/EmployeeModel.js";
import { isValidObjectId } from "mongoose";

export const registerEmployee = async (req, res) => {
  try {
    const { name, email, password, towerNumber, mobileNumber, carNumber } =
      req.body;
    if ([name, email, password, mobileNumber, carNumber].some((field) => field?.trim() === ""
    )
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter required field",
      });
    }
    if (!towerNumber) {
      return res.status(400).json({
        success: false,
        message: "Enter tower number",
      });
    }
    // Check if the email already exists
    const existedUser = await Employee.findOne({ email });
    if (existedUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Check if the mobile number already exists
    const existMobilenumber = await Employee.findOne({ mobileNumber });
    if (existMobilenumber) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this mobile number",
      });
    }

    // Find the tower with the given tower number
    const tower = await Tower.findOne({ towerNumber });
    if (!tower) {
      return res.status(404).json({
        success: false,
        message: "Tower not found with the given tower number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      assignedTower: tower._id,
      mobileNumber,
      carNumber,
    });

    await newEmployee.save();

    // Add the employee to the tower's assignedEmployees array
    tower.assignedEmployees.push(newEmployee._id);
    await tower.save();

    // Create a new object without the password field
    const employeeWithoutPassword = newEmployee.toObject();
    delete employeeWithoutPassword.password;

    return res.status(200).json({
      success: true,
      data: employeeWithoutPassword,
      message: "Employee created successfully and assigned to tower",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message:
        "Error occurred while creating user. Check registerEmployee controller",
    });
  }
};

export const loginEmployee = async (req, res) => {
  try {
    const { email, password, location } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email and password",
      });
    }
    const check = await Employee.findOne({ email });
    if (!check) {
      return res.status(400).json({
        success: false,
        message: "User not found with this email",
      });
    }
    const checkPassword = await bcrypt.compare(password, check.password);
    if (!checkPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password does not match" });
    }
    if (
      typeof location !== "object" ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      typeof location.coordinates[0] !== "number" ||
      typeof location.coordinates[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid location with type 'Point' and coordinates [longitude, latitude]",
      });
    }
    check.location = location;
    await check.save();
    const token = GenerateJwt(check.id);
    return res.status(200).json({
      success: true,
      message: "Employee login successfully",
      token: token,
      data: check,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Employee login failed"
    });
  }
};

export const getAllEmployee = async (req, res) => {
  try {
    const allEmployee = await Employee.find({}).populate(
      "assignedTower",
      "towerNumber "
    );

    if (allEmployee.length === 0) {
      return res.status(404).json({ message: "No data is available" });
    }

    const simplifiedEmployees = allEmployee.map((employee) => {
      const { assignedTower, ...employeeData } = employee.toObject();
      return {
        ...employeeData,
        towerNumber: assignedTower ? assignedTower.towerNumber : null,
        alertCount: assignedTower ? assignedTower.alertCount : null,
      };
    });

    res.status(200).json({
      success: true,
      message: "All employees fetched successfully",
      data: simplifiedEmployees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching employees",
      error: error.message,
    });
  }
};

export const AllEmp = async (req, res) => {
  try {
    const allEmp = await Employee.find({});
    if (allEmp) {
      return allEmp;
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { location, EmpId } = req.body;
  
    if (!isValidObjectId(EmpId)) {
      return res.status(400).json({
        success: false,
        message:
          "invalid object id",
      });
    }
  
    if (
      typeof location !== "object" ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      typeof location.coordinates[0] !== "number" ||
      typeof location.coordinates[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid location with type 'Point' and coordinates [longitude, latitude]",
      });
    }
  
    const existedEmployee = await Employee.findById(EmpId);
  
    if (!existedEmployee) {
      return res.status(400).json({
        success: false,
        message:
          "Employee not found",
      });
    };
  
    existedEmployee.location = location;
    await existedEmployee.save()
  
    return res.status(200).json({
      success: true,
      message:
        "Employee location updated successfully",
      data: existedEmployee
    });
  
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message:
        "network error",
    });
  }
}
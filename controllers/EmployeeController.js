import Tower from "../models/TowerModel.js";
import { GenerateJwt } from "../utils/helper.js";
import bcrypt from "bcryptjs";
import Employee from "../models/EmployeeModel.js";
import { isValidObjectId } from "mongoose";

export const registerEmployee = async (req, res) => {
  try {
    const { name, email, password, towerNumber, mobileNumber, carNumber } =
      req.body;
    if ([name, email, password, carNumber].some((field) => field?.trim() === ""
    )
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter required field",
      });
    }
    if (!towerNumber || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Enter tower number and mobile number",
      });
    }

    const existedUser = await Employee.findOne({
      $or: [{ email }, { mobileNumber }]
    });
    if (existedUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or mobile number",
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

    const newEmployee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      assignedTower: tower._id,
      mobileNumber,
      carNumber,
    });

    tower.assignedEmployees = newEmployee._id;
    await tower.save()

    const employee = await Employee.findById(newEmployee._id).select("-password")

    return res.status(200).json({
      success: true,
      data: employee,
      message: "Employee created successfully",
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
    const { email, password, empLocation } = req.body;

    if ([email, password].some((field) => typeof field === 'string' && field.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and password",
      });
    }

    if (empLocation.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid location with [latitude,longitude]",
      });
    }

    const existEmployee = await Employee.findOne({ email });
    if (!existEmployee) {
      return res.status(400).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const isCorrectPassword = await bcrypt.compare(password, existEmployee.password);
    if (!isCorrectPassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    existEmployee.empLocation = empLocation;
    await existEmployee.save()

    // Generate JWT token
    const token = await GenerateJwt(existEmployee._id);

    return res.status(200).json({
      success: true,
      message: "Employee logged in successfully",
      token: token,
      data: existEmployee,
    });

  } catch (error) {
    console.error("Error in loginEmployee:", error);
    return res.status(500).json({
      success: false,
      message: "Employee login failed",
      error: error.message,
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
    const { empLocation, EmpId } = req.body;

    if (!isValidObjectId(EmpId)) {
      return res.status(400).json({
        success: false,
        message:
          "invalid object id",
      });
    }

    if (empLocation?.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid location with [ latitude , longitude]",
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

    existedEmployee.empLocation = empLocation;
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

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "invalid object id",
      });
    }

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data:deletedEmployee,
      message:
        "Employee Deleted successfully",
    });
  } catch (error) {
    console.log("Error in delete Employee",error);
    
    return res.status(500).json({
      success: false,
      message:
        "Employee deletion failed",
    });
  }
}
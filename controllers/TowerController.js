import Tower from "../models/TowerModel.js";
import { AllEmp } from "./EmployeeController.js";
import { calculateDistance } from "../utils/helper.js";

export const registerTower = async (req, res) => {
  try {
    let { towerName, towerNumber, towerLocation } = req.body;

    if ([towerName].some((field) => typeof field === 'string' && field.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Please provide tower name",
      });
    }
   if (!towerNumber) {
    return res.status(400).json({
      success: false,
      message: "Please provide tower number",
    });
   }
   if (towerLocation.length !== 2) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid location with [longitude, latitude]",
    });
   }

    const existingTower = await Tower.findOne({ towerNumber });
    if (existingTower) {
      return res.status(400).json({
        success: false,
        message: "Tower number already exists",
      });
    }

    const newTower = await Tower.create({ ...req.body });

    return res.status(201).json({
      success: true,
      message: "Tower created successfully",
      data: newTower,
    });
  } catch (error) {
    console.error("Error in registerTower:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while registering the tower",
      error: error.message, // Optional for debugging
    });
  }
};

export const getAllTower = async (req, res) => {
  try {
    const allData = await Tower.find({});
    if (allData.length === 0) {
      res.json({
        message: "Tower is empty",
      });
    }
    res.status(200).json({
      success: true,
      message: "Tower data fetched succesfully",
      data: allData,
    });
  } catch (error) {
    console.log("Something went wrong when accessing tower", error);
  }
};
// get employee by tower id
export const GetEmployeesByTowerId = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid tower ID",
      });
    }

    const tower = await Tower.findById(id).populate("assignedEmployees");

    if (!tower) {
      return res.status(404).json({
        success: false,
        message: "Tower not found",
      });
    }

    res.status(200).json({
      success: true,
      employees: tower.assignedEmployees,
    });
  } catch (error) {
    console.error("Something went wrong", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
//get a single tower by id
export const getSingleTowerByNumberAndNearestEmployee = async (req, res) => {
  const { number } = req.body;
  if (!number) {
    res.status(400).json({ success: false, message: "Please provide a tower number" });
  }
  try {
    const towerByNumber = await Tower.findOne({ towerNumber: number });
    if (!towerByNumber) {
      res.status(404).json({
        success: false,
        message: "Tower with this number is not exist",
      });
    }

    const { towerName, towerNumber, towerLocation } = towerByNumber;
    const TowerDetails = {
      towerName,
      towerNumber,
      towerLocation,
    };

    const allEmployee = await AllEmp();

    const employeeCoordinates = allEmployee
      .filter((item) => item.empLocation)
      .map((item) => ({
        name: item.name,
        id: item._id,
        coordinates: item.empLocation,
        distance: calculateDistance(
          TowerDetails.towerLocation,
          item.empLocation
        ),
      }))
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, 5); // Get the first 5 employees

    const finalResponse = {
      TowerDetails,
      employeeData: employeeCoordinates,
    };

    res.status(200).json({
      success: true,
      message: "tower found with this nummber",
      data: finalResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      sucess: false,
      message: "Something went wrong",
    });
  }
};

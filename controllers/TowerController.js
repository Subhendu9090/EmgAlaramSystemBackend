import Tower from "../models/TowerModel.js";
import { AllEmp } from "./EmployeeController.js";
import { calculateDistance } from "../utils/helper.js";

export const registerTower = async (req, res) => {
  try {
    const { towerName, towerNumber, location } = req.body;

    if (!towerNumber || !location || !towerName) {
      return res.status(400).json({
        success: false,
        message: "Please provide tower number and location and name",
      });
    }

    if (typeof towerNumber !== "number") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid tower number",
      });
    }

    if (
      typeof location !== "object" ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      typeof location.coordinates[0] !== "number" ||
      typeof location.coordinates[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid location with type 'Point' and coordinates [longitude, latitude]",
      });
    }

    const existingTower = await Tower.findOne({ towerNumber });
    if (existingTower) {
      return res.status(400).json({
        success: false,
        message: "Tower number already exists",
      });
    }

    const newTower = await Tower.create({ towerName, towerNumber, location });

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
    });
  }
};

export const getAllTower = async (req, res) => {
  try {
    const allData = await Tower.find({});
    if (allData.length < 0) {
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
    res.status(200).json({ success: false, message: "Please provide a id" });
  }
  try {
    const towerByNumber = await Tower.findOne({ towerNumber: number });
    if (!towerByNumber) {
      res.status(200).json({
        success: false,
        message: "Tower with this number is not exist",
      });
    }

    const { towerName, towerNumber, location } = towerByNumber;
    const TowerDetails = {
      towerName,
      towerNumber,
      coordinates: location.coordinates,
    };

    const allEmployee = await AllEmp();

    const employeeCoordinates = allEmployee
      .filter((item) => item.location && item.location.coordinates)
      .map((item) => ({
        name: item.name,
        id: item._id,
        coordinates: item.location.coordinates,
        distance: calculateDistance(
          TowerDetails.coordinates,
          item.location.coordinates
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

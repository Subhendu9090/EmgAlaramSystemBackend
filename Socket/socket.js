import { Server } from "socket.io";
import http from "http";
import express from "express";
import Employee from "../models/EmployeeModel.js";
import { isValidObjectId } from "mongoose";
import Tower from "../models/TowerModel.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://sossystem.netlify.app"],
    methods: ["GET", "POST"]
  }
});
// find employee based on employee
const findEmployee = async (EmpId) => {
  if (!isValidObjectId(EmpId)) {
    console.log(EmpId, " is not a valid ObjectId");
    return false;
  }

  try {
    const employee = await Employee.findById(EmpId);
    if (employee) {
      return employee?.name;
    } else {
      console.log(EmpId, " not found");
      return false;
    }
  } catch (error) {
    console.error("Error finding user:", error);
    return false;
  }
};

const userSockets = {};
// for multiple user based on tower number
io.on("connection", (Socket) => {
  console.log("user connected with", Socket.id);

  Socket.on("sendEmpId", async (EmpId) => {
    console.log("Received EmpId:", EmpId);

    if (EmpId) {
      userSockets[EmpId] = Socket.id;
      console.log(`Mapped ${EmpId} to socket ID ${Socket.id}`);
    }
  });

  Socket.on("sendUserArray", async (user) => {
    console.log(user);
    user.map(async (userId) => {
      if (userSockets[userId]) {
        io.to(userSockets[userId]).emit("getNotificationByUserArray", "notification get by user array")
      } else {
        // console.log("not present");
        const EmpName = await findEmployee(userId)
        io.to(userSockets["admin@sos.com"]).emit("getNotificationToAdminId", `${EmpName} is not available`)
      }
    })

  })

  const location = {}
  Socket.on("sendLocation", (data) => {
    console.log("sendLocation", data);

    if (!location[data?.id]) {
      location[data.id] = [];
    }
    location[data.id].push(data);

    if (location[data.id].length > 60) {
      location[data.id].splice(1, 2);
    }

    if (data) {
      io.to(userSockets["admin@sos.com"]).emit("getLocation", location)
    }

    console.log("Location", location);
  })

  Socket.on("offNotification", async (msg) => {
    console.log(msg);
    for (const userId in userSockets) {
      io.to(userSockets[userId]).emit("offMessage", "off the notification")
    }
  })

  Socket.on("disconnect", () => {
    console.log("user disconnected", Socket.id);
    for (const userId in userSockets) {
      if (userSockets[userId] === Socket.id) {
        delete userSockets[userId];
        console.log(`Removed socket mapping for user: ${userId}`);
        break;
      }
    }
  })
})

export { app, io, server };

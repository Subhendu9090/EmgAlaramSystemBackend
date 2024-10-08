import { Server } from "socket.io";
import http from "http";
import express from "express";
import Employee from "../models/EmployeeModel.js";
import { isValidObjectId } from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

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

io.on("connection", (Socket) => {
  console.log("user connected with", Socket.id);

  Socket.on("sendEmpId", async (EmpId) => {
    console.log("Received EmpId:", EmpId);

    if (EmpId) {
      userSockets[EmpId] = Socket.id;
      console.log(`Mapped ${EmpId} to socket ID ${Socket.id}`);
    }
  });

  Socket.on("sendUserArray", async (data) => {
    const user = data.userIdArray;
    const number = data.towerNumber
    const location = data.location;
    const name = data.towerName;
    const sendingData = {number,location,name}
    console.log("data", data.towerId);

    // io.to(userSockets["admin@sos.com"]).emit("getNotificationByUserArray", sendingData);

    user.map(async (userId) => {
      if (userSockets[userId]) {
        io.to(userSockets[userId]).emit("getNotificationByUserArray", data)
      } else {
        console.log(userSockets["admin@sos.com"]);
          const empName = await findEmployee(userId);
          io.to(userSockets["admin@sos.com"]).emit("getNotificationToAdminId", empName);
          
      }
    })

  })

  Socket.on("pending",(name)=>{
    console.log("message",name);
    io.to(userSockets["admin@sos.com"]).emit("pendingMessage",name)
  })

  Socket.on("accept",(name)=>{
    console.log("message",name);
    io.to(userSockets["admin@sos.com"]).emit("messageAccept",name)
  })
  
  Socket.on("reached",(name)=>{
    console.log("message",name);
    io.to(userSockets["admin@sos.com"]).emit("messageReached",name)
  })

  Socket.on("sendLocation", (data) => {
    console.log("sendLocation", data);

    if (data) {
      io.to(userSockets["admin@sos.com"]).emit("getLocation", data)
    }
    console.log("Location", data);
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

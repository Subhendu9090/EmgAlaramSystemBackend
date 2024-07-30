import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import EmployeeRouter from "./routes/Employee.route.js";
import TowerRouter from "./routes/TowerRoute.js";
import AdminRouter from "./routes/Admin.route.js";
import {app,server } from "./Socket/socket.js";
import DbConnect from "./db/DbConnect.js";
import cors from "cors";

app.use(cors())

dotenv.config()

const PORT= process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/employee", EmployeeRouter);
app.use("/api/v1/tower", TowerRouter);
app.use("/api/v1/admin", AdminRouter);

server.listen(PORT,()=>{
    DbConnect();
    console.log(`server is running at ${PORT}`);
})
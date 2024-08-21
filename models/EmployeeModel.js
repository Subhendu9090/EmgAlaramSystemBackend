import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  carNumber: {
    type: String,
    required: true,
  },
  empLocation: {
   type:[String]
  },
  assignedTower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tower",
  },
},
{
  timestamps: true,
});

const Employee = mongoose.model("Employee", EmployeeSchema);
export default Employee;

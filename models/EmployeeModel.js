import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  carNumber: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      // required:true
    },
    coordinates: {
      type: [Number],
      // required:true
    },
  },
  assignedTower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tower",
    required: true,
  },
},
{
  timestamps:true
});

EmployeeSchema.index({ location: "2dsphere" });

const Employee = mongoose.model("Employee", EmployeeSchema);

export default Employee;

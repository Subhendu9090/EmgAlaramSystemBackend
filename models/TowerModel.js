import mongoose from "mongoose";

const TowerSchema = new mongoose.Schema({
  towerName:{
    type:String,
    required:true,
  },
  towerNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  towerLocation: {
    type:[String]
  },
  status: {
    type: String,
    enum: ['pending', 'accept', 'reached'],
  },
  lastInspectionDate: {
    type: Date,
  },
  acceptedEmployees: {
    type: [String]
  },
  assignedEmployees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
},{
  timestamps:true
});

const Tower = mongoose.model("Tower", TowerSchema);

export default Tower;


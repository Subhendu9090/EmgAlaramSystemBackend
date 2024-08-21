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
    type: Boolean,
  },
  lastInspectionDate: {
    type: Date,
  },
  alertCount: {
    type: Number,
    default: 0,
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


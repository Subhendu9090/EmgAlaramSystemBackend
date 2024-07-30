import mongoose from "mongoose";

const TowerSchema = new mongoose.Schema({
  towerNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: Boolean,
    // default: true,
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

TowerSchema.index({ location: "2dsphere" });

const Tower = mongoose.model("Tower", TowerSchema);

export default Tower;

// const newTower = new Tower({
//   towerNumber: 1,
//   location: {
//     type: "Point",
//     coordinates: [longitude, latitude], // Longitude first, then latitude
//   },
//   status: true,
//   lastInspectionDate: new Date(),
//   alertCount: 0,
//   assignedEmployees: [],
// });

// await newTower.save();

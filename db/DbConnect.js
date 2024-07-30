import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const dbResult = await mongoose.connect(
      `${process.env.MONGO_URL}${process.env.DB_NAME}`
    );
    console.log("Database is successfully connected");
  } catch (error) {
    console.log("Something wrong in database Connection", error);
    process.exit(1);
  }
};

export default connectDb;

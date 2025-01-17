import mongoose from "mongoose";
import colors from "colors";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongodb Connected ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`Mongodb Error ${error}`.bgRed.white);
  }
}

export default connectDB;
const { default: mongoose } = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.CONNECT_DB) {
      throw new Error("MongoDB connection string is not defined in environment variables");
    }

    const conn = await mongoose.connect(process.env.CONNECT_DB);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};

export default connectDB;

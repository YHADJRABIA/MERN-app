/* Connection to MongoDB database */
require("dotenv").config({ path: __dirname + "/.env" }); //Access to .env file
const mongoose = require("mongoose"); // Enables communication with MongoDB

const URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("MongoDB connection successful ✓");
  } catch (error) {
    console.error("MongoDB connection failed ✗");
    process.exit(1);
  }
};

module.exports = connectDB;

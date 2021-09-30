/* Script to upload locally stored data to database */
require("dotenv").config();

// Package.json script to load the local data on the database -> "data:import": "node backend/seederScript.js",

const productData = require("../data/products");
const connectDB = require("../config/db");
const Product = require("../models/product.model");

connectDB();

const importData = async () => {
  try {
    await Product.deleteMany({}); // /!\ Clears existing data from collections /!\

    await Product.insertMany(productData);

    console.log("✓ Successful import ✓");

    process.exit(); // Forced termination of process
  } catch (error) {
    console.error("✗ Error with data import ✗", error);
    process.exit(1);
  }
};

importData();

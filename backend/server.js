require("dotenv").config({ path: __dirname + "/config/.env" }); // Access to .env file with private data
const path = require("path");
const express = require("express"); // Node framework
const cors = require("cors"); // Cross-Origin Resource Sharing
const connectDB = require("./config/db"); // Connect to database
const cookieParser = require("cookie-parser"); // Enables cookies parsing with request object
// body-parser (now deprecated) would take the body of the request and parse it to whichever format the server would expect to receive it (JSON, URL-encoded, text, raw) with POST/PUT
const fileUpload = require("express-fileupload"); // Self explanatory

/* Middleware */

const errorHandler = require("./middleware/error");

/* Routers */
const userRoutes = require("./routes/user.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

// Middleware - fired at every consecutive request to the server
app.use(express.json()); // Enables client requests sent in JSON format to be read by server.
app.use(cors()); // Necessary for the server to be queried by the client (they have different ports/domains)
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true, // Disables the use of RAM storage to avoid memory overflow
  })
);

// Routes
app.use("/user", userRoutes);
app.use("/api", uploadRoutes);
//app.use(errorHandler); // Should be last

// Database
connectDB();

/* If in production mode - serve compressed/static react content to server. i.e. http://localhost:5000/ would display frontend content.
/!\ Do not forget to generate Procfile and script for Heroku to insure proper generation of "build" directory /!\ */

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
  });
}

// Starting server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} ✓`));

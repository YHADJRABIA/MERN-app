const fs = require("fs");

// Middleware ensuring conformity of uploaded image
module.exports = async function (req, res, next) {
  try {
    // Empty upload
    if (typeof req.files === "undefined" || Object.keys(req.files).length === 0)
      return res
        .status(400)
        .json({ status: "Error", msg: "No files were uploaded." });

    const file = req.files.file;

    // Hefty upload
    if (file.size > 1024 * 1024) {
      removeTmp(file.tempFilePath);
      return res
        .status(401)
        .json({ status: "Error", msg: "File is too heavy." });
    } // 1MB

    // Only jpeg and png may be accepted
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      removeTmp(file.tempFilePath);
      return res
        .status(401)
        .json({ status: "Error", msg: "Invalid file format." });
    }

    next();
  } catch (err) {
    return res.status(500).json({ status: "Error", msg: err.message });
  }
};

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

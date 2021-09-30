const cloudinary = require("cloudinary"); // Enables image upload to the cloud and performs resizing, cropping, conversion...etc
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadCtrl = {
  uploadAvatar: (req, res) => {
    try {
      const file = req.files.file;
      cloudinary.v2.uploader.upload(
        file.tempFilePath,
        {
          folder: "avatar",
          width: 150,
          height: 150,
          crop: "fill", // 150px * 150px uploaded in "avatar" folder
        },
        async (err, result) => {
          if (err) {
            console.log(err);
            throw err;
          }

          removeTmp(file.tempFilePath);
          res.json({
            status: "Success",
            msg: "Successful upload!",
            url: result.secure_url,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
};

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
};

module.exports = uploadCtrl;

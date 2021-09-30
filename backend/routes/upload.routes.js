const router = require("express").Router();
const uploadImage = require("../middleware/uploadImage"); // Avatar image
const uploadCtrl = require("../controllers/upload.controller");
const auth = require("../middleware/auth");

//@POST http://localhost:5000/api/upload_avatar login required
router.post("/upload_avatar", auth, uploadImage, uploadCtrl.uploadAvatar);

module.exports = router;

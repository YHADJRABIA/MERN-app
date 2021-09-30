const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

//@POST http://localhost:5000/user/register (body: name, email, password)
router.post("/register", userCtrl.register);

//@POST http://localhost:5000/user/activation/[activation-token] (body: activation_token)
router.post("/activation", userCtrl.activateEmail);

//@POST http://localhost:5000/user/login (email, password)
router.post("/login", userCtrl.login);

//@POST http://localhost:5000/user/refresh_token
router.post("/refresh_token", userCtrl.getAccessToken);

//@POST http://localhost:5000/user/forgotten
router.post("/forgotten", userCtrl.forgottenPassword);

//@POST http://localhost:5000/user/reset login required
router.post("/reset", auth, userCtrl.resetPassword);

//@GET http://localhost:5000/user/info login required
router.get("/info", auth, userCtrl.getUserInfo);

//@GET http://localhost:5000/user/all_info login as admin required
router.get("/all_info", auth, adminAuth, userCtrl.getAllUsersInfo);

//@GET http://localhost:5000/user/logout
router.get("/logout", userCtrl.logout);

//@PATCH http://localhost:5000/user/update login required
router.patch("/update", auth, userCtrl.updateUser);

//@PATCH http://localhost:5000/user/update_role/(user-id) login as admin required
router.patch("/update_role/:id", auth, adminAuth, userCtrl.updateUsersRole);

//@DELETE http://localhost:5000/user/delete/(user-id) login as admin required
router.delete("/delete/:id", auth, adminAuth, userCtrl.deleteUser);

/*------------ SOCIALMEDIA LOGIN -----------*/

//@POST http://localhost:5000/user/google_login
router.post("/google_login", userCtrl.googleLogin);

//@POST http://localhost:5000/user/facebook_login
router.post("/facebook_login", userCtrl.facebookLogin);

module.exports = router;

// Improvements: check if user is already logged in for /login + logged in for /logout otherwise don't perform actions and handle redirections + handle invalid id for update + only allow user to edit own content

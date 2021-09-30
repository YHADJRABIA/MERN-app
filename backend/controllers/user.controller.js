const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const axios = require("axios");
const fetch = require("node-fetch");

// Model
const Users = require("../models/user.model");

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);

const { CLIENT_URL, GOOGLE_RECAPTCHA_SECRET } = process.env;

const userCtrl = {
  /*-------------------------- Registration ---------------------*/
  register: async (req, res) => {
    try {
      const { name, email, password, token } = req.body;
      const human = await validateHuman(token);

      /*---------------- Checking for errors first -------------*/

      // Empty fields
      if (!name || !email || !password)
        return res
          .status(400)
          .json({ status: "Error", msg: "Please fill out all fields." });

      // E-mail format
      if (!validateEmail(email))
        return res
          .status(401) // 401: Invalid credentials
          .json({ status: "Error", msg: "Invalid e-mail." });

      // Existing e-mail
      const user = await Users.findOne({ email });
      if (user)
        return res
          .status(409) // 409: Duplicate
          .json({ status: "Error", msg: "This email already exists." });

      // Password too short
      if (password.length < 6)
        return res.status(400).json({
          status: "Error",
          msg: "Password must contain at least 6 characters.",
        });

      // Unticked reCAPTCHA
      if (!token)
        return res
          .status(400)
          .json({ status: "Error", msg: "Validate reCAPTCHA first." });

      // Failing reCAPTCHA's test
      if (!human)
        return res
          .status(400)
          .json({ status: "Error", msg: "Failed reCAPTCHA validation" });

      /*------------------- Expected behaviour ------------------*/

      // Crypting password
      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = {
        name,
        email,
        password: passwordHash,
      };

      // Token-based e-mail activation
      const activation_token = createActivationToken(newUser);

      const url = `${CLIENT_URL}/user/activate/${activation_token}`;
      sendMail(email, url, "Verify your e-mail address");

      res.json({
        status: "Success",
        msg: "Registration in progress - please verify your e-mail to proceed.",
      });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },

  /*------------- E-mail activation ------------------*/
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );

      const { name, email, password } = user;

      // Check if existing e-mail
      const check = await Users.findOne({ email });
      if (check)
        return res
          .status(409) // 409: Duplicate
          .json({ status: "Error", msg: "This e-mail already exists." });

      const newUser = new Users({
        name,
        email,
        password,
      });

      // Create account if unique e-mail
      await newUser.save();

      res.json({
        status: "Success",
        msg: "Registration successful - your account has been activated!",
      });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },

  /*---------------- Login ------------------*/
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res
          .status(400)
          .json({ status: "Error", msg: "Please fill out all fields." });

      // Check if matching e-mail
      const user = await Users.findOne({ email });
      if (!user)
        return res
          .status(404) // 404: Not found
          .json({ status: "Error", msg: "This e-mail does not exist." });

      // Comparing hashed passwords (from DB and client's login form)
      const isMatch = await bcrypt.compare(password, user.password);

      // Wrong password
      if (!isMatch)
        return res
          .status(401) // 401: Invalid credentials
          .json({ status: "Error", msg: "Incorrect password." });

      // Generate Refresh token if successful login
      const refresh_token = createRefreshToken({ id: user._id });

      // Probably pick a less self-explanatory cookie name to better secure the app
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ status: "Success", msg: "Login successful!" });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },

  /*----------------- Checking if user is logged in to generate access token --------------*/
  getAccessToken: (req, res) => {
    try {
      // Ensuring that "refreshtoken" token exists
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res
          .status(403) // 403: Forbidden access
          .json({ status: "Warning", msg: "Please log in first." });

      // Checking for token validity
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res
            .status(403) // 403: Forbidden access
            .json({ status: "Warning", msg: "Please log in first." });

        // Generate access token if valid refresh token
        const access_token = createAccessToken({ id: user.id });
        res.json({ access_token });
      });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },

  /*----------------- Forgotten password --------------*/
  forgottenPassword: async (req, res) => {
    try {
      const { email } = req.body;
      // Checking for e-mail in DB
      const user = await Users.findOne({ email });
      if (!user)
        return res
          .status(404)
          .json({ status: "Error", msg: "This e-mail does not exist." });

      const access_token = createAccessToken({ id: user._id });
      const url = `${CLIENT_URL}/user/reset/${access_token}`;

      sendMail(email, url, "Reset your password");

      res.json({
        status: "Success",
        msg: "Resetting your password, please check your e-mail (possibly spam).",
      });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },

  /*------------------ Password reset -----------------*/
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);

      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: passwordHash,
        }
      );

      res.json({ status: "Success", msg: "Password successfully reset!" });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
  /*------------------ Currently connected user's info ---------------------*/
  getUserInfo: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password"); // Getting information without password field

      res.json(user);
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },

  /*------------------- Admin panel's all users info ----------------------*/
  getAllUsersInfo: async (req, res) => {
    try {
      const users = await Users.find().select("-password");

      res.json(users);
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
  /*------------------------ Logging out user -----------------------------*/
  logout: async (req, res) => {
    try {
      /*       // Ensuring that "refreshtoken" token exists
      const test = req.cookies.refreshtoken;
      console.log(test);
      if (!test) return res.status(400).json({ msg: "Not logged in." }); */

      // If user is logged in, log out
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ status: "Success", msg: "Successful logout." });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
  /*------------------------ Edit user's info ---------------------*/
  updateUser: async (req, res) => {
    try {
      const { name, avatar } = req.body;

      if (!name || !avatar) {
        return res
          .status(400)
          .json({ status: "Error", msg: "Missing parameter(s)." });
      }

      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          name,
          avatar,
        }
      );

      res.json({ status: "Success", msg: "Updated Successfully!" });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },

  /*------------------------ Update users permissions ---------------------*/
  updateUsersRole: async (req, res) => {
    try {
      const { role } = req.body;
      const { id } = req.params;

      // Prevent unexisting role
      if (typeof role === undefined) {
        return res
          .status(400)
          .json({ status: "Error", msg: "Missing parameter." });
      }

      // Prevent unexpected role values
      if (role !== 0 && role !== 1) {
        return res.status(401).json({ status: "Error", msg: "Invalid value." });
      }

      // Matching user by id
      await Users.findOneAndUpdate(
        { _id: id },
        {
          role,
        }
      );

      res.json({ status: "Success", msg: "Update Successful!" });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
  /*------------------------ Remove user -------------------------*/
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const match = await Users.findById(id);

      //Prevent unexisting parameters
      if (!id) {
        return res
          .status(400)
          .json({ status: "Error", msg: "Missing parameter." });
      }
      if (!match) {
        return res
          .status(400)
          .json({ status: "Error", msg: "Invalid parameter." });
      }
      await Users.findByIdAndDelete(id);

      res.json({ status: "Success", msg: "Deleted Successfully!" });
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
  /*--------------------- Login with Google credentials --------------------*/
  googleLogin: async (req, res) => {
    try {
      const { tokenId } = req.body;

      const verify = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.MAILING_SERVICE_CLIENT_ID,
      });

      const { email_verified, email, name, picture } = verify.payload;

      const password = email + process.env.GOOGLE_SECRET;

      const passwordHash = await bcrypt.hash(password, 12);

      if (!email_verified)
        return res
          .status(403)
          .json({ status: "Error", msg: "E-mail verification failed." });

      const user = await Users.findOne({ email });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res
            .status(401)
            .json({ status: "Error", msg: "Password is incorrect." });

        const refresh_token = createRefreshToken({ id: user._id });
        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ status: "Success", msg: "Login successful!" });
      } else {
        const newUser = new Users({
          name,
          email,
          password: passwordHash,
          avatar: picture,
        });

        await newUser.save();

        const refresh_token = createRefreshToken({ id: newUser._id });
        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ status: "Success", msg: "Login successful!" });
      }
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
  facebookLogin: async (req, res) => {
    try {
      const { accessToken, userID } = req.body;

      const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;

      const data = await fetch(URL)
        .then((res) => res.json())
        .then((res) => {
          return res;
        });

      const { email, name, picture } = data;

      const password = email + process.env.FACEBOOK_SECRET;

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await Users.findOne({ email });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res
            .status(401)
            .json({ status: "Error", msg: "Incorrect password." });

        const refresh_token = createRefreshToken({ id: user._id });
        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ status: "Success", msg: "Login successful!" });
      } else {
        const newUser = new Users({
          name,
          email,
          password: passwordHash,
          avatar: picture.data.url,
        });

        await newUser.save();

        const refresh_token = createRefreshToken({ id: newUser._id });
        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ status: "Success", msg: "Login successful!" });
      }
    } catch (err) {
      return res.status(500).json({ status: "Error", msg: err.message });
    }
  },
};
/*--------------------- Utilities --------------------*/

// E-mail validation with regex

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// Google reCAPTCHA validation (validating the frontend's generated token through Google's API)
async function validateHuman(token) {
  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCHA_SECRET}&response=${token}`
  );
  const { success } = res.data; // True if human user
  return success;
}

// Token to conclude registration process

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m", // User has 5 minutes to validate registration
  });
};

// Tokens to access resource server

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

//

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = userCtrl;

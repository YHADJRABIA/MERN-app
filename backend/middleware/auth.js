const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Request header should contain key-value: Authorisation-refreshtoken
    const token = req.header("Authorization");
    if (!token)
      return res
        .status(401)
        .json({ status: "Error", msg: "Invalid Credentials." });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        return res
          .status(401)
          .json({ status: "Error", msg: "Invalid Credentials." });

      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

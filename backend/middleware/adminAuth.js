const Users = require("../models/user.model");

module.exports = async (req, res, next) => {
  try {
    // Matching user by id
    const user = await Users.findOne({ _id: req.user.id });

    // Check permissions of matched user — 0: user, 1: admin
    if (![1, 2].includes(user.role))
      return res
        .status(403) // 403: Forbidden access
        .json({ status: "Error", msg: "Invalid admin permission." });

    next();
  } catch (err) {
    return res.status(500).json({ status: "Error", msg: err.message });
  }
};

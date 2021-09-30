import React, { useState } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import useShowPassword from "../hooks/useShowPassword";
import Animation from "../components/Animations/Animation";

// Notifications
import { ToastContainer } from "react-toastify";
import { notify } from "../utils/Notification";

import { isLength, isMatch } from "../utils/Validators";

const initialState = {
  password: "",
  confirm_password: "",
  err: "",
  success: "",
};

const ResetPassword = () => {
  const [passwordInputType, toggleIcon] = useShowPassword();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialState);
  const history = useHistory();
  const { token } = useParams(); // Needed for Authorization header since backend route is protected by auth middleware

  const { password, confirm_password, err, success } = data;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, err: "", success: "" });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isLength(password)) {
      let msg = "Password must be at least 6 characters long.";
      notify("error", msg);
      return setData({
        ...data,
        err: msg,
        success: "",
      });
    }

    if (!isMatch(password, confirm_password)) {
      let msg = "Passwords did not match.";
      notify("error", msg);
      return setData({ ...data, err: msg, success: "" });
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "/user/reset",
        { password },
        {
          headers: { Authorization: token },
        }
      );
      setLoading(false);
      setTimeout(() => history.push("/login"), 1500);
      notify("success", res.data.msg);
      return setData({ ...data, err: "", success: res.data.msg });
    } catch (err) {
      notify("error", err.response.data.msg);
      setLoading(false);
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };
  return (
    <div className="form_card">
      <ToastContainer limit={3} />
      <h2 className="form_title">Reset password</h2>
      <form>
        <div className="form-field">
          <i className="fas fa-unlock"></i>
          <input
            type={passwordInputType}
            id="password"
            name="password"
            placeholder="Your password"
            onChange={handleChangeInput}
            value={password}
          ></input>
          <label htmlFor="password">New password</label>
          <span className="password-toggler">{toggleIcon}</span>
        </div>
        <div className="form-field">
          <i className="fas fa-unlock"></i>
          <input
            type={passwordInputType}
            id="confirm_password"
            name="confirm_password"
            placeholder="Confirm your password"
            onChange={handleChangeInput}
            value={confirm_password}
          ></input>
          <label htmlFor="confirm_password">New password confirmation</label>
        </div>

        <div className="form-actions">
          <button className="primary-button" onClick={handleResetPassword}>
            {!loading ? (
              `Reset password`
            ) : (
              <Animation content={"Resetting password..."} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

import React, { useState } from "react";
import axios from "axios";
import { isEmail } from "../utils/Validators";

// Norifications
import { ToastContainer } from "react-toastify";
import { notify } from "../utils/Notification";

import Animation from "../components/Animations/Animation";

const initialState = {
  email: "",
  err: "",
  success: "",
};

const ForgottenPassword = () => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { email, err, success } = data;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, err: "", success: "" });
  };

  const submitForgottenPassword = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) {
      let msg = "Invalid email.";
      notify("error", msg);
      return setData({ ...data, err: msg, success: "" });
    }

    try {
      setLoading(true);
      const res = await axios.post("/user/forgotten", { email });
      notify("success", res.data.msg);
      setLoading(false);
      return setData({ ...data, err: "", success: res.data.msg });
    } catch (err) {
      setLoading(false);
      notify("error", err.response.data.msg);
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <div className="form_card">
      <h2 className="form_title">Forgot your password?</h2>
      <ToastContainer limit={3} />

      <form>
        <h4>Provide your e-mail address to reset your password</h4>
        <div className="form-field">
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="email@domain.com"
            onChange={handleChangeInput}
            value={email}
          />
          <label htmlFor="email">Email Address</label>
        </div>
        <button className="primary-button" onClick={submitForgottenPassword}>
          {!loading ? (
            `Verify your e-mail`
          ) : (
            <Animation content={"Processing..."} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgottenPassword;

// Hooks
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import useShowPassword from "../hooks/useShowPassword";
import ReCAPTCHA from "react-google-recaptcha";

import Loading from "../components/Animations/Loading";

import axios from "axios";

// Validators
import { isEmpty, isEmail, isLength, isMatch } from "../utils/Validators";

// Norifications
import { ToastContainer } from "react-toastify";
import { notify } from "../utils/Notification";

import Animation from "../components/Animations/Animation";

// Stores

const initialState = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  err: "",
  success: "",
};

const Register = () => {
  const auth = useSelector((state) => state.auth);
  const { isLoggedIn, isLoading } = auth;
  const [loading, setLoading] = useState(false);
  const [passwordInputType, toggleIcon] = useShowPassword();
  const [user, setUser] = useState(initialState);
  const [token, setToken] = useState(); //reCAPTCHA's token (sent to backend to be validated by Google)

  const { name, email, password, confirm_password, err, success } = user;
  const reCaptchaRef = useRef();

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, err: "", success: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //const token = await reCaptchaRef.current.executeAsync();

    // Empty fields
    if (isEmpty(name) || isEmpty(password)) {
      let msg = "Please fill out all fields.";
      notify("error", msg);
      return setUser({
        ...user,
        err: msg,
        success: "",
      });
    }
    // Wrong e-mail format
    if (!isEmail(email)) {
      let msg = "Invalid e-mail.";
      notify("error", msg);
      return setUser({
        ...user,
        err: msg,
        success: "",
      });
    }
    // Password too short
    if (isLength(password)) {
      let msg = "Password must be at least 6 characters long.";
      notify("error", msg);
      return setUser({
        ...user,
        err: msg,
        success: "",
      });
    }

    // Passwords not matching
    if (!isMatch(password, confirm_password)) {
      let msg = "Passwords did not match.";
      notify("error", msg);
      return setUser({
        ...user,
        err: msg,
        success: "",
      });
    }

    // No reCAPTCHA ticked
    if (!token) {
      let msg = "Invalid reCAPTCHA.";
      notify("error", msg);
      return setUser({
        ...user,
        err: msg,
        success: "",
      });
    }

    try {
      setLoading(true);
      const res = await axios.post("/user/register", {
        name,
        email,
        password,
        token,
      });
      setUser({ ...user, err: "", success: res.data.msg });
      notify("success", res.data.msg);
      setToken("");
      setLoading(false);
      localStorage.setItem("firstLogin", true);
    } catch (err) {
      setLoading(false);
      notify("error", err.response.data.msg);
      err.response.data.msg &&
        setUser({
          ...user,
          err: err.response.data.msg,
          success: "",
        });
    }
  };

  /*   if (isLoading) return <Loading />; */

  // Forced redirection if user is already logged in
  return isLoggedIn ? (
    <Redirect to="/dashboard" />
  ) : (
    <div className="form_card">
      <h2 className="form_title">Register</h2>

      <ToastContainer limit={3} />

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <i className="fas fa-user"></i>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Smith"
            onChange={handleChangeInput}
            value={name}
          />
          <label htmlFor="name">Name</label>
        </div>
        <div className="form-field">
          <i className="fas fa-envelope"></i>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="email@domain.com"
            onChange={handleChangeInput}
            value={email}
          />
          <label htmlFor="email">Email Address</label>
        </div>

        <div className="form-field">
          <i className="fas fa-lock"></i>
          <input
            type={passwordInputType}
            id="password"
            name="password"
            placeholder="Your password"
            onChange={handleChangeInput}
            value={password}
          ></input>
          <label htmlFor="password">Password</label>
          <span className="password-toggler">{toggleIcon}</span>
        </div>
        <div className="form-field">
          <i className="fas fa-lock"></i>
          <input
            type={passwordInputType}
            id="confirm_password"
            name="confirm_password"
            placeholder="Confirm your password"
            onChange={handleChangeInput}
            value={confirm_password}
          ></input>
          <label htmlFor="confirm_password">Password confirmation</label>
        </div>

        <div className="form-actions">
          <ReCAPTCHA
            sitekey="6Ld6NRMcAAAAALHLK5rZAfv1Y2xH1H-k9zaOQ8nc"
            ref={reCaptchaRef}
            onChange={(token) => setToken(token)}
            onExpired={(e) => setToken("")}
          />
          <button className="primary-button" type="submit">
            {!loading ? (
              `Register`
            ) : (
              <Animation content={"Creating account..."} />
            )}
          </button>
        </div>
      </form>

      <p className="form-suggestion">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { Link, Redirect, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

// Social media login
import { GoogleLogin } from "react-google-login";
import FacebookLogin from "react-facebook-login";

// Notifications
import { ToastContainer } from "react-toastify";
import { notify } from "../utils/Notification";

// Hooks
import useShowPassword from "../hooks/useShowPassword";

// Animations
import Animation from "../components/Animations/Animation";

// Global state
import { dispatchLogin } from "../redux/actions/authAction";

import { isEmail, isEmpty, isLength } from "../utils/Validators";

const initialState = {
  email: "",
  password: "",
  err: "",
  success: "",
};

const Login = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [user, setUser] = useState(initialState);
  const [passwordInputType, toggleIcon] = useShowPassword();

  const auth = useSelector((state) => state.auth);
  const { isLoggedIn, isLoading } = auth;

  const [loading, setLoading] = useState(false);

  const { email, password, err, success } = user;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, err: "", success: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); //Prevents page from refreshing

    // Empty fields
    if (isEmpty(password)) {
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

    // Sending request to server
    await axios
      .post("/user/login", { email, password })
      .then((res) => {
        setUser({ ...user, err: "", success: res.data.msg });
        notify("success", res.data.msg);
        localStorage.setItem("firstLogin", true);
        dispatch(dispatchLogin());
        setLoading(false);
        history.push("/dashboard");
      })
      .catch((err) => {
        notify("error", err.response.data.msg);
        setLoading(false);
        err.response.data.msg &&
          setUser({
            ...user,
            err: err.response.data.msg,
            success: "",
          });
      });
  };

  const responseGoogle = async (response) => {
    try {
      const res = await axios.post("/user/google_login", {
        tokenId: response.tokenId,
      });
      setUser({ ...user, err: "", success: res.data.msg });
      localStorage.setItem("firstLogin", true);
      dispatch(dispatchLogin());
      history.push("/dashboard"); // Login redirection
    } catch (err) {
      err.response.data.msg &&
        setUser({
          ...user,
          err: err.response.data.msg,
          success: "",
        });
    }
  };

  const responseFacebook = async (response) => {
    try {
      const { accessToken, userID } = response;
      const res = await axios.post("/user/facebook_login", {
        accessToken,
        userID,
      });

      setUser({ ...user, error: "", success: res.data.msg });
      localStorage.setItem("firstLogin", true);

      dispatch(dispatchLogin());
      history.push("/");
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };

  // Forced redirection if user is already logged in
  return isLoggedIn ? (
    <Redirect to="/dashboard" />
  ) : (
    <div className="form_card">
      <ToastContainer limit={3} />

      <h2 className="form_title">Login</h2>

      <form onSubmit={handleSubmit}>
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
          <i className="test fas fa-lock"></i>
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

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            {!loading ? `Login` : <Animation content={"Signing in..."} />}
          </button>
          <Link to="/forgot_password">Forgot your password?</Link>
        </div>
      </form>
      <div className="login-alternatives">
        Or:
        <GoogleLogin
          clientId="944374759196-h78gqk3cavgl1q3jble643587ebgd110.apps.googleusercontent.com"
          buttonText="Login with Google"
          onSuccess={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />
        <FacebookLogin
          appId="351712043119511"
          autoLoad={false}
          fields="name,email,picture"
          callback={responseFacebook}
        />
      </div>
      <p className="form-suggestion">
        No account yet? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;

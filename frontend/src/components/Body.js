import React from "react";
import { useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom"; //Router

// Components
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmailActivation from "../pages/EmailActivation";
import ForgottenPassword from "../pages/ForgottenPassword";
import PageNotFound from "../pages/PageNotFound";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import EditUser from "../pages/EditUser";

const Body = () => {
  const auth = useSelector((state) => state.auth);
  const { isLoggedIn, isAdmin } = auth;
  return (
    <main>
      <Switch>
        <Route path={["/", "/home"]} exact component={Home} />
        <Route path={"/login"} component={isLoggedIn ? Profile : Login} exact />
        <Route
          path={"/forgot_password"}
          component={isLoggedIn ? Profile : ForgottenPassword}
          exact
        />
        <Route
          path={"/user/reset/:token"}
          component={isLoggedIn ? Profile : ResetPassword}
          exact
        />
        <Route
          path={"/register"}
          component={isLoggedIn ? Profile : Register}
          exact
        />
        <Route
          path={"/dashboard"}
          component={isLoggedIn ? Profile : Home}
          exact
        />
        <Route
          path={"/edit_user/:id"}
          component={isAdmin ? EditUser : Home}
          exact
        />
        <Route
          path={"/user/activate/:activation_token"}
          component={EmailActivation}
          exact
        />
        <Route path={"/*"} component={PageNotFound} />
      </Switch>
    </main>
  );
};

export default Body;

// Styles
import "react-toastify/dist/ReactToastify.css";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import "./styles/app.scss";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  dispatchLogin,
  fetchUser,
  dispatchGetUser,
} from "./redux/actions/authAction";
import { BrowserRouter as Router } from "react-router-dom"; //Router

import axios from "axios";

// Contexts
import { DataProvider } from "./contexts/DataContext";

// Components
import Header from "./components/Header/Header";
import Nav from "./components/Header/Nav/Nav";
import Body from "./components/Body";
import Footer from "./components/Footer/Footer";

// Pages

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    // If user has previously logged in ► auto login through refresh token
    const firstLogin = localStorage.getItem("firstLogin");
    if (firstLogin) {
      const getToken = async () => {
        const res = await axios.post("/user/refresh_token", null);
        dispatch({ type: "GET_TOKEN", payload: res.data.access_token });
      };
      getToken();
    }
  }, [auth.isLoggedIn, dispatch]);

  useEffect(() => {
    if (token) {
      const getUser = () => {
        dispatch(dispatchLogin());

        return fetchUser(token).then((res) => {
          dispatch(dispatchGetUser(res));
        });
      };
      getUser();
    }
  }, [token, dispatch]);

  return (
    <>
      <DataProvider>
        <Router>
          <Nav />
          <Body />
          <Footer />
        </Router>
      </DataProvider>
    </>
  );
}

export default App;

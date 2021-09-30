import React from "react";
import { Redirect } from "react-router-dom";
//import { useAuth } from "../authentication/useAuth";

//import Loading from "../components/Loading";

//import Login from "./Login";

const Home = () => {
  /*   const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) return <Loading />;
  return isLoggedIn ? <Redirect to="/browse" /> : <Login />; */

  return <p>Homepage</p>;
};
export default Home;

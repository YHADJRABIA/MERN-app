import React from "react";
import { BrowserRouter as Redirect, Route } from "react-router-dom";
import { useAuth } from "../authentication/useAuth";

// Restrict access to non-logged-in users
export const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading)
    return <div className="loading-animation">{/* Loading animation */}</div>;
  return isLoggedIn ? (
    // If logged-in user: component renders correctly
    <Route {...rest} render={(props) => <Component {...props} />} />
  ) : (
    // Else forced redirect
    <Redirect to="/" />
  );
};

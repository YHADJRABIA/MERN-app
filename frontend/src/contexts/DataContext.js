import React, { useState, createContext } from "react";
import { useAuth } from "../hooks/useAuth";

// Envoi de requêtes serveur
import Axios from "axios";
Axios.defaults.withCredentials = true;

/*To be imported by components that want to access the data.
The components need to also import { useContext} from react to consume the data.*/
export const DataContext = createContext();

// Contient les données. Doit être importé par App.js.
export const DataProvider = ({ children }) => {
  const content = {
    navItems: [
      {
        title: "Home",
        url: "/",
        cName: "nav-links",
      },
      {
        title: "Services",
        url: "#",
        cName: "nav-links",
      },
      {
        title: "Products",
        url: "#",
        cName: "nav-links",
      },
    ],
    navLoggedIn: [
      {
        title: "Sign out",
        url: "/",
        cName: "nav-links",
      },
    ],
    navLoggedOut: [
      {
        title: "Sign in",
        url: "/login",
        cName: "nav-links",
      },
      {
        title: "Sign up",
        url: "/register",
        cName: "nav-links",
      },
    ],
  };
  return (
    <DataContext.Provider value={content}>{children}</DataContext.Provider>
  );
};

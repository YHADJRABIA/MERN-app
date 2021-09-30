import { useState, useEffect, useContext } from "react";
import Axios from "axios";
import UserContext from "../contexts/UserContext";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userContext = useContext(UserContext);
  const { setCurrentUser, currentUser } = userContext;

  useEffect(() => {
    Axios.get("/user/is-logged-in", {
      withCredentials: true,
    })
      .then((res) => {
        setIsLoggedIn(true);
        setIsLoading(false);
        setCurrentUser(res.data.currentUser);
      })
      .catch(() => {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
      });
  }, [setCurrentUser]);

  return { isLoggedIn, isLoading, currentUser };
};

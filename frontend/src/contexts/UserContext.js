import { createContext } from "react";

export default createContext({
  currentUser: null,
  setCurrentUser: () => {},
});

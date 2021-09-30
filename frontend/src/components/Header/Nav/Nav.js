import axios from "axios";
import React, { useState, useContext, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect, useHistory, Link } from "react-router-dom";
import { DataContext } from "../../../contexts/DataContext";

/* Components */
import BurgerMenu from "./BurgerMenu";

const Nav = () => {
  const auth = useSelector((state) => state.auth);
  const { user, isLoggedIn } = auth;
  const history = useHistory();
  const menuRef = useRef(); // To detect if clicks are made outside of the menu and close the menu

  const { navItems, navLoggedOut } = useContext(DataContext);
  const [toggled, setToggled] = useState(false);
  const [navbar, setNavbar] = useState(false);

  // Subscribing to events when components mounts then unsubscribing if component unmounts
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    window.addEventListener("scroll", toggleBackground);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      window.addEventListener("scroll", toggleBackground);
    };
  });

  /* Modifies nav's background if user's verical scroll >= height of nav */
  const toggleBackground = () => {
    window.scrollY >= 80 ? setNavbar(true) : setNavbar(false);
  };

  // Closes menu if user clicks outside of menu
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setToggled(false);
    }
  };

  /*   useEffect(() => {


    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []); */

  const handleLogout = async () => {
    try {
      await axios.get("/user/logout");
      localStorage.removeItem("firstLogin");
      window.location.href = "/"; // Refreshes the page contrary to Redirect and History
    } catch (err) {
      <Redirect to="/" />;
    }
  };

  return (
    <nav ref={menuRef} className={`NavItems ${navbar ? "active" : ""}`}>
      <div className="nav-logo">
        <Link to="/">
          <h2>My logo</h2> <i className="fab fa-react"></i>
        </Link>
      </div>

      {/*--- Phone only ---*/}
      <BurgerMenu toggled={toggled} setToggled={setToggled} />
      {/*--------*/}

      <ul className={`nav-menu ${toggled ? "active" : ""}`}>
        {navItems.map((item, id) => (
          <li key={id}>
            <Link to={item.url} title={item.title} className={item.cName}>
              {item.title}
            </Link>
          </li>
        ))}

        {isLoggedIn ? (
          // Only displays if user is logged in
          <div className="logged-section">
            <li>
              {/* Avatar */}
              <Link
                to="/dashboard"
                title="Dashboard"
                className="nav-avatar nav-links"
              >
                <img
                  className="nav-user-avatar"
                  src={user.avatar}
                  alt="User avatar"
                />
                <small className="nav-user-avatar-text">{user.name}</small>
              </Link>
            </li>

            <li>
              <Link
                to="/"
                onClick={handleLogout}
                title="Sign out"
                className="nav-links"
              >
                Sign out
              </Link>
            </li>
          </div>
        ) : (
          <div className="logged-section">
            {navLoggedOut.map((item, id) => (
              <li key={id}>
                <Link to={item.url} title={item.title} className={item.cName}>
                  {item.title}
                </Link>
              </li>
            ))}
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Nav;

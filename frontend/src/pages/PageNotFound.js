import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

// SVG

import { ReactComponent as ReactLogo } from "../resources/svg/404.svg";

const PageNotFound = () => {
  const [counter, setCounter] = useState(3);
  const history = useHistory();

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      setTimeout(() => {
        setCounter(counter - 1);
      }, 1000);
    }

    if (counter === 0) {
      history.push("/");
    }
    // Should unsubscribe to counter
    return () => {
      isMounted = false;
    };
  }, [counter]);

  return (
    <div className="page-not-found">
      <h2> Page not found</h2>
      <ReactLogo />
      <h3>Redirection in {counter} sec...</h3>
    </div>
  );
};

export default PageNotFound;

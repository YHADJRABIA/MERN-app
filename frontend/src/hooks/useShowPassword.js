import React, { useState } from "react";

// Toggles visibility of password field
const useShowPassword = () => {
  const [visible, setVisible] = useState(false);

  // Modifies font-awesome's icon based on vibility
  const icon = (
    <i
      className={`fas ${visible ? `fa-eye` : `fa-eye-slash`}`}
      onClick={() => setVisible(!visible)}
    ></i>
  );

  // If visible password: input type = text otherwise password (••••)
  const inputType = visible ? "text" : "password";

  return [inputType, icon];
};

export default useShowPassword;

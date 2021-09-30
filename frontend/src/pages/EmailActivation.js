import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

// Notifications
import { ToastContainer } from "react-toastify";
import { notify } from "../utils/Notification";

// SVG
import { ReactComponent as ReactLogoSucc } from "../resources/svg/confirmed-email.svg";
import { ReactComponent as ReactLogoErr } from "../resources/svg/warning.svg";

// @ROUTE /user/activate/:activation_token
const EmailActivation = () => {
  const { activation_token } = useParams(); // Extracts token from page's address
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (activation_token) {
      const activateEmail = async () => {
        try {
          const res = await axios.post("/user/activation", {
            activation_token,
          });
          setSuccess(res.data.msg);
          notify("success", success);
        } catch (err) {
          if (err.response.data.msg) {
            setErro(err.response.data.msg);
            notify("error", err.response.data.msg);
            console.log(err);
          }
        }
      };
      activateEmail();
    }
  }, [activation_token]);

  return (
    <div className="page-email-activation">
      <h2> Account activation</h2>
      <ToastContainer autoClose={false} />
      {erro ? <ReactLogoErr /> : <ReactLogoSucc />}
    </div>
  );
};

export default EmailActivation;

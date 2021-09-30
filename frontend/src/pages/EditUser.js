import React, { useState, useEffect } from "react";
import { useParams, useHistory, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

// Notifications
import { ToastContainer } from "react-toastify";
import { notify } from "../utils/Notification";

function EditUser() {
  const { id } = useParams();
  const history = useHistory();
  const [editUser, setEditUser] = useState([]);

  const users = useSelector((state) => state.users);
  const token = useSelector((state) => state.token);

  const [checkAdmin, setCheckAdmin] = useState(false);
  const [err, setErr] = useState(false);
  const [success, setSuccess] = useState(false);
  const [num, setNum] = useState(0);

  useEffect(() => {
    if (users.length !== 0) {
      users.forEach((user) => {
        if (user._id === id) {
          setEditUser(user);
          setCheckAdmin([1, 2].includes(user.role) ? true : false);
        }
      });
    } else {
      // Security redirect if user is not admin
      <Redirect to="/dashboard" />;
    }
  }, [users, id, history]);

  const handleUpdate = async () => {
    try {
      if (num % 2 !== 0) {
        const res = await axios.patch(
          `/user/update_role/${editUser._id}`,
          {
            role: checkAdmin ? 1 : 0,
          },
          {
            headers: { Authorization: token },
          }
        );

        setSuccess(res.data.msg);
        setNum(0);
        setTimeout(() => {
          history.push("/dashboard");
        }, 1000);
      }
    } catch (err) {
      err.response.data.msg && setErr(err.response.data.msg);
    }
  };

  const handleCheck = () => {
    setSuccess("");
    setErr("");
    setCheckAdmin(!checkAdmin);
    setNum(num + 1);
  };

  return (
    <div className="edit-user-page">
      <ToastContainer limit={3} />
      <div className="go-back">
        <button className="secondary-button" onClick={() => history.goBack()}>
          <i className="fas fa-long-arrow-alt-left"></i> Go Back
        </button>
      </div>

      <form className="form_card">
        <h2>Edit User</h2>
        <div className="form-field">
          <input
            type="text"
            name="name"
            defaultValue={editUser.name}
            disabled
          />
          <label htmlFor="name">Name</label>
        </div>

        <div className="form-field">
          <input
            type="email"
            name="email"
            defaultValue={editUser.email}
            disabled
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="form-field">
          <input
            type="checkbox"
            id="isAdmin"
            checked={checkAdmin}
            onChange={handleCheck}
          />
          <label htmlFor="isAdmin">Admin</label>
        </div>

        <button className="primary-button" onClick={handleUpdate}>
          Update
        </button>
      </form>
    </div>
  );
}

export default EditUser;

import React, { useState, useEffect } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { isLength, isMatch } from "../utils/Validators";

// Notifications
import { ToastContainer } from "react-toastify";
import { notify } from "../utils/Notification";

import {
  fetchAllUsers,
  dispatchGetAllUsers,
} from "../redux/actions/usersAction";
import Animation from "../components/Animations/Animation";

const initialState = {
  name: "",
  password: "",
  confirm_password: "",
  err: "",
  success: "",
};

const Profile = () => {
  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);
  const users = useSelector((state) => state.users);

  const { user, isAdmin } = auth;
  const [data, setData] = useState(initialState);
  const { name, password, confirm_password, err, success } = data;

  const [avatar, setAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callback, setCallback] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers(token).then((res) => {
        dispatch(dispatchGetAllUsers(res));
      });
    }
  }, [token, isAdmin, dispatch, callback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, err: "", success: "" });
  };

  const changeAvatar = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];

      if (!file) {
        let msg = "No files were uploaded.";
        notify("error", msg);
        return setData({
          ...data,
          err: msg,
          success: "",
        });
      }

      if (file.size > 1024 * 1024) {
        let msg = "File is too large";
        notify("error", msg);
        return setData({ ...data, err: msg, success: "" });
      }

      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        let msg = "Only .png and .jpeg formats are accepted.";
        notify("error", msg);
        return setData({
          ...data,
          err: msg,
          success: "",
        });
      }

      let formData = new FormData();
      formData.append("file", file);

      setLoading(true);
      const res = await axios.post("/api/upload_avatar", formData, {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: token,
        },
      });
      let msg = "Successful upload.";
      notify("success", msg);
      setLoading(false);
      setAvatar(res.data.url);
    } catch (err) {
      notify("error", err.response.data.msg);
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  const updateInfo = () => {
    setLoading(true);
    try {
      axios.patch(
        "/user/update",
        {
          name: name ? name : user.name,
          avatar: avatar ? avatar : user.avatar,
        },
        {
          headers: { Authorization: token },
        }
      );
      let msg = "Successfully updated!";
      notify("success", msg);
      setData({ ...data, err: "", success: msg });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      notify("error", err.response.data.msg);
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  const updatePassword = () => {
    if (isLength(password)) {
      let msg = "Password must be at least 6 characters long.";
      notify("error", msg);
      return setData({
        ...data,
        err: msg,
        success: "",
      });
    }

    if (!isMatch(password, confirm_password)) {
      let msg = "Passwords did not match.";
      notify("error", msg);
      return setData({ ...data, err: msg, success: "" });
    }

    try {
      setLoading(true);
      axios.post(
        "/user/reset",
        { password },
        {
          headers: { Authorization: token },
        }
      );
      let msg = "Successfully updated!";
      notify("success", msg);
      setData({ ...data, err: "", success: msg });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      notify("error", err.response.data.msg);
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  const handleUpdate = () => {
    if (name || avatar) updateInfo();
    if (password) updatePassword();
  };

  const handleDelete = async (id) => {
    try {
      // Unable to auto-delete own account
      if (user._id === id) {
        window.alert("You cannot delete your own account.");
      }
      if (user._id !== id) {
        if (window.confirm("Are you sure you want to delete this account?")) {
          await axios.delete(`/user/delete/${id}`, {
            headers: { Authorization: token },
          });
          notify("success", "Account deleted.");
          setCallback(!callback);
        }
      }
    } catch (err) {
      notify("error", err.response.data.msg);
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <div className="profile-page">
      <ToastContainer limit={3} />

      {/* User section */}

      <div className="profile-page-user">
        <h2 className="profile-type">
          {isAdmin ? "Admin Profile" : "User Profile"}
        </h2>

        <div className="profile-page-avatar">
          <img src={avatar ? avatar : user.avatar} alt="Avatar" />
          <span>
            <i className="fas fa-camera"></i>
            <p>Edit avatar</p>
            <input
              type="file"
              name="file"
              id="avatar-upload"
              onChange={changeAvatar}
            />
          </span>
        </div>
        <form>
          <div className="form-field">
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={user.name}
              placeholder="Your name"
              onChange={handleChange}
            />
            <label htmlFor="name">Name</label>
          </div>

          <div className="form-field">
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={user.email}
              placeholder="Your email address"
              disabled
            />
            <label htmlFor="email">E-mail</label>
          </div>

          <div className="form-field">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Your password"
              value={password}
              onChange={handleChange}
            />
            <label htmlFor="password">New password</label>
          </div>
          <div className="form-field">
            <input
              type="password"
              name="confirm_password"
              id="confirm_password"
              placeholder="Confirm password"
              value={confirm_password}
              onChange={handleChange}
            />
            <label htmlFor="confirm_password">Confirm new password</label>
          </div>
        </form>

        <div className="profile-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <p>
            If you update your password here, loging in via Google and Facebook
            may not be possible.
          </p>
        </div>

        <button
          className="primary-button"
          disabled={loading}
          onClick={handleUpdate}
        >
          {!loading ? `Update` : <Animation content={"Updating..."} />}
        </button>
      </div>

      {/* Table section – lists users privileges if admin or orders if user*/}

      <div className="profile-page-list">
        <h2>{isAdmin ? "Users" : "My Orders"}</h2>

        {/* <div style={{ overflowX: "auto" }}> */}
        <Table className="profile-page-table">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Admin</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user._id}>
                <Td>{user._id}</Td>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td className="table-center-col">
                  {[1, 2].includes(user.role) ? (
                    <i className="fas fa-check" title="Admin"></i>
                  ) : (
                    <i className="fas fa-times" title="User"></i>
                  )}
                </Td>
                <Td className="table-center-col">
                  <Link to={`/edit_user/${user._id}`}>
                    <i className="fas fa-edit" title="Edit"></i>
                  </Link>
                  <i
                    className="fas fa-trash-alt"
                    title="Remove"
                    onClick={() => {
                      handleDelete(user._id);
                    }}
                  ></i>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {/*         </div> */}
      </div>
    </div>
  );
};

export default Profile;

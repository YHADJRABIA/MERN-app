// Form validator

export const isEmpty = (value) => {
  if (!value) return true;
  return false;
};

export const isEmail = (email) => {
  // eslint-disable-next-line
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const isLength = (password) => {
  if (password.length < 6) return true;
  return false;
};

export const isMatch = (password, confirm_password) => {
  if (password === confirm_password) return true;
  return false;
};

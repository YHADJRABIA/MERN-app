const routes = [
  {
    path: ["/", "/home"],
    component: "Login",
    exact: false,
  },
  {
    path: "/login",
    component: "Login",
    exact: true,
  },
  {
    path: "/register",
    component: "Register",
    exact: true,
  },
  {
    path: "/user/activate/:activation_token",
    component: "EmailActivation",
    exact: true,
  },
];

export default routes;

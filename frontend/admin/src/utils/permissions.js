export const getUser = () => {
  return JSON.parse(localStorage.getItem("user") || "{}");
};

export const hasPermission = (module, action) => {

  const user = JSON.parse(localStorage.getItem("user") || "{}");


  if (user?.role === "admin") return true;

  const modulePermissions = user?.permissions?.[module];

  if (!modulePermissions) return false;

  return modulePermissions[action] === true;
};
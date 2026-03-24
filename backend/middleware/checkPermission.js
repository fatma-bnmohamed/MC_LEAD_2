module.exports = (module, action) => {
  return (req, res, next) => {

    console.log("USER IN BACKEND:", req.user);
    console.log("CHECK:", module, action);
    console.log("PERMISSIONS:", req.user.permissions);

    if (req.user.role === "admin") return next();

    const permissions = req.user.permissions;

    if (!permissions?.[module]?.[action]) {
      console.log("DENIED ❌");
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("AUTHORIZED ✅");
    next();
  };
};
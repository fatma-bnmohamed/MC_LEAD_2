module.exports = (roles) => {

  return (req, res, next) => {

    const role = req.user.role;

    if (!roles.includes(role)) {
      return res.status(403).json("Access denied");
    }

    next();
  };

};

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {

  
    if (req.user.role === "admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};
const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  récupérer user + permissions depuis DB
    const result = await db.query(`
      SELECT users.id, users.username, user_groups.role, user_groups.permissions
      FROM users
      JOIN user_groups ON users.group_id = user_groups.id
      WHERE users.id = $1
    `, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = result.rows[0]; // 

    next();

  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
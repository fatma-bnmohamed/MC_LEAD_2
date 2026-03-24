const db = require("../config/db");

const getUserGroups = async () => {
  const result = await db.query("SELECT * FROM user_groups");
  return result.rows;
};

const createUserGroups = async (name, description, permissions, status) => {
  const result = await db.query(
    `INSERT INTO user_groups (name, description, permissions, status)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [name, description, permissions, status]
  );
  return result.rows[0];
};

const updateUserGroups = async (id, name, description, permissions, status) => {
  const result = await db.query(
    `UPDATE user_groups
     SET name=$1,
         description=$2,
         permissions=$3,
         status=$4,
         updated_at = NOW()
     WHERE id=$5
     RETURNING *`,
    [name, description, permissions, status, id]
  );
  return result.rows[0];
};

const deleteUserGroups = async (id) => {
  await db.query("DELETE FROM user_groups WHERE id=$1", [id]);
};

module.exports = {
  getUserGroups,
  createUserGroups,
  updateUserGroups,
  deleteUserGroups
};
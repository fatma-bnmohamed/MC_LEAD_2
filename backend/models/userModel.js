const db = require("../config/db");

const getUsers = async () => {
  const result = await db.query(`
    SELECT users.id,
           users.username,
           users.full_name,
           users.email,
           user_groups.name AS role
    FROM users
    JOIN user_groups ON users.group_id = user_groups.id
  `);

  return result.rows;
};

const createUser = async (username, password, full_name, email, group_id) => {
  const result = await db.query(
    `INSERT INTO users (username,password,full_name,email,group_id)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [username, password, full_name, email || null, group_id]
  );

  return result.rows[0];
};

const updateUser = async (id, username, full_name, email, group_id) => {
  const result = await db.query(
    `UPDATE users
     SET username=$1,
         full_name=$2,
         email=$3,
         group_id=$4
     WHERE id=$5
     RETURNING *`,
    [username, full_name, email || null, group_id, id]
  );

  return result.rows[0];
};

const deleteUser = async (id) => {
  await db.query("DELETE FROM users WHERE id=$1", [id]);
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
const db = require("../config/db");
const bcrypt = require("bcrypt");

// Voir tous les utilisateurs
exports.getUsers = async (req, res) => {

  try {

    const result = await db.query(`
  SELECT users.id,
         users.username,
         users.full_name,
         users.email,
         users.status,
         users.is_online,
         users.is_archived,
         user_groups.name AS role
  FROM users
  LEFT JOIN user_groups ON users.group_id = user_groups.id
  WHERE users.is_archived = false
  ORDER BY users.id
`);

    res.json(result.rows);

  } catch (err) {
     res.status(500).json({
      message:"Error fetching users"
    });
  }

};


// Créer utilisateur
exports.createUser = async (req, res) => {

  const { username, password, full_name, email, role } = req.body;

  try {

    const checkUser = await db.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (checkUser.rows.length > 0) {
      return res.json({
        message: "User already exists"
      });
    }

    const roleResult = await db.query(
      "SELECT id,name FROM user_groups WHERE name=$1",
      [role]
    );

    if (roleResult.rows.length === 0) {
      return res.json({
        message: "Role not found"
      });
    }

    const role_id = roleResult.rows[0].id;
    // hash password
    const hashedPassword = await bcrypt.hash(password,10);

    const result = await db.query(
`INSERT INTO users (username,password,full_name,email,group_id)
 VALUES ($1,$2,$3,$4,$5)
 RETURNING id,username,full_name,email`,
[
username,
hashedPassword,
full_name,
email || null,
role_id
]
);

    res.json({
      message:"User created successfully",
     user:{
  id: result.rows[0].id,
  username: result.rows[0].username,
  full_name: result.rows[0].full_name,
  email: result.rows[0].email,
  role: roleResult.rows[0].name
}
    });

  } catch(err){
    res.status(500).json({error:err.message});
  }

};

// Modifier utilisateur
exports.updateUser = async (req, res) => {

  const { id } = req.params;
  const { username, full_name, email, role, status } = req.body;

  try {

    const roleResult = await db.query(
      "SELECT id,name FROM user_groups WHERE name=$1",
      [role]
    );

    if(roleResult.rows.length === 0){
      return res.json({message:"Role not found"});
    }

    const role_id = roleResult.rows[0].id;

   const result = await db.query(
  `UPDATE users
SET username=$1,
    full_name=$2,
    email=$3,
    group_id=$4,
    status=$5
WHERE id=$6
   RETURNING *`,
  [
username,
full_name,
email || null,
role_id,
status,
id
]
);

    res.json({
      message:"User updated successfully",
     user:{
  id: result.rows[0].id,
  username: result.rows[0].username,
  full_name: result.rows[0].full_name,
  email: result.rows[0].email,
  role: roleResult.rows[0].name
}
    });

  } catch(err){
    res.status(500).json({error:err.message});
  }

};

// Supprimer utilisateur
exports.deleteUser = async (req, res) => {

const { id } = req.params;

if(req.user.id == id){
return res.json({
message:"You cannot delete your own account"
});
}

try {

    // récupérer utilisateur
    const userResult = await db.query(`
      SELECT users.id,
             users.username,
             users.full_name,
             users.email,
             user_groups.name AS role
      FROM users
      LEFT JOIN user_groups ON users.group_id = user_groups.id
      WHERE users.id=$1
    `,[id]);

    if(userResult.rows.length === 0){
      return res.json({
        message:"User not found"
      });
    }

    const deletedUser = userResult.rows[0];

    // empêcher suppression du dernier admin
    if(deletedUser.role === "admin"){

      const adminCount = await db.query(`
        SELECT COUNT(*) FROM users
        LEFT JOIN user_groups ON users.group_id = user_groups.id
        WHERE user_groups.name='admin'
      `);

      if(parseInt(adminCount.rows[0].count) <= 1){
        return res.json({
          message:"Cannot delete the last admin"
        });
      }

    }

    // supprimer utilisateur
    await db.query(
      "DELETE FROM users WHERE id=$1",
      [id]
    );

    res.json({
      message:"User deleted successfully",
      deleted_user: deletedUser
    });

  } catch(err){
    console.log(err);
    res.status(500).json({
      message:"Error deleting user"
    });
  }

};




exports.resetPassword = async (req, res) => {

const { id } = req.params;
const { password } = req.body;

try {

const hashedPassword = await bcrypt.hash(password,10);

await db.query(
`UPDATE users
SET password=$1
WHERE id=$2`,
[hashedPassword,id]
);

res.json({
message:"Password updated successfully"
});

}catch(error){

console.log(error);
res.status(500).json({message:"Entrez votre nouveau mot de passe"});

}

};

exports.toggleStatus = async (req, res) => {

const { id } = req.params;
const { status } = req.body;

try{

  const userResult = await db.query(`
SELECT users.id, user_groups.name AS role
FROM users
LEFT JOIN user_groups ON users.group_id = user_groups.id
WHERE users.id=$1
`,[id]);

if(userResult.rows[0].role === "admin" && status === false){

const adminCount = await db.query(`
SELECT COUNT(*) FROM users
LEFT JOIN user_groups ON users.group_id = user_groups.id
WHERE user_groups.name='admin' AND status=true
`);

//if(adminCount.rows[0].count <= 1){
if(parseInt(adminCount.rows[0].count) <= 1){
return res.json({
message:"Cannot deactivate the last admin"
});
}

}

await db.query(
`UPDATE users
SET status=$1
WHERE id=$2`,
[status,id]
);

res.json({
message:"User status updated"
});

}catch(error){

console.log(error);
res.status(500).json({
message:"Server error"
});

}

};

// Supprimer plusieurs utilisateurs
exports.deleteManyUsers = async (req,res)=>{

const { ids } = req.body;

try{

await db.query(
`DELETE FROM users
 WHERE id = ANY($1::int[])`,
[ids]
);

res.json({
message:"Users deleted successfully",
deleted_count: ids.length
});

}catch(err){

console.log(err);

res.status(500).json({
message:"Error deleting users"
});

}

};
// Toggle status pour plusieurs utilisateurs
exports.toggleManyStatus = async (req,res)=>{

const { ids } = req.body;

try{

await db.query(
`UPDATE users
 SET status = NOT status
 WHERE id = ANY($1::int[])`,
[ids]
);

res.json({
message:"Users status toggled",
updated_count: ids.length
});

}catch(err){

console.log(err);

res.status(500).json({
message:"Error updating status"
});

}

};

exports.archiveUser = async (req, res) => {

  const { id } = req.params;

  try {
    const dbName = await db.query("SELECT current_database()");
console.log("BACKEND DB:", dbName.rows[0].current_database);

    if(req.user.id == id){
      return res.json({
        message:"You cannot archive your own account"
      });
    }

    const userResult = await db.query(`
      SELECT users.id, user_groups.name AS role
      FROM users
      LEFT JOIN user_groups ON users.group_id = user_groups.id
      WHERE users.id=$1
    `,[id]);

    if(userResult.rows.length === 0){
      return res.json({ message:"User not found" });
    }

    const user = userResult.rows[0];

    if(user.role === "admin"){
      const adminCount = await db.query(`
        SELECT COUNT(*) FROM users
        LEFT JOIN user_groups ON users.group_id = user_groups.id
        WHERE user_groups.name='admin'
        AND is_archived=false
      `);

      if(parseInt(adminCount.rows[0].count) <= 1){
        return res.json({
          message:"Cannot archive the last admin"
        });
      }
    }

    // ✅ IMPORTANT: vérifier UPDATE
    const result = await db.query(`
      UPDATE users
      SET is_archived = true
      WHERE id=$1
      RETURNING *
    `,[id]);

    console.log("UPDATED USER:", result.rows);

    return res.json({ success: true });

  } catch(err){
    console.log("ARCHIVE ERROR:", err);
    return res.status(500).json({ message:"Server error" });
  }
};

exports.archiveManyUsers = async (req,res)=>{

  const { ids } = req.body;

  try{

    // 🔴 retirer user connecté
    const filteredIds = ids.filter(id => id != req.user.id);

    if(filteredIds.length === 0){
      return res.json({
        message:"Cannot archive your own account"
      });
    }

    // 🔍 récupérer les rôles des users sélectionnés
    const users = await db.query(`
      SELECT users.id, user_groups.name AS role
      FROM users
      LEFT JOIN user_groups ON users.group_id = user_groups.id
      WHERE users.id = ANY($1::int[])
    `,[filteredIds]);

    const adminIds = users.rows
      .filter(u => u.role === "admin")
      .map(u => u.id);

    // 🔴 vérifier nombre total admins actifs
    const adminCount = await db.query(`
      SELECT COUNT(*) FROM users
      LEFT JOIN user_groups ON users.group_id = user_groups.id
      WHERE user_groups.name='admin'
      AND is_archived=false
    `);

    const totalAdmins = parseInt(adminCount.rows[0].count);

    // 🔴 si on va supprimer tous les admins
    if(adminIds.length > 0 && totalAdmins - adminIds.length < 1){
      return res.json({
        message:"Cannot archive the last admin"
      });
    }

    // ✅ archive
    await db.query(`
      UPDATE users
      SET is_archived = true
      WHERE id = ANY($1::int[])
    `,[filteredIds]);

    res.json({
      message:"Users archived successfully",
      count: filteredIds.length
    });

  }catch(err){
    console.log(err);
    res.status(500).json({
      message:"Server error"
    });
  }

};
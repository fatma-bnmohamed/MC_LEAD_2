const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {

  const { username, password } = req.body;
  if(!username || !password){
return res.status(400).json({message:"Username and password required"});
}

  try {
console.log("USERNAME:", username);
  const result = await db.query(`
  SELECT 
    users.id,
    users.username,
    users.password,
    users.status,
    users.is_archived,
    users.group_id,
    user_groups.role,
    user_groups.permissions
  FROM users
  LEFT JOIN user_groups ON users.group_id = user_groups.id
  WHERE users.username = $1
`, [username]);
console.log("RESULT:", result.rows);
console.log(JSON.stringify(result.rows, null, 2));

    // user not found
    if(result.rows.length === 0){
      return res.status(404).json({message:"Identifiants invalides, merci de contacter votre administrateur"});
    }

    const user = result.rows[0];
    //  USER ARCHIVED
if(user.is_archived){
  return res.status(403).json({
    message:"Identifiants invalides, merci de contacter votre administrateur"
  });
}

    // user inactive
    if(!user.status){
      return res.status(403).json({message:"Identifiants invalides, merci de contacter votre administrateur"});
    }

    // check password
    const validPassword = await bcrypt.compare(password,user.password);

    if(!validPassword){
      return res.status(401).json({message:"Identifiants invalides, merci de contacter votre administrateur"});
    }

    if(user.is_archived){
  return res.json({
    message:"Identifiants invalides, merci de contacter votre administrateur"
  });
}
// créer session de connexion
const session = await db.query(
`INSERT INTO user_sessions (user_id)
 VALUES ($1)
 RETURNING id`,
[user.id]
);

// mettre user online
await db.query(
`UPDATE users SET is_online = true WHERE id=$1`,
[user.id]
);
    

    // generate token
    const token = jwt.sign(
{
id:user.id,
role:user.role,
sessionId: session.rows[0].id
},
process.env.JWT_SECRET,
{ expiresIn:"8h" }
);

    const responseData = {
      message:"Login success",
      token,
      user:{
        id:user.id,
        username:user.username,
        role:user.role,
        permissions: user.permissions
      }
    };
    console.log("RESPONSE:", responseData); 

    res.json(responseData);

  } catch(err){
    console.error(err);
    res.status(500).json({message:"Server error"});
  }

};
exports.ping = async (req,res)=>{

try{

await db.query(
`UPDATE users 
 SET last_seen = NOW(),
     is_online = true
 WHERE id = $1`,
[req.user.id]
);

res.json({status:"ok"});

}catch(err){
res.status(500).json({error:err.message});
}

};

exports.logout = async (req,res)=>{

try{

// fermer la session active
await db.query(
`UPDATE user_sessions
 SET logout_time = NOW()
 WHERE id=$1 AND logout_time IS NULL`,
[req.user.sessionId]
);

// mettre l'utilisateur offline
await db.query(
`UPDATE users
 SET is_online = false,
 last_seen = NOW()
 WHERE id=$1`,
[req.user.id]
);

res.json({
message:"Logout success"
});

}catch(err){

console.log(err);

res.status(500).json({
message:"Logout error"
});

}

};
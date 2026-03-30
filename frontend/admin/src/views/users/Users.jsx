import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { hasPermission } from "../../utils/permissions";
import { Shield, CheckCircle, Users as UsersIcon, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
const Users = () => {
  const [archiveUserInfo, setArchiveUserInfo] = useState(null);
const [newEmail,setNewEmail] = useState("");
const [editEmail,setEditEmail] = useState("");
const [users,setUsers] = useState([]);
const [search,setSearch] = useState("");
const [selectedUsers, setSelectedUsers] = useState([]);
const [roles,setRoles] = useState([]);
const [selectedRole,setSelectedRole] = useState("");
const [selectedStatus,setSelectedStatus] = useState("");
const [editingId,setEditingId] = useState(null);
const [editUsername,setEditUsername] = useState("");
const [editFullName,setEditFullName] = useState("");
const [resetUserId, setResetUserId] = useState(null);
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordError, setPasswordError] = useState("");
const [resetUser, setResetUser] = useState(null);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [showAddUser, setShowAddUser] = useState(false);

const [newUsername, setNewUsername] = useState("");
const [newFullName, setNewFullName] = useState("");
const [newPasswordUser, setNewPasswordUser] = useState("");
const [confirmNewPassword, setConfirmNewPassword] = useState("");

const [newRole, setNewRole] = useState("");

const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

const [addUserError, setAddUserError] = useState("");
const [addSuccessUser, setAddSuccessUser] = useState(null);

const [showStatusMany,setShowStatusMany] = useState(false);
const [emailError,setEmailError] = useState("");
useEffect(()=>{
fetchUsers();
fetchRoles();
},[]);

const handleAction = (module, action, callback) => {
  if (!hasPermission(module, action)) {
    toast.error("Access denied");
    return;
  }
  callback();
};

const archiveUser = async (user) => {

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:5001/users/archive/${user.id}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if(!response.ok){
        toast.error(data.message || "Access denied");
      return;
    }

   
    await fetchUsers();

  } catch(error){
    console.log(error);
    alert("Erreur réseau");
  }
};

const validateEmail = (email) => {

const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!regex.test(email)){
return "Adresse email invalide";
}

return "";

};



const handleEdit = (user)=>{

setEditingId(user.id);
setEditUsername(user.username);
setEditFullName(user.full_name);
setEditEmail(user.email || "");
};
const createUser = async () => {

if(!newUsername || !newFullName || !newPasswordUser || !confirmNewPassword || !newRole){
setAddUserError("Tous les champs sont obligatoires");
return;
}
if(newEmail){

const emailValidation = validateEmail(newEmail);

if(emailValidation){
setEmailError(emailValidation);
return;
}


setEmailError("");
}

if(newPasswordUser !== confirmNewPassword){
setAddUserError("Les mots de passe ne sont pas identiques");
return;
}

setAddUserError("");

const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5001/users/create",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
username:newUsername,
password:newPasswordUser,
full_name:newFullName,
email:newEmail,
role:newRole
}) 
});

const data = await response.json();
if (!response.ok) {
  setAddUserError(data.message || "Access denied");
  return;
}
if(data.message === "User created successfully"){

setAddSuccessUser(data.user);
setShowAddUser(false);

setShowAddUser(false);

setNewUsername("");
setNewFullName("");
setNewPasswordUser("");
setConfirmNewPassword("");
setNewRole("");
setNewEmail("");
fetchUsers();

}else{

setAddUserError(data.message);

}

};

const toggleStatus = async (user) => {
  console.log("OLD STATUS:", user.status);
  console.log("NEW STATUS:", !user.status);

const token = localStorage.getItem("token");

const response = await fetch(`http://localhost:5001/users/toggle-status/${user.id}`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
status: !user.status
})
});

const data = await response.json();

// 🔥 AJOUT
if (!response.ok) {
    toast.error(data.message || "Access denied");
  return;
}

fetchUsers();

};

const handleSelectAll = (e) => {

if(e.target.checked){
setSelectedUsers(users.map(user => user.id));
}else{
setSelectedUsers([]);
}

};
const handleSelectUser = (id) => {

if(selectedUsers.includes(id)){
setSelectedUsers(selectedUsers.filter(userId => userId !== id));
}else{
setSelectedUsers([...selectedUsers, id]);
}

};
const fetchRoles = async () => {

  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5001/userGroup",{
    headers:{
      Authorization:`Bearer ${token}`
    }
  });

  const data = await response.json();

  console.log("ROLES RESPONSE:", data);

 
  if (!response.ok) {
      toast.error(data.message || "Access denied");
    setRoles([]); 
    return;
  }

  setRoles(data);
};
const fetchUsers = async ()=>{

const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5001/users",{
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await response.json();

// 🔥 AJOUT (NE CASSE RIEN)
if (!response.ok) {
    toast.error(data.message || "Access denied");
  setUsers([]);
  return;
}

if(Array.isArray(data)){
setUsers(data);
}

};


const changeStatusMany = async ()=>{

const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5001/users/status-many",{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
ids:selectedUsers
})
});

const data = await response.json();

// 🔥 AJOUT ICI
if (!response.ok) {
    toast.error(data.message || "Access denied");
  return;
}

setSelectedUsers([]);
setShowStatusMany(false);

fetchUsers();

};
const resetPassword = async () => {

if(newPassword !== confirmPassword){
setPasswordError("Les mots de passe ne correspondent pas");
return;
}

const token = localStorage.getItem("token");

const response = await fetch(`http://localhost:5001/users/reset-password/${resetUser.id}`,{

method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},

body:JSON.stringify({
password:newPassword
})

});

const data = await response.json();

// 🔥 AJOUT ICI
if (!response.ok) {
    toast.error(data.message || "Access denied");
  return;
}

setResetUser(null);
setNewPassword("");
setConfirmPassword("");
setPasswordError("");

alert("Mot de passe modifié");

};

const filteredUsers = users.filter((user)=>{


const matchSearch =
user.username.toLowerCase().includes(search.toLowerCase()) ||
user.full_name.toLowerCase().includes(search.toLowerCase());

const matchRole =
selectedRole === "" || user.role === selectedRole;

const matchStatus =
selectedStatus === "" ||
(selectedStatus === "active" && user.status === true) ||
(selectedStatus === "inactive" && user.status === false);

return matchSearch && matchRole && matchStatus;

});


const updateUser = async (id)=>{

const token = localStorage.getItem("token");

const user = users.find(u=>u.id === id);
if(!user) return;

const response = await fetch(`http://localhost:5001/users/update/${id}`,{

method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},

body:JSON.stringify({
username:user.username,
full_name:editFullName,
email:editEmail,
role:user.role,
status:user.status
})

});

const data = await response.json();

if (!response.ok) {
    toast.error(data.message || "Access denied");
  return;
}

setEditingId(null);
fetchUsers();

};


const archiveManyUsers = async () => {

  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5001/users/archive-many",{
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${token}`
    },
    body:JSON.stringify({
      ids:selectedUsers
    })
  });

  const data = await response.json();

  // 🔥 AJOUT ICI
  if (!response.ok) {
      toast.error(data.message || "Access denied");
    return;
  }

  if(data.message){
    alert(data.message);
  }

  setSelectedUsers([]);
  setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
};




return (

<>

<div className="container-fluid">

{/* HEADER */}

<div className="d-flex justify-content-between align-items-center mb-4">

<h2 style={{color:"#0E6B74",fontWeight:"600"}}>
Gestion des Utilisateurs
</h2>

<div style={{display:"flex",gap:"10px"}}>

{selectedUsers.length > 0 && (

<>

<button
className="btn"
style={{background:"#0E84A5",color:"white"}}
onClick={() => handleAction("users", "update", () => setShowStatusMany(true))}
>
Changer status ({selectedUsers.length})
</button>

{/*<button
className="btn"
style={{background:"#d9534f",color:"white"}}
onClick={()=>setShowDeleteMany(true)}
>
Supprimer ({selectedUsers.length})
</button>*/}

<button
className="btn"
style={{background:"#d9534f",color:"white"}}
onClick={() => handleAction("users", "delete", archiveManyUsers)}
>
Supprimer ({selectedUsers.length})
</button>

</>

)}

<button
className="btn"
style={{ background: "#0E84A5F2", color: "white" }}
onClick={() => handleAction("users", "create", () => setShowAddUser(true))}
>
+ Ajouter utilisateur
</button>

</div>

</div>


{/* SEARCH + FILTERS */}

<div className="card p-4 mb-4">

<div className="row">

<div className="col-md-4">
<input
className="form-control"
placeholder="Rechercher utilisateur..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>
</div>

<div className="col-md-3">

<select
className="form-control"
value={selectedRole}
onChange={(e)=>setSelectedRole(e.target.value)}
>

<option value="">Tous les users groups</option>

{Array.isArray(roles) && roles.map(role => (
<option key={role.id} value={role.name}>
{role.name}
</option>
))}

</select>

</div>

<div className="col-md-3">

<select
className="form-control"
value={selectedStatus}
onChange={(e)=>setSelectedStatus(e.target.value)}
>

<option value="">Tous les status</option>
<option value="active">Active</option>
<option value="inactive">Inactive</option>

</select>

</div>

</div>

</div>


{/* CARDS */}

<div className="row mb-4">

<div className="col-md-3">

<div className="stat-card">

<div className="stat-header">
<Shield size={22} className="stat-icon"/>
<span>Admins</span>
</div>
<h2>{users.filter(u=>u.role==="admin").length}</h2>
</div>
</div>

<div className="col-md-3">

<div className="stat-card">

<div className="stat-header">
<CheckCircle size={22} className="stat-icon"/>
<span>Validation</span>
</div>

<h2>{users.filter(u=>u.role==="validation").length}</h2>
</div>
</div>

<div className="col-md-3">

<div className="stat-card">

<div className="stat-header">
<UsersIcon size={22} className="stat-icon"/>
<span>Agents</span>
</div>
<h2>{users.filter(u=>u.role==="agent").length}</h2>
</div>
</div>

<div className="col-md-3">

<div className="stat-card">

<div className="stat-header">
<BarChart3 size={22} className="stat-icon"/>
<span>Total</span>
</div>
<h2>{users.length}</h2>
</div>
</div>

</div>


{/* TABLE */}

<div className="card">

<table className="table">

<thead>

<tr>

<th>
<input
type="checkbox"
onChange={handleSelectAll}
checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
/>
</th>

<th>Username</th>
<th>Nom Complet</th>
<th>Email</th>
<th>User Group</th>
<th>Status</th>
<th className="text-center">Actions</th>

</tr>

</thead>

<tbody>

{filteredUsers.map((user)=>(

<tr key={user.id}>

<td>
<input
type="checkbox"
checked={selectedUsers.includes(user.id)}
onChange={()=>handleSelectUser(user.id)}
/>
</td>

<td>

<div style={{display:"flex",alignItems:"center"}}
>

<div style={{
position:"relative",
width:"35px",
height:"35px",
borderRadius:"50%",
background:"#1aa1a8",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
marginRight:"10px"
}}>

{user.username.charAt(0).toUpperCase()}

<div
style={{
position:"absolute",
bottom:"0",
right:"0",
width:"10px",
height:"10px",
borderRadius:"50%",
background: user.is_online ? "#28a745" : "#bbb",
border:"2px solid white"
}}
></div>

</div>

<div>{user.username}</div>

</div>

</td>

<td>

{editingId === user.id ? (

<input
className="form-control"
style={{
background:"white",
color:"black",
border:"2px solid #0E84A5"
}}
value={editFullName}
onChange={(e)=>setEditFullName(e.target.value)}
onKeyDown={(e)=>{
if(e.key === "Enter"){
updateUser(user.id);
}
}}
/>

) : (

user.full_name

)}

</td>

<td>

{editingId === user.id ? (

<input
className="form-control"
style={{
background:"white",
color:"black",
border:"2px solid #0E84A5"
}}
value={editEmail}
onChange={(e)=>setEditEmail(e.target.value)}
onKeyDown={(e)=>{
if(e.key === "Enter"){
updateUser(user.id);
}
}}
/>

) : (

user.email || "-"

)}

</td>

<td>
<span className="role-badge">{user.role}</span>
</td>

<td>

<span
/*onClick={() => toggleStatus(user)}*/
style={{cursor:"default"}}
className={`badge ${user.status ? "bg-success" : "bg-secondary"}`}
>
{user.status ? "active" : "inactive"}
</span>

</td>

<td className="text-center">

<div className="tooltip-container">
  <button
    className="btn  btn-sm me-2"
    onClick={() => handleAction("users", "update", () => toggleStatus(user))}
  >
    👁
  </button>
  <span className="tooltip-text">
    Activer / Désactiver utilisateur
  </span>
</div>

<div className="tooltip-container">
  <button
    className="btn btn-sm me-2"
    onClick={() => handleAction("users", "update", () => handleEdit(user))}
  >
    ✏️
  </button>
  <span className="tooltip-text">Modifier utilisateur</span>
</div>

<div className="tooltip-container">
  <button
    className="btn  btn-sm me-2"
    onClick={() => handleAction("users", "update", () => setResetUser(user))}
  >
    🔑
  </button>
  <span className="tooltip-text">
    Réinitialiser mot de passe
  </span>
</div>

<div className="tooltip-container">
  <button
    className="btn  btn-sm"
   onClick={() => handleAction("users", "delete", () => setArchiveUserInfo(user))}
    
  >
    🗑
  </button>
  <span className="tooltip-text">
    Supprimer utilisateur
  </span>
</div>
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

{archiveUserInfo && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>📦 Supprimer utilisateur</h5>
</div>

<div className="modal-body">

<label>Username</label>
<input
className="crm-input"
value={archiveUserInfo.username}
disabled
/>

<label className="mt-3">Nom complet</label>
<input
className="crm-input"
value={archiveUserInfo.full_name}
disabled
/>

<div style={{marginTop:"20px", color:"#ef1515"}}>
⚠ Cet utilisateur sera retiré de votre liste
</div>

</div>

<div className="modal-footer">

<button
className="btn btn-light"
onClick={()=>setArchiveUserInfo(null)}
>
Annuler
</button>

<button
className="btn"
style={{background:"#e81b1b",color:"white"}}
onClick={async ()=>{
  if(!archiveUserInfo) return;

  const user = archiveUserInfo;

  setArchiveUserInfo(null);
await archiveUser(user);

  
}}
>
Supprimer
</button>

</div>

</div>

</div>

)}
{showStatusMany && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>Changer statut</h5>
</div>

<div className="modal-body">

Changer le statut de <b>{selectedUsers.length}</b> utilisateur(s) ?

</div>

<div className="modal-footer">

<button
className="btn btn-light"
onClick={()=>setShowStatusMany(false)}
>
Annuler
</button>

<button
className="btn"
style={{background:"#0E84A5",color:"white"}}
onClick={changeStatusMany}
>
Changer status
</button>

</div>

</div>

</div>

)}
{/*add user modal*/}
{showAddUser && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>➕ Ajouter Utilisateur</h5>
</div>

<div className="modal-body">

<label>Username *</label>
<input
className="crm-input"
placeholder="Entrer le username"
value={newUsername}
onChange={(e)=>setNewUsername(e.target.value)}
/>

<label className="mt-3">Nom complet *</label>
<input
className="crm-input"
placeholder="Entrer le nom complet"
value={newFullName}
onChange={(e)=>setNewFullName(e.target.value)}
/>

<label className="mt-3">Adresse mail</label>

<input
type="email"
className="crm-input"
placeholder="Entrer l'adresse mail"
value={newEmail}
autoComplete="off"
onChange={(e)=>setNewEmail(e.target.value)}
/>

{emailError && (
<div style={{color:"red",marginTop:"6px"}}>
{emailError}
</div>
)}

<label className="mt-3">Mot de passe *</label>

<div style={{position:"relative"}}>

<input
type={showNewPassword ? "text" : "password"}
className="crm-input"
placeholder="Entrer le mot de passe"
value={newPasswordUser}
onChange={(e)=>setNewPasswordUser(e.target.value)}
/>

<span
onClick={()=>setShowNewPassword(!showNewPassword)}
style={{
position:"absolute",
right:"12px",
top:"50%",
transform:"translateY(-50%)",
cursor:"pointer",
color:"black"
}}
>
{showNewPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
</span>

</div>

<label className="mt-3">Confirmer mot de passe *</label>

<div style={{position:"relative"}}>

<input
type={showConfirmNewPassword ? "text" : "password"}
className="crm-input"
placeholder="Confirmer le mot de passe"
value={confirmNewPassword}
onChange={(e)=>setConfirmNewPassword(e.target.value)}
/>

<span
onClick={()=>setShowConfirmNewPassword(!showConfirmNewPassword)}
style={{
position:"absolute",
right:"12px",
top:"50%",
transform:"translateY(-50%)",
cursor:"pointer",
color:"black"
}}
>
{showConfirmNewPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
</span>

</div>

<label className="mt-3">Role *</label>

<select
className="crm-input"
value={newRole}
onChange={(e)=>setNewRole(e.target.value)}
>

<option value="">Choisir un User Group</option>

{Array.isArray(roles) && roles.map(role => (
<option key={role.id} value={role.name}>
{role.name}
</option>
))}

</select>

{addUserError && (
<div style={{color:"red",marginTop:"12px"}}>
{addUserError}
</div>
)}

</div>

<div className="modal-footer">

<button
className="btn btn-light"
onClick={()=>setShowAddUser(false)}
>
Annuler
</button>

<button
className="btn"
style={{background:"#0E84A5",color:"white"}}
onClick={createUser}
>
Ajouter
</button>

</div>

</div>

</div>

)}

{addSuccessUser && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>✅ Utilisateur ajouté</h5>
</div>

<div className="modal-body">

<label>Username</label>

<input
className="crm-input"
value={addSuccessUser.username}
disabled
/>

<label className="mt-3">Nom complet</label>

<input
className="crm-input"
value={addSuccessUser.full_name}
disabled
/>

<div style={{marginTop:"20px", color:"#28a745"}}>
✔ L'utilisateur a été ajouté avec succès
</div>

</div>

<div className="modal-footer">

<button
className="btn"
style={{background:"#0E84A5",color:"white"}}
onClick={()=>setAddSuccessUser(null)}
>
OK
</button>

</div>

</div>

</div>

)}
{/* RESET PASSWORD MODAL */}

{resetUser && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>🔑 Reset Password</h5>
</div>

<div className="modal-body">

<label>Username</label>

<input
className="crm-input"
value={resetUser.username}
disabled
/>

<label className="mt-3">Nom complet</label>

<input
className="crm-input"
value={resetUser.full_name}
disabled
/>

<label className="mt-3">Nouveau mot de passe</label>

<div style={{position:"relative"}}>

<input
type={showPassword ? "text" : "password"}
className="crm-input"
placeholder="Entrer le nouveau mot de passe"
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
/>

<span
onClick={()=>setShowPassword(!showPassword)}
style={{
position:"absolute",
right:"12px",
top:"50%",
transform:"translateY(-50%)",
cursor:"pointer",
fontSize:"18px",
color: "black"
}}
>
{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
</span>

</div>

<label className="mt-3">Confirmer mot de passe</label>

<div style={{position:"relative"}}>

<input
type={showConfirmPassword ? "text" : "password"}
className="crm-input"
placeholder="Confirmer le mot de passe"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
/>

<span
onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
style={{
position:"absolute",
right:"12px",
top:"50%",
transform:"translateY(-50%)",
cursor:"pointer",
fontSize:"18px",
color: "black"
}}
>
{showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}

</span>

</div>

{passwordError && (
<div style={{color:"red",marginTop:"10px"}}>
{passwordError}
</div>
)}

</div>

<div className="modal-footer">

<button
className="btn btn-light"
onClick={()=>setResetUser(null)}
>
Annuler
</button>

<button
className="btn"
style={{background:"#0E84A5",color:"white"}}
onClick={() => handleAction("users", "update", resetPassword)}>
Sauvegarder
</button>

</div>

</div>

</div>

)}



</>

);

};

export default Users;
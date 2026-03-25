import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import toast from "react-hot-toast";
import { hasPermission } from "../../utils/permissions";
const UserGroup = () => {
const [role, setRole] = useState("");
const [groups,setGroups] = useState([]);
const [search,setSearch] = useState("");
const [selectedGroups,setSelectedGroups] = useState([]);
const [showArchiveMany,setShowArchiveMany] = useState(false);
const [editingId,setEditingId] = useState(null);
const [editName,setEditName] = useState("");
const [editDescription,setEditDescription] = useState("");
const [archiveSuccess, setArchiveSuccess] = useState(null);
const [showAddGroup,setShowAddGroup] = useState(false);
const [newName,setNewName] = useState("");
const [newDescription,setNewDescription] = useState("");

const [addGroupError,setAddGroupError] = useState("");
const [addSuccessGroup,setAddSuccessGroup] = useState(null);

const [deleteGroupId,setDeleteGroupId] = useState(null);
const [deleteGroupInfo,setDeleteGroupInfo] = useState(null);

const [showDeleteMany,setShowDeleteMany] = useState(false);
const [showStatusMany,setShowStatusMany] = useState(false);

useEffect(()=>{
fetchGroups();
},[]);

const handleAction = (module, action, callback) => {
  if (!hasPermission(module, action)) {
    toast.error("Access denied");
    return;
  }
  callback();
};

const archiveManyGroups = async ()=>{

const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5000/userGroup/archive-many",{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
ids:selectedGroups
})
});

const data = await response.json();


if (!response.ok) {
    toast.error(data.message || "Access denied");
  return;
}

setSelectedGroups([]);
setShowArchiveMany(false);
fetchGroups();
};

const archiveGroup = async (group)=>{

  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5000/userGroup/archive/${group.id}`,{
    method:"PUT",
    headers:{ Authorization:`Bearer ${token}` }
  });

  const data = await response.json();


if (!response.ok) {
  toast.error(data.message || "Access denied");
  return;
}
  setArchiveSuccess({
    groupName: group.name,
    users: data.users
  });

  fetchGroups();
};
const fetchGroups = async ()=>{

const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5000/userGroup",{
headers:{ Authorization:`Bearer ${token}` }
});

const data = await response.json();

// 🔥 AJOUT
if (!response.ok) {
    toast.error(data.message || "Access denied");
  setGroups([]);
  return;
}

if(Array.isArray(data)){
setGroups(data.filter(g => !g.is_archived));
}

};


const filteredGroups = groups.filter(group =>
group.name.toLowerCase().includes(search.toLowerCase()) ||
(group.description || "").toLowerCase().includes(search.toLowerCase())
);
const selectableGroups = filteredGroups.filter(g => g.id !== 1);

const handleSelectAll = (e)=>{

if(e.target.checked){
setSelectedGroups(filteredGroups
  .filter(g => g.id !== 1) 
  .map(g=>g.id));
}else{
setSelectedGroups([]);
}

};


const handleSelectGroup = (id)=>{

if(selectedGroups.includes(id)){
setSelectedGroups(selectedGroups.filter(g=>g !== id));
}else{
setSelectedGroups([...selectedGroups,id]);
}

};


const handleEdit = (group)=>{

setEditingId(group.id);
setEditName(group.name);
setEditDescription(group.description);
setRole(group.role);

};


const updateGroup = async (id)=>{

const token = localStorage.getItem("token");

const response = await fetch(`http://localhost:5000/userGroup/update/${id}`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
name:editName,
description:editDescription,
role: role
})
});

const data = await response.json();

// 🔥 AJOUT IMPORTANT
if (!response.ok) {
    toast.error(data.message || "Access denied");
  return;
}

setEditingId(null);
fetchGroups();

};
const toggleStatus = async (group)=>{

const token = localStorage.getItem("token");

const response = await fetch(`http://localhost:5000/userGroup/toggle-status/${group.id}`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
}
});

const data = await response.json();

// 🔥 AJOUT IMPORTANT
if (!response.ok) {
    toast.error(data.message || "Access denied");
  return;
}

fetchGroups();

};




const changeStatusMany = async ()=>{

const token = localStorage.getItem("token");

await fetch("http://localhost:5000/userGroup/status-many",{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({ ids:selectedGroups })
});

setSelectedGroups([]);
setShowStatusMany(false);
fetchGroups();

};


const createGroup = async ()=>{

if(!newName || !newDescription){
setAddGroupError("Tous les champs sont obligatoires");
return;
}

setAddGroupError("");

const token = localStorage.getItem("token");

await fetch("http://localhost:5000/userGroup/create",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
name:newName,
description:newDescription,
role: role 
})
});

setAddSuccessGroup({
name:newName,
description:newDescription,
role: role 
});

setShowAddGroup(false);
setNewName("");
setNewDescription("");

fetchGroups();

};


const confirmDeleteGroup = async ()=>{

const token = localStorage.getItem("token");

await fetch(`http://localhost:5000/userGroup/delete/${deleteGroupId}`,{
method:"DELETE",
headers:{ Authorization:`Bearer ${token}` }
});

setDeleteGroupId(null);
setDeleteGroupInfo(null);

fetchGroups();

};


const deleteManyGroups = async ()=>{

const token = localStorage.getItem("token");

await fetch("http://localhost:5000/userGroup/delete-many",{
method:"DELETE",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({
ids:selectedGroups
})
});

setSelectedGroups([]);
setShowDeleteMany(false);

fetchGroups();

};



return (

<>

<div className="container-fluid">

<div className="d-flex justify-content-between align-items-center mb-4">

<h2 style={{color:"#0E6B74",fontWeight:"600"}}>
Gestion des Groupes Utilisateurs
</h2>

<div style={{display:"flex",gap:"10px"}}>

{selectedGroups.length > 0 && (

<>

<button
className="btn"
style={{background:"#3b9a41",color:"white"}}
onClick={() => handleAction("users_groups", "update", () => setShowStatusMany(true))}
>
Changer status ({selectedGroups.length})
</button>
<button
  className="btn"
  style={{background:"#d9534f",color:"white"}}
  onClick={() => handleAction("users_groups", "delete", () => setShowArchiveMany(true))}
>
Supprimer ({selectedGroups.length})
</button>
{/*<button
className="btn"
style={{background:"#d9534f",color:"white"}}
onClick={()=>setShowDeleteMany(true)}
>
Supprimer ({selectedGroups.length})
</button>*/}

</>

)}

<button
className="btn"
style={{background:"#0E84A5F2",color:"white"}}
onClick={() => handleAction("users_groups", "create", () => setShowAddGroup(true))}
>
+ Ajouter groupe
</button>

</div>

</div>


<div className="card p-4 mb-4">

<input
className="form-control"
placeholder="Rechercher groupe..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

</div>


<div className="card">

<table className="table">

<thead>

<tr>

<th>
<input
type="checkbox"
onChange={handleSelectAll}
checked={selectedGroups.length === selectableGroups.length}
/>
</th>

<th>Group Name</th>
<th>Description</th>
<th>Role</th>
<th>Status</th>

<th className="text-center">Actions</th>

</tr>

</thead>

<tbody>

{filteredGroups.map(group=>(

<tr key={group.id}>

<td>
<input
type="checkbox"
disabled={group.id === 1}
checked={selectedGroups.includes(group.id)}
onChange={()=>handleSelectGroup(group.id)}
/>
</td>

<td>

{editingId === group.id ? (

<input
className="form-control"
value={editName}
onChange={(e)=>setEditName(e.target.value)}
onKeyDown={(e)=>{
if(e.key === "Enter"){
updateGroup(group.id);
}
}}
/>

) : (
  <div className="group-info">
    
    <div className="group-avatar">
  <Users size={16} />
</div>

    <span>{group.name}</span>

  </div>
)}

</td>

<td>

{editingId === group.id ? (

<input
className="form-control"
value={editDescription}
onChange={(e)=>setEditDescription(e.target.value)}
onKeyDown={(e)=>{
if(e.key === "Enter"){
updateGroup(group.id);
}
}}
/>

) : group.description }

</td>
<td>
  {editingId === group.id ? (
    <select
      className="form-control"
      value={role}
      onChange={(e) => setRole(e.target.value)} style={{background:"hsl(0, 0%, 100%)",color:"black"}}
    >
      <option value="admin">Admin</option>
      <option value="agent">Agent</option>
      <option value="validation">Validation</option>
      <option value="qualite">Qualité</option>
    </select>
  ) : (
    <span className={`badge group-role-badge`}>
  {group.role}
</span>
  )}
</td>

<td>

{/*<span
onClick={()=>{
  if(group.id === 1) return;
  toggleStatus(group);
}}
style={{cursor:"pointer"}}
className={`badge ${group.status ? "bg-success" : "bg-secondary"}`}
>
{group.status ? "active" : "inactive"}
</span>*/}
<span
className={`badge ${group.status ? "bg-success" : "bg-secondary"}`}
style={{cursor:"default"}}
>
  {group.status ? "active" : "inactive"}
</span>

</td>

<td className="text-center">

<div className="tooltip-container">
  <button
  disabled={group.id === 1}
  className="btn  btn-sm me-2"
  onClick={()=>{
    if(group.id === 1) return;

    if (!hasPermission("users_groups", "update")) {
      toast.error("Access denied");
      return;
    }

    toggleStatus(group);
  }}
  >
    👁
  </button>
  <span className="tooltip-text">Activer / Désactiver groupe + utilisateurs</span>
</div>

<div className="tooltip-container">
  <button
    disabled={group.id === 1}
    className="btn  btn-sm me-2"
    onClick={() => handleAction("users_groups", "update", () => handleEdit(group))}
  >
    ✏️
  </button>
  <span className="tooltip-text">Modifier</span>
</div>
<div className="tooltip-container">
  <button
    disabled={group.id === 1}
    className="btn  btn-sm me-2"
    onClick={() => handleAction("users_groups", "delete", () => archiveGroup(group))}
  >
    🗑
  </button>
  <span className="tooltip-text">
    Archiver groupe + utilisateurs
  </span>
</div>

{/*<div className="tooltip-container">
  <button
    disabled={group.id === 1}
    className="btn btn-light btn-sm"
    onClick={()=>{
      if(group.id === 1) return;
      setDeleteGroupId(group.id);
      setDeleteGroupInfo(group);
    }}
  >
    🗑
  </button>
  <span className="tooltip-text">Supprimer groupe + utilisateurs</span>
</div>*/}

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>
{archiveSuccess && (

<div className="modal-overlay">

  <div className="modal-card">

    <div className="modal-header">
      <h5>📦 Archivage réussi</h5>
    </div>

    <div className="modal-body">

      <p>
        Groupe <b>{archiveSuccess.groupName}</b> archivé
      </p>

      <div style={{marginTop:"10px", color:"#f0ad4e"}}>
        ✔ Utilisateurs archivés :
      </div>

      {archiveSuccess.users && archiveSuccess.users.length > 0 ? (

        <ul style={{marginTop:"10px"}}>
          {archiveSuccess.users.map((u,i)=>(
            <li key={i}>👤 {u.username}</li>
          ))}
        </ul>

      ) : (

        <p style={{marginTop:"10px"}}>
          Aucun utilisateur dans ce groupe
        </p>

      )}

    </div>

    <div className="modal-footer">

      <button
        className="btn"
        style={{background:"#0E84A5",color:"white"}}
        onClick={()=>setArchiveSuccess(null)}
      >
        OK
      </button>

    </div>

  </div>

</div>

)}

{/* DELETE MANY */}

{showDeleteMany && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>🗑 Supprimer groupes</h5>
</div>

<div className="modal-body">

Supprimer <b>{selectedGroups.length}</b> groupe(s) ?

<div style={{marginTop:"15px",color:"#d9534f"}}>
⚠ Cette action est irréversible
</div>

</div>

<div className="modal-footer">

<button
className="btn btn-light"
onClick={()=>setShowDeleteMany(false)}
>
Annuler
</button>

{/*<button
className="btn"
style={{background:"#d9534f",color:"white"}}
onClick={deleteManyGroups}
>
Supprimer {selectedGroups.length}
</button>*/}

</div>

</div>

</div>

)}

{/* STATUS MANY */}
{showStatusMany && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>Changer statut</h5>
</div>

<div className="modal-body">

Changer le statut de <b>{selectedGroups.length}</b> groupe(s) ?

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


{/* ADD GROUP */}
{showAddGroup && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>➕ Ajouter Groupe</h5>
</div>

<div className="modal-body">

<label>Nom du groupe *</label>
<input
className="crm-input"

placeholder="Nom du groupe"
value={newName}
onChange={(e)=>setNewName(e.target.value)}
/>

<label className="mt-3">Description *</label>
<input
className="crm-input"

placeholder="Description"
value={newDescription}
onChange={(e)=>setNewDescription(e.target.value)}
/>
<label className="mt-3">Rôle *</label>

<select
  className="crm-input"
  value={role}
  onChange={(e) => setRole(e.target.value)}
>
  <option value="">Choisir un rôle</option>
  <option value="admin">Admin</option>
  <option value="agent">Agent</option>
  <option value="validation">Validation</option>
  <option value="qualite">Qualité</option>
</select>
{addGroupError && (
<div style={{color:"red",marginTop:"10px"}}>
{addGroupError}
</div>
)}

</div>

<div className="modal-footer">

<button
className="btn btn-light"
onClick={()=>setShowAddGroup(false)}
>
Annuler
</button>

<button
className="btn"
style={{background:"#0E84A5",color:"white"}}
onClick={createGroup}
>
Ajouter
</button>

</div>

</div>

</div>

)}


{/* SUCCESS */}
{addSuccessGroup && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>✅ Groupe ajouté</h5>
</div>

<div className="modal-body">

<label>Nom du groupe</label>

<input
className="crm-input"
value={addSuccessGroup.name}
disabled
/>

<label className="mt-3">Description</label>

<input
className="crm-input"
value={addSuccessGroup.description}
disabled
/>


<div style={{marginTop:"20px",color:"#28a745"}}>
✔ Le groupe a été ajouté avec succès
</div>

</div>

<div className="modal-footer">

<button
className="btn"
style={{background:"#0E84A5",color:"white"}}
onClick={()=>setAddSuccessGroup(null)}
>
OK
</button>

</div>

</div>

</div>

)}

{archiveSuccess && (

<div className="modal-overlay">

  <div className="modal-card">

    <div className="modal-header">
      <h5>📦 Archivage réussi</h5>
    </div>

    <div className="modal-body">

      <p>
        Le groupe <b>{archiveSuccess.groupName}</b> a été archivé
      </p>

      <div style={{marginTop:"20px",color:"#d9534f"}}>
        ✔ Tous les utilisateurs liés sont aussi supprimés
      </div>

    </div>

    <div className="modal-footer">

      <button
        className="btn"
        style={{background:"#0E84A5",color:"white"}}
        onClick={()=>setArchiveSuccess(null)}
      >
        OK
      </button>

    </div>

  </div>

</div>

)}
{showArchiveMany && (

<div className="modal-overlay">
  <div className="modal-card">

    <div className="modal-header">
      <h5>📦 Supprimer groupes</h5>
    </div>

    <div className="modal-body">

      Supprimer <b>{selectedGroups.length}</b> groupe(s) ?

      <div style={{marginTop:"15px",color:"#f0112f"}}>
        ⚠ Tous les utilisateurs de ces groupes seront aussi supprimés
      </div>

    </div>

    <div className="modal-footer">

      <button
        className="btn btn-light"
        onClick={()=>setShowArchiveMany(false)}
      >
        Annuler
      </button>

      <button
className="btn"
style={{background:"#d9534f",color:"white"}}
        onClick={archiveManyGroups}
      >
        Supprimer {selectedGroups.length}
      </button>

    </div>

  </div>
</div>

)}

{/* DELETE ONE */}
{deleteGroupId && (

<div className="modal-overlay">

<div className="modal-card">

<div className="modal-header">
<h5>🗑 Supprimer groupe</h5>
</div>

<div className="modal-body">

<label>Nom du groupe</label>

<input
className="crm-input"
value={deleteGroupInfo?.name}
disabled
/>



<div style={{marginTop:"20px",color:"#d9534f"}}>
⚠ Cette action est irréversible
</div>

</div>

<div className="modal-footer">

<button
className="btn btn-light"
onClick={()=>{
setDeleteGroupId(null);
setDeleteGroupInfo(null);
}}
>
Annuler
</button>

<button
className="btn"
style={{background:"#d9534f",color:"white"}}
onClick={confirmDeleteGroup}
>
Supprimer
</button>

</div>

</div>

</div>

)}
</>

);

};

export default UserGroup;
import React, { useEffect, useState } from "react";
import { MODULES, ACTIONS } from "./modules";
import { hasPermission } from "../../utils/permissions";

console.log("TEST PERMISSION:", hasPermission("permissions", "update"));
console.log("USER:", JSON.parse(localStorage.getItem("user")));
const Permissions = () => {

  const [groups,setGroups] = useState([]);
  const [search,setSearch] = useState("");

  const [selectedGroup,setSelectedGroup] = useState(null);
  const [permissionsData,setPermissionsData] = useState({});
  const [showModal,setShowModal] = useState(false);

  const [newModule,setNewModule] = useState("");
  const [newAction,setNewAction] = useState("");

useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("USER:", user);
    console.log("TEST PERMISSION:", hasPermission("permissions", "update"));
  }, []);
  useEffect(()=>{
    fetchGroups();
  },[]);

  const fetchGroups = async ()=>{
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5001/userGroup",{
      headers:{ Authorization:`Bearer ${token}` }
    });

    const data = await res.json();

    if(Array.isArray(data)){
      setGroups(data.filter(g => !g.is_archived));
    }
  };

  const openPermissions = (group)=>{
    setSelectedGroup(group);
    setPermissionsData(group.permissions || {});
    setShowModal(true);
  };

  const togglePermission = (module, action) => {
    setPermissionsData(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev?.[module]?.[action]
      }
    }));
  };

  const addPermission = () => {

    if (!newModule || !newAction) {
      alert("Module et action obligatoires");
      return;
    }

    if (permissionsData?.[newModule]?.[newAction] !== undefined) {
      alert("Permission déjà existe");
      return;
    }

    setPermissionsData(prev => ({
      ...prev,
      [newModule]: {
        ...prev[newModule],
        [newAction]: true
      }
    }));

    setNewModule("");
    setNewAction("");
  };

  
  const savePermissions = async ()=>{
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5001/userGroup/permissions/${selectedGroup.id}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify({
        permissions: permissionsData
      })
    });

    setShowModal(false);
    fetchGroups();
  };
  
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    (group.description || "").toLowerCase().includes(search.toLowerCase())
  );






  return (
    <>
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{color:"#0E6B74",fontWeight:"600"}}>
          Permissions
        </h2>
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
              <th>Group Name</th>
              <th>Description</th>
              <th>Role</th>
              <th className="text-center">Permissions</th>
            </tr>
          </thead>

          <tbody>
            {filteredGroups.map(group => (
              <tr key={group.id}>
                <td><b>{group.name}</b></td>
                <td>{group.description}</td>
                <td>
                  <span className="badge group-role-badge">
                    {group.role}
                  </span>
                </td>
                <td className="text-center">

  
{hasPermission("permissions", "update") && group.id !== 1 && (
  <button
    className="btn btn-light btn-sm"
    onClick={()=>openPermissions(group)}
  >
    ⚙️ Gérer
  </button>
)}

</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>

    {showModal && selectedGroup && (

      <div className="modal-overlay">
        <div className="modal-card" style={{width:"900px"}}>

          <div className="modal-header">
            <h5>⚙️ Permissions - {selectedGroup.name}</h5>
          </div>

          <div className="modal-body">

            <div style={{display:"flex", gap:"10px", marginBottom:"20px"}}>

              <select
                className="crm-input"
                value={newModule}
                onChange={(e)=>setNewModule(e.target.value)}
              >
                <option value="">Module</option>
                {MODULES.map(m => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="crm-input"
                value={newAction}
                onChange={(e)=>setNewAction(e.target.value)}
              >
                <option value="">Action</option>
                {ACTIONS.map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

             {hasPermission("permissions", "create") && (
  <button
    className="btn"
    style={{background:"#0E84A5",color:"white"}}
    onClick={addPermission}
  >
    + Ajouter
  </button>
)}

            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {Object.keys(permissionsData).map(module => (
                  <tr key={module}>
                    <td style={{fontWeight:"600"}}>{module}</td>
                    <td>
                      <div style={{
                        display:"flex",
                        flexWrap:"wrap",
                        gap:"10px"
                      }}>
                        {Object.keys(permissionsData[module]).map(action => (
                          <div key={action} style={{
                            display:"flex",
                            alignItems:"center",
                            gap:"5px",
                            background:"#f1f1f1",
                            padding:"5px 10px",
                            borderRadius:"20px"
                          }}>
                            <input
                              type="checkbox"
                              checked={permissionsData[module][action]}
                              onChange={()=>togglePermission(module,action)}
                            />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          <div className="modal-footer">

            <button
              className="btn btn-light"
              onClick={()=>setShowModal(false)}
            >
              Annuler
            </button>

            <button
              className="btn"
              style={{background:"#0E84A5",color:"white"}}
              onClick={savePermissions}
            >
              Sauvegarder
            </button>

          </div>

        </div>
      </div>
    )}

    </>
  );
};

export default Permissions;
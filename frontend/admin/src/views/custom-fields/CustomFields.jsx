import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CButton } from "@coreui/react";
import CustomFieldForm from "./CustomFieldForm";
import CustomFieldTable from "./CustomFieldTable";

const CustomFields = () => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [fields, setFields] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editField, setEditField] = useState(null);
  const [search, setSearch] = useState("");
const [typeFilter, setTypeFilter] = useState("");
  const toggleSelectAll = () => {
  if (selectedFields.length === fields.length) {
    // ❌ tout décocher
    setSelectedFields([]);
  } else {
    // ✅ tout cocher
    setSelectedFields(fields.map(f => f.id));
  }
};
  const toggleSelect = (id) => {
  if (selectedFields.includes(id)) {
    setSelectedFields(selectedFields.filter(i => i !== id));
  } else {
    setSelectedFields([...selectedFields, id]);
  }
};

  const fetchFields = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/custom-fields",{
      headers:{ Authorization:`Bearer ${token}` }
    });

    const data = await res.json();
    setFields(data);
  };

  useEffect(()=>{
    fetchFields();
  },[]);

 const deleteMany = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/custom-fields/delete-many", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ids: selectedFields })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Erreur suppression");
      return;
    }

    // 🔥 SUCCESS
    setSelectedFields([]);
    fetchFields();

  } catch (err) {
    console.error("DELETE MANY ERROR:", err);
  }
};
const handleEdit = (field) => {
  setEditField(field);
  setShowForm(true);
};
const deleteOne = async (id) => {
  const token = localStorage.getItem("token");

  await fetch(`http://localhost:5000/custom-fields/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  fetchFields();
};

const filteredFields = fields.filter(f =>
  f.name.toLowerCase().includes(search.toLowerCase()) &&
  (typeFilter === "" || f.field_type === typeFilter)
);
  return (
    <CCard>
      <CCardBody>
        <div className="d-flex gap-2 mb-3">

  <input
    className="form-control"
    placeholder="Rechercher par nom..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
  />

  <select
    className="form-select"
    value={typeFilter}
    onChange={(e)=>setTypeFilter(e.target.value)}
  >
    <option value="">Tous les types</option>
    <option value="text">Text</option>
    <option value="number">Number</option>
    <option value="select">Select</option>
  </select>

</div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            
   
  <h4>Champs personnalisés</h4>
  

  <div className="d-flex gap-2">

 
    {selectedFields.length > 0 && (
      <button
        className="btn btn-danger" 
        onClick={deleteMany}
      >
        Supprimer ({selectedFields.length})
      </button>
    )}

    {/* 🔥 BOUTON AJOUTER */}
    <CButton className="btn"
      

      
style={{background:"#0E84A5",color:"white" , width:"130px"}}
       
  onClick={() => {
    setEditField(null);
    setShowForm(true);
  }}
      
    >
      + Ajouter
    </CButton>

  </div>
</div>
        

       {showForm && (
  <CustomFieldForm
    field={editField}
    onClose={() => {
      setShowForm(false);
      setEditField(null);
    }}
    onSuccess={fetchFields}
  />
)}

  
        <CustomFieldTable
  fields={filteredFields}
  selectedFields={selectedFields}
  toggleSelect={toggleSelect}
  toggleSelectAll={toggleSelectAll}
  handleEdit={handleEdit}
  deleteOne={deleteOne}
/>

      </CCardBody>
    </CCard>
  );
};

export default CustomFields;
import { useEffect, useState } from "react"
import axios from "axios"

const CompaniesPage = () => {

    const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  modal: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    minWidth: "350px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
  }
}
const [type, setType] = useState("")
const [showErrorModal, setShowErrorModal] = useState(false)
const [errorMessage, setErrorMessage] = useState("")
const [companyToSync, setCompanyToSync] = useState(null)
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [fields, setFields] = useState([])
  const [description, setDescription] = useState("")
  const [newCompanyName, setNewCompanyName] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState(null)
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldKey, setFieldKey] = useState("")
  const [fieldType, setFieldType] = useState("text")
  const [isRequired, setIsRequired] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [companyToEdit, setCompanyToEdit] = useState(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const confirmDelete = async () => {
  try {
    await axios.delete(`http://localhost:5001/companies/${companyToDelete.id}`)
    setShowDeleteModal(false)
    setCompanyToDelete(null)
    fetchCompanies()
  } catch (err) {
    console.error(err)
    alert("Erreur suppression")
  }
}
  //  AUTO KEY
  const generateKey = (label) => {
    return label
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  }

  //  LOAD
  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5001/companies")
      setCompanies(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

 

  //  SELECT
  const selectCompany = async (c) => {
  setSelectedCompany(c)

  try {
    const updated = await axios.get("http://localhost:5001/companies")

    setCompanies(updated.data.data)

    const current = updated.data.data.find(x => x.id === c.id)

    setSelectedCompany(current)
    setFields(current?.fields || [])

  } catch (err) {
    console.error(err)
  }
}

  //  ADD COMPANY
 const addCompany = async () => {
  if (!newCompanyName || !type) {
    setErrorMessage("Nom et type obligatoires")
    setShowErrorModal(true)
    return
  }

  const exists = companies.some(
    c =>
      c.name.toLowerCase() === newCompanyName.toLowerCase() &&
      (c.type || "") === type
  )

  if (exists) {
    setErrorMessage("Cette campagne avec ce type existe déjà")
    setShowErrorModal(true)
    return
  }

  try {
    const res = await axios.post("http://localhost:5001/companies", {
  name: newCompanyName,
  description,
  type
})

// 🔥 récupérer ID
const newCompany = res.data.data

setCompanyToSync(newCompany)   // 🔥 IMPORTANT
setShowSuccessModal(true)      // 🔥 ouvre modal sync

setNewCompanyName("")
setDescription("")
setType("")
fetchCompanies()
setShowModal(false)

    setNewCompanyName("")
    setDescription("")
    setType("")
    fetchCompanies()

    setShowModal(false) // 🔥 ici

  } catch (err) {
    setErrorMessage(
      err?.response?.data?.error || "Erreur création campagne"
    )
    setShowErrorModal(true)
  }
}
const handleDeleteField = async (field) => {
  try {
    await axios.delete(
      `http://localhost:5001/companies/${selectedCompany.id}/fields/${field.id}`
    )

    // 🔥 recharge COMPLET
    const updated = await axios.get("http://localhost:5001/companies")

    setCompanies(updated.data.data)

    const current = updated.data.data.find(c => c.id === selectedCompany.id)

    setSelectedCompany(current)
    setFields(current?.fields || [])

  } catch (err) {
    console.error(err)
    setErrorMessage("Erreur suppression champ")
    setShowErrorModal(true)
  }
}
  //  ADD FIELD
 const addField = async () => {
  console.log("CLICK ADD FIELD")

  if (!selectedCompany) {
    setErrorMessage("Sélectionne une campagne")
    setShowErrorModal(true)
    return
  }

  if (!fieldLabel || !fieldKey) {
    setErrorMessage("Veuillez remplir les champs")
    setShowErrorModal(true)
    return
  }

  const normalizedKey = fieldKey.trim().toLowerCase()

  const forbiddenKeys = ["lastname", "firstname", "email"]

  if (forbiddenKeys.includes(normalizedKey)) {
    setErrorMessage("Ce champ existe déjà (champ système)")
    setShowErrorModal(true)
    return
  }

  const exists = fields.some(
    f => f.field_key.trim().toLowerCase() === normalizedKey
  )

  if (exists) {
    setErrorMessage("Ce champ existe déjà dans cette campagne")
    setShowErrorModal(true)
    return
  }

  try {
    // 🔥 1. créer champ
    await axios.post(
      `http://localhost:5001/companies/${selectedCompany.id}/fields`,
      {
        field_label: fieldLabel,
        field_key: fieldKey,
        field_type: fieldType,
        is_required: isRequired
      }
    )

    // 🔥 2. SYNC AUTOMATIQUE
    await axios.post(
      `http://localhost:5001/companies/${selectedCompany.id}/sync`
    )

   // 🔥 RELOAD + UPDATE UI
const updated = await axios.get("http://localhost:5001/companies")

setCompanies(updated.data.data)

const current = updated.data.data.find(
  c => c.id === selectedCompany.id
)

setSelectedCompany(current)
setFields(current?.fields || [])
 

setSelectedCompany(current)
setFields(current?.fields || [])

    setFieldLabel("")
    setFieldKey("")
    setIsRequired(false)

    setSuccessMessage("Champ ajouté avec succès ✅")
    setShowFieldModal(true)

    setTimeout(() => {
      setShowFieldModal(false)
    }, 2000)

  } catch (err) {
    console.error(err)
    setErrorMessage(
      err?.response?.data?.error || "Erreur lors de l'ajout du champ"
    )
    setShowErrorModal(true)
  }
}
const syncCompany = async (id) => {
  try {
    await axios.post(`http://localhost:5001/companies/${id}/sync`)

    setSuccessMessage("Synchronisation réussie ✅")
    setShowSuccessModal(true)

    //  auto close après 2s
   setTimeout(() => {
  setShowSuccessModal(false) 
}, 2000)

  } catch (err) {
    alert("Erreur sync")
  }
}
const updateCompany = async () => {
  if (!editName) return alert("Nom requis")

  try {
    await axios.put(
      `http://localhost:5001/companies/${companyToEdit.id}`,
      {
        name: editName,
        description: editDescription
      }
    )

    setShowEditModal(false)
    setCompanyToEdit(null)
    fetchCompanies()

  } catch (err) {
    console.error(err)
    alert("Erreur modification")
  }
}
const openEditModal = (company) => {
  setCompanyToEdit(company)
  setEditName(company.name)
  setEditDescription(company.description || "")
  setShowEditModal(true)
}

const deleteCompany = (company) => {
  setCompanyToDelete(company)
  setShowDeleteModal(true)
}
  return (
    <div style={{
      padding: "30px",
      background: "#f6f8f7",
      minHeight: "100vh",
      color: "#333"
    }}>

      <h3 style={{ color: "#0b6f89", fontWeight: "600" }}>
        Paramètres des Campagnes
      </h3>

      <p style={{ color: "#777" }}>
        Configurez les campagnes et leurs champs personnalisés requis lors de la capture de prospects.
      </p>

      <div style={{
        display: "flex",
        justifyContent: selectedCompany ? "flex-start" : "center",
        alignItems: "flex-start",
        gap: "20px",
        marginTop: "20px",
        transition: "0.3s"
      }}>

        <div style={{
          width: selectedCompany ? "500px" : "800px",
          background: "#fff",
          borderRadius: "16px",
          padding: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          transition: "0.3s"
        }}>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>Campagnes</b>



            <button
              onClick={() => {
  setNewCompanyName("")
  setDescription("")
  setType("")
  setShowModal(true)
}}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "5px 10px",
                background: "#0b6f89",
                color: "white",
                cursor: "pointer"
              }}
            >
              + Nouvelle
            </button>
          </div>

          <div style={{ marginTop: "10px" }}>
           
                
    {companies.map(c => (
  <div
    key={c.id}
    onClick={() => selectCompany(c)}
    style={{
      padding: "12px",
      borderRadius: "10px",
      marginBottom: "8px",
      border: selectedCompany?.id === c.id
        ? "2px solid #0b6f89"
        : "1px solid #eee",
      background: selectedCompany?.id === c.id
        ? "#e6f7f7"
        : "#fff",
      cursor: "pointer",
      transition: "0.2s",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >



  {/* 🔥 COL 1 : NOM + DATE */}
  <div style={{ flex: 2 }}>
    <div style={{ fontWeight: "600" }}>
      {c.name}
    </div>

    <div style={{
      fontSize: "12px",
      color: "#999",
      marginTop: "3px"
    }}>
      {new Date(c.created_at).toLocaleString()}
    </div>
  </div>

  {/* 🔥 COL 2 : TYPE (CENTRÉ) */}
  <div style={{
    flex: 1,
    display: "flex",
    justifyContent: "center"
  }}>
    <span
      style={{
        backgroundColor: "#1f7a8c",
        color: "#fff",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "500",
        minWidth: "70px",
        textAlign: "center"
      }}
    >
      {c.type || "N/A"}
    </span>
  </div>
 

    {/* ACTIONS */}
    <div style={{ display: "flex", gap: "6px" }}>

      <button
        onClick={(e) => {
          e.stopPropagation()
          syncCompany(c.id)
        }}
        style={{
          border: "none",
          background: "#e0f7fa",
          color: "#0b6f89",
          borderRadius: "6px",
          padding: "5px 8px",
          cursor: "pointer"
        }}
      >
        🔄
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          openEditModal(c)
        }}
        style={{
          border: "none",
          background: "#ede7f6",
          color: "#6a1b9a",
          borderRadius: "6px",
          padding: "5px 8px",
          cursor: "pointer"
        }}
      >
        ✏️
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          deleteCompany(c)
        }}
        style={{
          border: "none",
          background: "#fdecea",
          color: "#c62828",
          borderRadius: "6px",
          padding: "5px 8px",
          cursor: "pointer"
        }}
      >
        🗑️
      </button>

    </div>
  </div>
))}
          </div>
          
        </div>

        

        {selectedCompany && (
          <div style={{
            flex: 1,
            background: "#fff",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transition: "0.3s"
          }}>
            

            <h5>{selectedCompany.name}</h5>

            <b>+ Ajouter un Nouveau Champ</b>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <input
                placeholder="Nom"
                value={fieldLabel}
                onChange={e => {
                  const value = e.target.value
                  setFieldLabel(value)
                  setFieldKey(generateKey(value))
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />

              <input
                placeholder="Clé API"
                value={fieldKey}
                readOnly
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#f9f9f9"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <select
                value={fieldType}
                onChange={e => setFieldType(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px"
                }}
              >
                <option value="text">Texte</option>
                <option value="number">Nombre</option>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
              </select>

              <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox" 
                  checked={isRequired}
                  onChange={e => setIsRequired(e.target.checked)}
                />
                Requis
              </label>
            </div>

            <button
              onClick={addField}
              style={{
                marginTop: "15px",
                background: "#0b6f89",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Enregistrer le Champs
            </button>

            <div style={{
              marginTop: "25px",
              background: "#f9fbfb",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.05)"
            }}>

              <b style={{color: "#0b6f89"}}>APERÇU</b>

          

    {/* 🔥 LABEL + DELETE */}
   {fields.map(f => (
  <div key={f.id} style={{ marginBottom: "12px" }}>

    <label style={{ marginBottom: "5px", display: "block" }}>
      {f.field_label}
    </label>

    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

      <input
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}
        disabled
      />

      {/* 🗑️ CORBEILLE ICI */}
      <button
        onClick={() => handleDeleteField(f)}
        style={{
          background: "#fdecea",
          border: "none",
          color: "#c62828",
          borderRadius: "8px",
          padding: "8px",
          cursor: "pointer"
        }}
      >
        🗑️
      </button>

    </div>

  </div>
))}

  
</div>  

</div>
)}
      </div>

      {showErrorModal && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "16px",
      minWidth: "350px",
      textAlign: "center",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
    }}>
      
      <h3 style={{ color: "#d9534f", marginBottom: "10px" }}>
        Erreur
      </h3>

      <p style={{ marginBottom: "20px" }}>
        {errorMessage}
      </p>

      <button
        onClick={() => setShowErrorModal(false)}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "#d9534f",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        OK
      </button>

    </div>
  </div>
)}

      {showEditModal && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "16px",
      width: "420px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
    }}>

      <h4 style={{ marginBottom: "15px" }}>
        Modifier la campagne
      </h4>

      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Nom"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          marginBottom: "10px"
        }}
      />

      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        placeholder="Description"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}
      />

      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "15px"
      }}>
        <button
          onClick={() => setShowEditModal(false)}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
            minWidth: "100px"
          }}
        >
          Annuler
        </button>

        <button
          onClick={updateCompany}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "none",
            background: "#0b6f89",
            color: "#fff",
            cursor: "pointer",
            minWidth: "100px"
          }}
        >
          Enregistrer
        </button>
      </div>

    </div>
  </div>
)}
      {showDeleteModal && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      background: "#fff",
      padding: "25px",
      borderRadius: "16px",
      width: "400px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
    }}>
      
      <h4 style={{ marginBottom: "15px" }}>
        Supprimer la campagne
      </h4>

      <p style={{ marginBottom: "25px", color: "#555" }}>
        Tu veux vraiment supprimer <b>{companyToDelete?.name}</b> ?
      </p>

      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
      }}>
        
        <button
          onClick={() => setShowDeleteModal(false)}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
            minWidth: "100px"
          }}
        >
          Annuler
        </button>

        <button
          onClick={confirmDelete}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "none",
            background: "#d9534f",
            color: "#fff",
            cursor: "pointer",
            minWidth: "100px"
          }}
        >
          Supprimer
        </button>

      </div>
    </div>
  </div>
)}

{showModal && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "16px",
      width: "400px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
    }}>

      <h4 style={{ marginBottom: "15px" }}>
        Créer une Campagne
      </h4>

      <input
        placeholder="Nom de la campagne"
        value={newCompanyName}
        onChange={(e) => setNewCompanyName(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          marginBottom: "10px"
        }}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}
      />
      <select
  value={type}
  onChange={(e) => setType(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginTop: "10px"
  }}
>
  <option value="">Choisir type</option>
  <option value="B2B">B2B</option>
  <option value="B2C">B2C</option>
</select>
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "15px"
      }}>
        <button
          onClick={() => setShowModal(false)}
          style={{
            padding: "8px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          Annuler
        </button>

        <button
          onClick={() => {
            addCompany()
            setShowModal(false)
          }}
          style={{
            padding: "8px 15px",
            borderRadius: "8px",
            border: "none",
            background: "#0b6f89",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Enregistrer
        </button>
      </div>

    </div>
  </div>
)}
{showFieldModal && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "16px",
      minWidth: "350px",
      textAlign: "center",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
    }}>
      <h3 style={{ marginBottom: "10px", color: "#0b6f89" }}>
        Succès
      </h3>

      <p style={{ marginBottom: "20px" }}>
        {successMessage}
      </p>

     
    </div>
  </div>
)}
     {showSuccessModal && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "16px",
      width: "400px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
    }}>

      <h4 style={{ marginBottom: "15px" }}>
        Synchronisation
      </h4>

      <p style={{ marginBottom: "25px", color: "#555" }}>
        Voulez-vous Enregistrer cette campagne ?
      </p>

      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
      }}>

        {/* NON */}
        <button
          onClick={() => setShowSuccessModal(false)}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
            minWidth: "100px"
          }}
        >
          Annuler
        </button>

        {/* OUI */}
        <button
          onClick={async () => {
            try {
              await axios.post(
                `http://localhost:5001/companies/${companyToSync.id}/sync`
              )

              setShowSuccessModal(false)

              setSuccessMessage("Synchronisation réussie ✅")
              setShowFieldModal(true)

              setTimeout(() => {
                setShowFieldModal(false)
              }, 2000)

            } catch (err) {
              alert("Erreur sync")
            }
          }}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "none",
            background: "#0b6f89",
            color: "#fff",
            cursor: "pointer",
            minWidth: "100px"
          }}
        >
          Oui
        </button>

      </div>

    </div>
  </div>
)}
    </div>
  )
}

export default CompaniesPage
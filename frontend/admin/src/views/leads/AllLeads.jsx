import { useEffect, useState } from "react"
import axios from "axios"

const AllLeads = () => {

  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [selected, setSelected] = useState([])

  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [sortField, setSortField] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  //  FETCH
  const fetchLeads = async () => {
  try {
    const res = await axios.get("http://localhost:5001/leads", {
      
      params: { page, limit, search }
    })

    console.log("DATA API 👉", res.data) 

    setLeads(Array.isArray(res.data.data) ? res.data.data : [])
    console.log("DATA API 👉", res.data.data)
  } catch (err) {
    console.error(err)
  }
}
  useEffect(() => {
    fetchLeads()
  }, [page, search])

  // 🔥 SELECT
  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  // 🔥 BULK UPDATE
  const updateSelected = async () => {
    if (!status || selected.length === 0) return

    await axios.post("http://localhost:5001/leads/bulk-update", {
      ids: selected,
      status
    })

    fetchLeads()
    setSelected([])
  }

  // 🔥 SORT
  const handleSort = (field) => {
    const order =
      sortField === field && sortOrder === "asc" ? "desc" : "asc"

    setSortField(field)
    setSortOrder(order)

    const sorted = [...leads].sort((a, b) => {
      if (!a[field]) return 1
      if (!b[field]) return -1

      return order === "asc"
        ? a[field] > b[field] ? 1 : -1
        : a[field] < b[field] ? 1 : -1
    })

    setLeads(sorted)
  }

  // 🔥 STATUS COLOR
  const getStatusColor = (status) => {
    if (!status) return "#ffe0b2"

    if (status.includes("REJET")) return "#ffcdd2"
    if (status.includes("VALID") || status.includes("QUAL")) return "#c8e6c9"

    return "#ffe0b2"
  }

  return (
    <div style={{
      padding: "30px",
      background: "#f6f8f7",
      color: "black",
      minHeight: "100vh"
    }}>

       {/*HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ color: "#0b6f89" }}>Leads Admin</h3>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            width: "220px"
          }}
        />
      </div>

      {/* CARD */}
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "20px",
        marginTop: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }}>

        {/* TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px"
        }}>

          {/* LEFT */}
          <button style={{
            background: "#0b6f89",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer"
          }}>
            + Créer nouveau Lead
          </button>

          {/* RIGHT */}
          <div style={{ display: "flex", gap: "10px" }}>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                minWidth: "220px"
              }}
            >
              <option value="">Select Status</option>

              <option value="A REPROGRAMMER">À REPROGRAMMER</option>
              <option value="A DEPLACER">À DÉPLACER</option>
              <option value="A CONFIRMER">À CONFIRMER</option>
              <option value="A ECOUTER">À ÉCOUTER</option>
              <option value="CONFIRME">CONFIRMÉ</option>
              <option value="ENVOYE">ENVOYÉ</option>

              <option disabled>──────── POSITIVE ────────</option>
              <option value="VALIDE">VALIDÉ</option>
              <option value="QUALIFIE">QUALIFIÉ</option>

              <option disabled>──────── NEGATIVE ────────</option>
              <option value="REJET_INTERNE">REJET INTERNE</option>
              <option value="REJET_CLIENT">REJET CLIENT</option>
            </select>

            <button
              onClick={updateSelected}
              disabled={selected.length === 0 || !status}
              style={{
                background: "#0b6f89",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                opacity: selected.length === 0 ? 0.6 : 1
              }}
            >
              Update Selected
            </button>

          </div>

        </div>

        {/* TABLE */}
        {leads.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#777"
          }}>
            Aucun lead pour le moment 🚀
          </div>
        ) : (

          <>
            <table style={{ width: "100%" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#666" }}>
                  <th></th>
                  <th onClick={() => handleSort("id")}>ID ↑↓</th>
                  <th>Agent</th>
                  <th onClick={() => handleSort("campagne_name")}>Campagne ↑↓</th>
                  <th onClick={() => handleSort("created_at")}>Date de Saisie ↑↓</th>
                  <th>Téléphone</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(leads) && leads.map(l => (
                  <tr  key={l.id} style={{ borderTop: "1px solid #eee" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(l.id)}
                        onChange={() => toggleSelect(l.id)}
                      />
                    </td>

                    <td>{l.id}</td>
                    <td>{l.agent || "-"}</td>
                    <td>{l.campagne_name || "-"}</td>
                    <td>
                          {l.created_at
                            ? new Date(l.created_at).toLocaleString()
                            : "-"
                          }
                        </td>
                    <td>{l.phone || "-"}</td>

                    <td>
                      <span style={{
                        background: "#0b6f89",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px"
                      }}>
                        {l.type || "-"}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        background: getStatusColor(l.validation_status),
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px"
                      }}>
                        {l.validation_status || "EN ATTENTE"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px"
            }}>
              <span>Page {page}</span>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))}>
                  ←
                </button>

                <button onClick={() => setPage(p => p + 1)}>
                  →
                </button>
              </div>
            </div>

          </>
        )}

      </div>
    </div>
  )
}

export default AllLeads
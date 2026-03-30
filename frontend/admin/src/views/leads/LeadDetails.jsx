import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import axios from "axios"

const LeadDetails = () => {

  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const campagne_id = searchParams.get("campagne_id")

  const [lead, setLead] = useState({})
  const [fields, setFields] = useState([])

  const fetchLead = async () => {
    const res = await axios.get(
      `http://localhost:5001/leads/${id}?campagne_id=${campagne_id}`
    )

    setLead(res.data.data)
    setFields(res.data.fields)
  }

  useEffect(() => {
    fetchLead()
  }, [])

  return (
    <div style={{
      padding: "30px",
      background: "#f6f8f7",
      minHeight: "100vh"
    }}>

      <h3 style={{ color: "#0b6f89" }}>
        Lead Details
      </h3>

      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "25px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }}>

        {/* STATUS */}
        <div style={{ marginBottom: "20px" }}>
          <label>Status</label>
          <select
            value={lead.validation_status || ""}
            onChange={(e) =>
              setLead({ ...lead, validation_status: e.target.value })
            }
            style={{
              width: "300px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}
          >
            <option value="pending">EN ATTENTE</option>
            <option value="validated">VALIDÉ</option>
            <option value="rejected">REJETÉ</option>
          </select>
        </div>

        {/* GRID FIELDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px"
        }}>
          {fields.map(f => (
            <div key={f.id}>
              <label>{f.field_label}</label>

              <input
                value={lead[f.field_key] || ""}
                onChange={(e) =>
                  setLead({
                    ...lead,
                    [f.field_key]: e.target.value
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
          ))}
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={async () => {
            await axios.put(
              `http://localhost:5001/leads/${id}`,
              {
                ...lead,
                campagne_id
              }
            )
            alert("Lead mis à jour ✅")
          }}
          style={{
            marginTop: "25px",
            background: "#0b6f89",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Enregistrer
        </button>

      </div>

    </div>
  )
}

export default LeadDetails
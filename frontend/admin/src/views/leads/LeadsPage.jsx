import { useState } from "react"
import AllLeads from "./AllLeads"

const LeadsPage = () => {

  const [activeTab, setActiveTab] = useState("all")

  return (
    <div style={{
      padding: "30px",
      background: "#f6f8f7",
      minHeight: "100vh"
    }}>

    

      

      <div style={{ marginTop: "20px" }}>
        {activeTab === "all" && <AllLeads />}
      </div>

    </div>
  )
}

export default LeadsPage
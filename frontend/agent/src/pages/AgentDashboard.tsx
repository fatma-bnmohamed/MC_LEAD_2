
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LeadForm from "../components/LeadForm";
import CallPanel from "../components/CallPanel";
import CallHistory from "../components/CallHistory";
import socket from "../socket";
import { useEffect, useState } from "react";
export default function AgentDashboard() {

  // ================= GLOBAL STATES =================
  const [leadStatus, setLeadStatus] = useState("Nouveau");
  const [leadLocked, setLeadLocked] = useState(false);
  const [iaDecision, setIaDecision] = useState<string | null>(null);
  const [agentDecision, setAgentDecision] = useState<string | null>(null);
  const [iaScore, setIaScore] = useState<number | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [autoFilledData, setAutoFilledData] = useState<any>(null);

 useEffect(() => {

  console.log("Dashboard loaded");

  const params = new URLSearchParams(window.location.hash.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    console.error("Token not found in URL");
    return;
  }

  function parseJwt(token: string) {
    return JSON.parse(atob(token.split(".")[1]));
  }

  const decoded: any = parseJwt(token);
  const userId = decoded.id;

  console.log("User ID from token:", userId);

  localStorage.setItem("userId", userId);

  socket.connect();

  socket.on("connect", () => {

    console.log("Connected to socket server");
    console.log("Socket ID:", socket.id);

    socket.emit("join", userId);

  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
  };

}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] p-6">

      <Topbar />

      <div className="flex gap-6 mt-6">

        <div className="w-64">
          <Sidebar />
        </div>

        <div className="flex-1 space-y-6">

          <div className="grid grid-cols-12 gap-6">

            {/* ================= LEAD FORM ================= */}
            <div className="col-span-8">
              <LeadForm
                leadStatus={leadStatus}
                leadLocked={leadLocked}
                iaDecision={iaDecision}
                agentDecision={agentDecision}
                iaScore={iaScore}
                transcription={transcription}
                autoFilledData={autoFilledData}
              />
            </div>

            {/* ================= CALL PANEL ================= */}
            <div className="col-span-4">
              <CallPanel setAutoFilledData={setAutoFilledData} />
            </div>

          </div>

          <CallHistory />

        </div>
      </div>
    </div>
  );
}

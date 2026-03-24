import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
export default function Topbar() {

  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(92);
  const [inactive, setInactive] = useState(false);
  const [status, setStatus] = useState("En ligne");

  // ================= TIMER =================
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ================= IA SCORE RANDOM =================
  useEffect(() => {
    const random = setInterval(() => {
      setScore(Math.floor(Math.random() * 20) + 80);
    }, 3000);

    return () => clearInterval(random);
  }, []);

  // ================= DETECTION INACTIVITE =================
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      setInactive(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setInactive(true);
      }, 15000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return (
  <div className="flex items-center justify-between bg-brand-600 border border-slate-200 rounded-xl px-6 py-4 shadow-sm">

    {/* ================= LEFT SIDE ================= */}
    <div className="flex items-center gap-4">

      {/* Statut */}
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium
        ${
          status === "En ligne"
            ? "bg-green-100 text-green-700"
            : status === "En pause"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {status}
      </span>

      {/* Boutons */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatus("En ligne")}
          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Entrée
        </button>

        <button
          onClick={() => setStatus("En pause")}
          className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm"
        >
          Pause
        </button>

        <button
          onClick={() => setStatus("Hors ligne")}
          className="bg-red-400 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Sortie
        </button>
      </div>

      {/* Timer */}
      <span className="font-semibold text-white/80">
        ⏱ {formatTime()}
      </span>

    </div>

    {/* ================= RIGHT SIDE ================= */}
    <div className="flex items-center gap-6">

      {/* ===== IA SCORE ===== */}
      <div className="bg-brand-400 text-white px-5 py-2 rounded-xl shadow-sm font-medium">
        IA Score : {score}%
      </div>

      {/* ===== AGENT INFO ===== */}
      <div className="flex items-center gap-3">

        <img
          src="https://i.pravatar.cc/40"
          className="w-10 h-10 rounded-full border border-blue-200"
        />

        <div className="text-right">
          <div className="font-semibold text-white/80">
            Fatma
          </div>
          <div className="text-xs text-slate-400">
            Agent Senior
          </div>
        </div>

        {/* Notification */}
        <div className="relative cursor-pointer text-lg">
          🔔
          <span className="absolute -top-1 -right-2 bg-red-400 hover:bg-red-600 text-white text-xs px-1 rounded-full">
            3
          </span>
        </div>

      </div>

      {/* ===== LOGOUT ===== */}
      <button className="flex items-center  gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-600 transition ">
  <LogOut size={18} />
  <span className="text-sm font-medium" ></span>
</button>

    </div>

  </div>
);


}

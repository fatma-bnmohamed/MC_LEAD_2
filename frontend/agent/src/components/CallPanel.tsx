import { useState, useEffect } from "react";

export default function CallPanel({ setAutoFilledData }: any) {

  const [seconds, setSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState("READY");
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [iaScore, setIaScore] = useState<number | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [iaSuggestion, setIaSuggestion] = useState<string | null>(null);
  const [iaDecision, setIaDecision] = useState<string | null>(null);

  const [agentDecision, setAgentDecision] = useState<string | null>(null);
  const [decisionLocked, setDecisionLocked] = useState(false);

  const [needsQualityCheck, setNeedsQualityCheck] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [shortCall, setShortCall] = useState(false);

  // ================= TIMER =================
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (callStatus === "INCALL") {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ================= START CALL =================
  const startCall = () => {
    setCallStatus("INCALL");
    setRecording(true);
    setSeconds(0);

    setAudioUrl(null);
    setIaScore(null);
    setQualityScore(null);
    setIaSuggestion(null);
    setIaDecision(null);
    setAgentDecision(null);
    setDecisionLocked(false);
    setNeedsQualityCheck(false);
    setTranscription(null);
    setShortCall(false);
  };

  // ================= END CALL =================
  const endCall = () => {
    setCallStatus("READY");
    setRecording(false);

    setAudioUrl(
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

      
    );

    // 🚨 Appel trop court
    if (seconds < 10) {
      setShortCall(true);
      setIaScore(40);
      setQualityScore(30);
      setIaSuggestion("Rejeté");
      setIaDecision("Rejeté");
      setNeedsQualityCheck(true);
      setTranscription("Appel très court. Aucune information exploitable détectée.");
      return;
    }

    // 🤖 IA scoring simulé
    const score = Math.floor(Math.random() * 18) + 80;
    setIaScore(score);

    const qScore = Math.min(100, Math.floor((seconds * 2 + score) / 2));
    setQualityScore(qScore);

    // 🧠 Suggestion IA
    if (score > 85) {
      setIaSuggestion("Qualifié");
      setIaDecision("Qualifié");
    } else if (score < 60) {
      setIaSuggestion("Rejeté");
      setIaDecision("Rejeté");
    } else {
      setIaSuggestion("À vérifier");
      setIaDecision("À vérifier");
    }

    setNeedsQualityCheck(true);

    setTranscription(
  "Bonjour, le prospect est intéressé par une assurance auto. Budget estimé 800€/an. Projet prévu dans 2 mois."
);


   setAutoFilledData({
  prenom: "Ahmed",
  budget: "800€/an",
  marque: "Peugeot",
  delai: "2 mois"
});

  };

  // ================= AGENT DECISION =================
  const handleAgentDecision = (decision: string) => {
    setAgentDecision(decision);
    setDecisionLocked(true);
  };

  return (
    <div className="h-full w-full bg-white border border-blue-100 shadow-md p-6 rounded-2xl flex flex-col space-y-6">

      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-brand-500">
          📞 Intelligence Appel IA
        </h2>

        <div className="mt-2 text-sm font-medium">
          {callStatus === "INCALL" && (
  <div className="flex justify-center items-end gap-1 h-20">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="w-1.5 bg-gradient-to-t from-blue-600 to-blue-300 rounded-full animate-pulse"
        style={{
          height: `${Math.random() * 60 + 10}px`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
)}
        </div>
      </div>

      {/* REC */}
      {recording && (
        <div className="flex items-center justify-center gap-2 text-red-400 font-semibold animate-pulse">
          🔴 Enregistrement actif
        </div>
      )}

      {/* TIMER */}
      {callStatus === "INCALL" && (
        <div className="text-center text-3xl font-bold text-blue-400">
          ⏱ {formatTime()}
        </div>
      )}

      {/* ALERT COURT */}
      {shortCall && (
        <div className="bg-red-100 text-red-700 border border-red-200 p-3 rounded-xl text-center">
          🚨 IA : Appel trop court détecté
        </div>
      )}

      {/* SCORE IA */}
      {iaScore !== null && (
  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center space-y-2">
    <div>
      🤖 Score IA : <span className="font-bold">{iaScore}%</span>
    </div>

    <div className={`text-xs font-semibold ${
      iaScore > 85 ? "text-green-600" :
      iaScore > 60 ? "text-amber-500" :
      "text-red-500"
    }`}>
      {iaScore > 85 ? "Haute confiance" :
       iaScore > 60 ? "Confiance moyenne" :
       "Faible confiance"}
    </div>
  </div>
)}

      {/* SCORE QUALITE */}
      {qualityScore !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Score Qualité</span>
            <span>{qualityScore}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-brand-400 h-3 rounded-full transition-all duration-700"
              style={{ width: `${qualityScore}%` }}
            />
          </div>
        </div>
      )}

      {/* SUGGESTION IA */}
      {iaSuggestion && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center">
          🧠 Suggestion IA : <strong>{iaSuggestion}</strong>
        </div>
      )}

      {/* VALIDATION AGENT */}
      {needsQualityCheck && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
          <div className="text-sm font-medium text-amber-700 text-center">
            Pré-validation Agent
          </div>

          {!decisionLocked && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleAgentDecision("Qualifié")}
                className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm"
              >
                Proposer Qualifié
              </button>

              <button
                onClick={() => handleAgentDecision("Rejeté")}
                className="bg-red-400 text-white px-4 py-1 hover:bg-red-600 rounded-lg text-sm"
              >
                Proposer Rejet
              </button>
            </div>
          )}

          {agentDecision && (
            <div className="text-center text-sm text-slate-700">
              ✔ Décision Agent : <strong>{agentDecision}</strong>
            </div>
          )}
        </div>
      )}

      {/* COMPARAISON IA / AGENT */}
      {agentDecision && iaDecision && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl text-center">
          📨 Lead envoyé au service qualité <br />
          Décision IA : <strong>{iaDecision}</strong> <br />
          Décision Agent : <strong>{agentDecision}</strong>
        </div>
      )}

      {/* TRANSCRIPTION */}
      {transcription && (
        <div className="bg-slate-100 p-4 rounded-xl">
          <p className="text-sm font-semibold mb-2">
            📝 Transcription automatique
          </p>
          <p className="text-sm text-slate-600">
            {transcription}
          </p>
        </div>
      )}
      {iaScore && (
  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
    <div className="text-xs font-semibold text-slate-600">
      🔍 Analyse des champs détectés
    </div>

    <ul className="text-xs space-y-1">
      <li className="text-green-600">✔ Budget détecté</li>
      <li className="text-green-600">✔ Produit mentionné</li>
      <li className="text-red-500">✖ Délai non détecté</li>
    </ul>
  </div>
)}

      {/* AUDIO */}
      {audioUrl && (
        <audio controls src={audioUrl} className="w-full" />
      )}

      {/* BUTTONS */}
      <div className="flex gap-4 justify-center mt-auto">
        {callStatus === "READY" ? (
  <button
    onClick={startCall}
    className="bg-brand-500 text-white px-6 py-2 rounded-xl hover:bg-brand-700 transition"
  >
    Simuler appel reçu
  </button>
) : (
          <button
            onClick={endCall}
            className="bg-red-400 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition"
          >
            Simuler fin appel
          </button>
        )}
      </div>

    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";


export default function LeadForm({
  leadStatus,
  leadLocked,
  iaDecision,
  agentDecision,
  iaScore,
  transcription,
  autoFilledData
}: any) {

  const [lead, setLead] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    codePostal: "",
    marque: "",
    modele: "",
    budget: "",
    delai: "",
    projetAVenir: false,
    commentaire: "",
    statut: "",
  });

 const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  useEffect(() => {
  if (autoFilledData) {
    setLead(prev => ({
      ...prev,
      ...autoFilledData
    }));

    // 🔥 détecter quels champs ont été remplis
    const fields = Object.keys(autoFilledData);
    setAutoFilledFields(fields);

    // 🔄 enlever l'effet après 2 secondes
    setTimeout(() => {
      setAutoFilledFields([]);
    }, 2000);
  }
}, [autoFilledData]);


  const steps = [
    "Nouveau",
    "En attente",
    "Validation Qualité",
    "Livré Client",
  ];

  let currentStep = 0;

  if (leadStatus === "En attente qualité") currentStep = 2;
  if (leadStatus === "Validé") currentStep = 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLead({ ...lead, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Lead envoyé :", lead);
  };

  const setStatus = (status: string) => {
    if (!leadLocked) {
      setLead({ ...lead, statut: status });
    }
  };

  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full bg-white border border-[#0E84A5] shadow-sm p-8 rounded-2xl space-y-8 flex flex-col"
>

      {/* STEPPER */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold
                ${index <= currentStep
                  ? "bg-[#0E84A5] text-white"
  : "bg-[#EFF6FF] text-[#64748B]"}`}
              >
                {index + 1}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1
                  ${index < currentStep
                    ? "bg-[#0E84A5]"
  : "bg-[#E2E8F0]"}`}
                ></div>
              )}
            </div>

            <span className="text-xs mt-2 text-slate-500 text-center">
              {step}
            </span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-brand-500">
        📋 Lead en cours
      </h2>

      {/* BADGE GLOBAL */}
      <div className="bg-[#EFF6FF] border border-[#E2E8F0] p-3 rounded-xl text-center text-sm text-[#334155]">
        Statut global : <strong>{leadStatus}</strong>
      </div>

      {/* IDENTITE */}
      <Section title="👤 Identité">
        <Input name="prenom" value={lead.prenom} onChange={handleChange} placeholder="Prénom" disabled={leadLocked} autoFilledFields={autoFilledFields}/>
        <Input name="nom" value={lead.nom} onChange={handleChange} placeholder="Nom" disabled={leadLocked} autoFilledFields={autoFilledFields} />
        <Input name="email" value={lead.email} onChange={handleChange} placeholder="Email" disabled={leadLocked} autoFilledFields={autoFilledFields} />
        <Input name="telephone" value={lead.telephone} onChange={handleChange} placeholder="Téléphone" disabled={leadLocked} autoFilledFields={autoFilledFields}/>
      </Section>

      {/* ADRESSE */}
      <Section title="📍 Adresse">
        <Input name="ville" value={lead.ville} onChange={handleChange} placeholder="Ville" disabled={leadLocked} autoFilledFields={autoFilledFields}/>
        <Input name="codePostal" value={lead.codePostal} onChange={handleChange} placeholder="Code Postal" disabled={leadLocked} autoFilledFields={autoFilledFields}/>
      </Section>

      {/* PROJET */}
      <Section title="🚗 Projet">
        <Input name="marque" value={lead.marque} onChange={handleChange} placeholder="Marque" disabled={leadLocked} autoFilledFields={autoFilledFields}/>
        <Input name="modele" value={lead.modele} onChange={handleChange} placeholder="Modèle" disabled={leadLocked} autoFilledFields={autoFilledFields}/>
        <Input name="budget" value={lead.budget} onChange={handleChange} placeholder="Budget estimé" disabled={leadLocked} autoFilledFields={autoFilledFields}/>
        <Input name="delai" value={lead.delai} onChange={handleChange} placeholder="Délai du projet" disabled={leadLocked} autoFilledFields={autoFilledFields}/>

        <label className="flex items-center gap-2 col-span-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={lead.projetAVenir}
            disabled={leadLocked}
            onChange={() =>
              setLead({ ...lead, projetAVenir: !lead.projetAVenir })
            }
          />
          Projet à venir
        </label>

        <textarea
          name="commentaire"
          value={lead.commentaire}
          onChange={handleChange}
          disabled={leadLocked}
          placeholder="Commentaires agent"
          className="input-style col-span-2"
        />
      </Section>

      {/* DECISIONS */}
      {iaDecision && agentDecision && (
        <div className="bg-[#EFF6FF] border border-[#E2E8F0] text-[#334155] p-4 rounded-xl text-center text-sm">
          🤖 Décision IA : <strong>{iaDecision}</strong><br/>
          👤 Décision Agent : <strong>{agentDecision}</strong>
        </div>
      )}
      {/* ================= RÉSULTAT APPEL ================= */}
{iaDecision && (
  <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl space-y-2">

    <div className="text-sm font-semibold text-slate-700">
      📞 Résultat du dernier appel
    </div>

    {iaScore && (
      <div className="text-sm text-[#2563EB]">
        🤖 Score IA : <strong>{iaScore}%</strong>
      </div>
    )}

    <div className="text-xs text-[#64748B] border-t border-[#E2E8F0] pt-2">
      🧠 Décision IA : <strong>{iaDecision}</strong>
    </div>

    {agentDecision && (
      <div className="text-sm">
        👤 Décision Agent : <strong>{agentDecision}</strong>
      </div>
    )}

    {transcription && (
      <div className="text-xs text-slate-500 border-t pt-2">
        📝 {transcription}
      </div>
    )}
  </div>
)}



      <button
        onClick={handleSubmit}
        disabled={leadLocked}
        className="w-full bg-gradient-to-r from-brand-200 to-brand-500 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300"
      >
        Enregistrer Lead
      </button>
     <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl space-y-2">
  <div className="text-sm font-semibold text-slate-700">
    📞 Appels associés
  </div>

  <div className="text-xs text-slate-600 space-y-1">
    <div>13:45 - 6min12s - Score 82% ✅</div>
    <div>11:20 - 1min05s - Trop court ⚠️</div>
  </div>

  <button className="text-xs text-blue-500 hover:underline">
    Voir tous les appels
  </button>
</div>
    </motion.div>
  );
}




function Section({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Input({ name, autoFilledFields, ...props }: any) {
  const isAutoFilled = autoFilledFields?.includes(name);

  return (
    <input
      {...props}
      name={name}
      className={`input-style transition-all duration-500 ${
        isAutoFilled
          ? "bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-300 animate-pulse"
          : ""
      }`}
    />
  );
}


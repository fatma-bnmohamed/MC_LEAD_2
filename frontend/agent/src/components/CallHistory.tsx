import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";

export default function CallHistory() {

  const [activeCard, setActiveCard] = useState<string | null>(null);

  const data = [
    { leads: 5 },
    { leads: 8 },
    { leads: 6 },
    { leads: 10 },
    { leads: 12 },
  ];

  const sla = 75;

  return (
    <div className="bg-white border  shadow-md p-6 rounded-2xl space-y-8">

      <h2 className="text-xl font-bold text-brand-500">
        📊 Performance Agent
      </h2>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-3 gap-4">

        {[
          { title: "Appels", value: "25", color: "bg-brand-400" },
          { title: "Leads validés", value: "18", color: "bg-green-600" },
          { title: "Taux de rejet", value: "28%", color: "bg-red-400" },
        ].map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setActiveCard(card.title)}
            onHoverEnd={() => setActiveCard(null)}
            className={`${card.color} text-white p-4 rounded-xl text-center cursor-pointer relative transition shadow-md`}
          >
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm">{card.title}</div>

            {activeCard === card.title && (
              <div className="absolute inset-0 rounded-xl bg-white/20 blur-md animate-pulse"></div>
            )}
          </motion.div>
        ))}

      </div>

      {/* ================= SLA PROGRESSION ================= */}
      <div>
        <div className="flex justify-between mb-2 text-sm text-slate-600">
          <span>🎯 SLA Client</span>
          <span className="font-semibold text-blue-6600">{sla}%</span>
        </div>

        <div className="w-full bg-blue-100 rounded-full h-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sla}%` }}
            transition={{ duration: 1.5 }}
            className="bg-brand-400 h-4 rounded-full"
          />
        </div>
      </div>

      {/* ================= GRAPH ================= */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #3B82F6",
              borderRadius: "8px"
            }}
          />
          <Line
            type="monotone"
            dataKey="leads"
            stroke="#0E84A5"   
            strokeWidth={3}
            dot={{ r: 4 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

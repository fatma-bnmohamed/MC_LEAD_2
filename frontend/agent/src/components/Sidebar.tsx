import { useState } from "react";

export default function Sidebar() {

  const [active, setActive] = useState("Dashboard");

  const menu = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Leads", icon: "📞" },
    { name: "Performance", icon: "📊" },
    { name: "Profil", icon: "👤" },
  ];

  return (
    <div className="h-full w-full bg-brand-600 backdrop-blur-md border border-blue-100 rounded-2xl p-6 shadow-lg flex flex-col justify-between">

      {/* HEADER */}
      <div>

        <div className="mb-8">
          <h1 className="text-lg font-bold text-white/100">
            MC LEAD
          </h1>
          
        </div>

        {/* MENU */}
        <div className="space-y-2">

          {menu.map((item) => (
            <div
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                ${
                  active === item.name
                    ? "bg-brand-400 text-white shadow-sm"
                    : "hover:bg-brand-900 text-white/80"
                }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">
                {item.name}
              </span>
            </div>
          ))}

        </div>

      </div>

      

    </div>
  );
}

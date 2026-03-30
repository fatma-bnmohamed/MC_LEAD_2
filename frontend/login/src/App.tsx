
import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

 const handleLogin = async () => {

    setErrorMessage("");

    try {

      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Erreur serveur");
        return;
      }

      if (data.message === "Account archived") {
        setErrorMessage("Utilisateur archivé, merci de contacter votre administrateur");
        return;
      }

      if (data.message === "Account inactive") {
        setErrorMessage("Votre compte est désactivé, merci de contacter votre administrateur");
        return;
      }

      if (data.message === "Invalid password") {
        setErrorMessage("Mot de passe incorrect");
        return;
      }

      if (data.message === "User not found") {
        setErrorMessage("Utilisateur introuvable");
        return;
      }

      if (data.token) {

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("DATA:", data);
        console.log("USER STORED:", JSON.stringify(data));
        if (["admin", "validation", "qualite", "agent"].includes(data.user.role)) {
          window.location.href = `http://localhost:3000/#/dashboard?token=${data.token}&user=${encodeURIComponent(JSON.stringify(data.user))}`;
        }

        /*if (data.user.role === "agent") {
          window.location.href = `http://localhost:3000/#/dashboard?token=${data.token}`;
        }*/

      }

    } catch (err) {
      setErrorMessage("Erreur connexion serveur");
    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">

      {/* Background spheres */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="sphere sphere1"></div>
        <div className="sphere sphere2"></div>
        <div className="sphere sphere3"></div>
        <div className="sphere sphere4"></div>
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-[380px] p-10 bg-white rounded-2xl shadow-2xl border border-gray-200"
      >
        <h1 className="text-3xl font-bold text-center text-[#0E84A5] hover:text-[#0A6C87] mb-8">
          LOGIN
        </h1>

        {/* Username */}
        <div className="mb-5">
          <label className="text-sm text-gray-600">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Password</label>
          <div className="relative mt-2">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>

          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-lg mt-4 text-center">
              ⚠ {errorMessage}
            </div>
          )}
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="w-full py-3 rounded-full bg-[#0E84A5] hover:bg-[#0A6C87] text-white font-semibold transition"
        >
          Sign In
        </button>

        {/* Links */}
        <div className="flex justify-between mt-5 text-sm text-[#0E84A5] hover:text-[#0A6C87]">
          <a href="#">Forgot password?</a>
          <a href="#">Sign up</a>
        </div>

      </motion.div>

    </div>
  );
}


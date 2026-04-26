import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { User, Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", formData);

      localStorage.setItem("token", response.data.token);

      // ✅ instead of window.location
      navigate("/");

    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundImage:
           "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "90%",
          maxWidth: 500,
          padding: "32px 36px",       /* ✅ padding کافی از همه طرف */
          borderRadius: 16,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          boxSizing: "border-box",    /* ✅ عرض شامل padding می‌شه */
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 25 }}>
          <div style={{ fontSize: 24, fontWeight: "bold" }}>
            🏗 Construction System
          </div>
          <div style={{ fontSize: 13, color: "#cbd5e1" }}>
            Accounting & Project Management
          </div>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Login to Your Account
        </h2>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid #ef4444",
              padding: 10,
              borderRadius: 8,
              marginBottom: 15,
              color: "#ef4444",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 15 }}>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute", 
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  
                }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 38px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box", /* ✅ کلید حل مشکل */
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 38px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  outline: "none",
                  boxSizing: "border-box", /* ✅ کلید حل مشکل */
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <a
              href="#"
              style={{ color: "#60a5fa", fontSize: 13, textDecoration: "none" }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <User size={18} style={{ marginRight: 8 }} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          © 2026 Construction Management System
        </div>
      </div>
    </div>
  );
}
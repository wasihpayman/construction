import { useEffect, useState } from "react";
import api from "../services/projectApi";
import { useProject } from "../contexts/ProjectContext";
import "../styles/responsive.css";

export default function UnitSales() {
  const { activeProjectId, hasActiveProject } = useProject();
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (hasActiveProject) {
      load();
    }
  }, [activeProjectId, hasActiveProject]);

  const load = async () => {
    try {
      setItems([]);
      setUnits([]);
      setClients([]);
      
      const [salesData, unitsData, clientsData] = await Promise.all([
        api.get("/unit-sales"),
        api.get("/units"),
        api.get("/clients")
      ]);
      
      setItems(salesData.data || []);
      setUnits(unitsData.data || []);
      setClients(clientsData.data || []);
    } catch (error) {
      console.error("Error loading unit sales data:", error);
      setItems([]);
      setUnits([]);
      setClients([]);
    }
  };

  const handleSubmit = async () => {
    // Check if project is selected
    if (!hasActiveProject) {
      alert("Please select a project first!");
      return;
    }
    
    await api.post("/unit-sales", form);
    setForm({});
    load();
  };

  if (!hasActiveProject) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        flexDirection: "column",
        gap: "20px",
        background: "linear-gradient(135deg, #0a0e27, #1e1b4b)",
        color: "white"
      }}>
        <div style={{ fontSize: "48px" }}>No Project Selected</div>
        <p style={{ fontSize: "18px", color: "#94a3b8" }}>Please select a project to manage unit sales</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e27, #1e1b4b)",
      padding: "20px",
      color: "white"
    }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 30 }}>
        Unit Sales Management
      </h1>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        padding: 30,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        marginBottom: 30
      }}>
        <h2 style={{ marginBottom: 20, fontSize: 24 }}>Sell New Unit</h2>
        
        <div style={{ display: "grid", gap: 20, maxWidth: 400 }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
              Select Unit
            </label>
            <select 
              onChange={e => setForm({ ...form, unit_id: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px"
              }}
            >
              <option value="">Choose a unit...</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.unit_number} - {u.type || 'Unit'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
              Select Client
            </label>
            <select 
              onChange={e => setForm({ ...form, client_id: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px"
              }}
            >
              <option value="">Choose a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
              Sale Price
            </label>
            <input 
              type="number"
              placeholder="Enter sale price..."
              onChange={e => setForm({ ...form, sale_price: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px"
              }}
            />
          </div>

          <button 
            onClick={handleSubmit}
            style={{
              padding: "12px 24px",
              background: "#10b981",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Save Sale
          </button>
        </div>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        padding: 30,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{ marginBottom: 20, fontSize: 24 }}>Recent Sales</h2>
        
        {items.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No sales recorded yet</p>
        ) : (
          <div style={{ display: "grid", gap: 15 }}>
            {items.map(i => (
              <div key={i.id} style={{
                background: "rgba(255,255,255,0.05)",
                padding: 15,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: "bold" }}>
                      {i.unit?.unit_number || 'Unknown Unit'}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 14 }}>
                      Client: {i.client?.name || 'Unknown Client'}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#10b981"
                  }}>
                    ${i.sale_price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
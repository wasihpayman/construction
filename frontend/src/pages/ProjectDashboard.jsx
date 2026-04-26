import { useState, useEffect } from "react";
import { useProject } from "../contexts/ProjectContext";
import projectApi from "../services/projectApi";
import ProjectGate from "../components/ProjectGate";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Building, 
  FileText, 
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function ProjectDashboard() {
  const { activeProject, hasActiveProject } = useProject();
  // Direct API calls using projectApi
  
  const [data, setData] = useState({
    workers: [],
    parties: [],
    categories: [],
    models: [],
    financial: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasActiveProject) {
      loadDashboardData();
    }
  }, [hasActiveProject]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        workersRes,
        partiesRes,
        categoriesRes,
        modelsRes,
        financialRes
      ] = await Promise.all([
        projectApi.get("/workers"),
        projectApi.get("/parties"),
        projectApi.get("/material-categories"),
        projectApi.get("/project-models"),
        projectApi.get("/financial-data")
      ]);

      setData({
        workers: workersRes.data || [],
        parties: partiesRes.data || [],
        categories: categoriesRes.data || [],
        models: modelsRes.data || [],
        financial: financialRes.data || null
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0.00";
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateTotals = () => {
    const workerSalaries = data.workers.reduce((sum, worker) => sum + (parseFloat(worker.salary) || 0), 0);
    const partyContributions = data.parties.reduce((sum, party) => sum + (parseFloat(party.amount_contributed) || 0), 0);
    
    return {
      totalWorkers: data.workers.length,
      totalCategories: data.categories.length,
      totalModels: data.models.length,
      totalSalaries: workerSalaries,
      totalContributions: partyContributions,
      balance: partyContributions - workerSalaries
    };
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #0a0e27, #1e1b4b)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        color: "white" 
      }}>
        Loading dashboard...
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <ProjectGate>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e27, #1e1b4b)", padding: "20px", color: "white" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 10px" }}>
            <Building size={32} style={{ marginRight: "15px", verticalAlign: "middle" }} />
            Project Dashboard
          </h1>
          {activeProject && (
            <div style={{ display: "flex", alignItems: "center", gap: "20px", color: "#94a3b8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} />
                <span>{activeProject.location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={16} />
                <span>{activeProject.start_date}</span>
              </div>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(59, 130, 246, 0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.totalWorkers}</div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>Total Workers</div>
              </div>
            </div>
            <div style={{ color: "#3b82f6", fontSize: "14px" }}>Active team members</div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={24} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.totalCategories}</div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>Material Categories</div>
              </div>
            </div>
            <div style={{ color: "#10b981", fontSize: "14px" }}>Sih, Jghal, Masa, etc.</div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(139, 92, 246, 0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={24} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.totalModels}</div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>3D Models</div>
              </div>
            </div>
            <div style={{ color: "#8b5cf6", fontSize: "14px" }}>GLB, GLTF, OBJ files</div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <div style={{ width: "48px", height: "48px", background: totals.balance >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {totals.balance >= 0 ? <TrendingUp size={24} color="#10b981" /> : <TrendingDown size={24} color="#ef4444" />}
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: totals.balance >= 0 ? "#10b981" : "#ef4444" }}>
                  ${formatNumber(Math.abs(totals.balance))}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>Net Balance</div>
              </div>
            </div>
            <div style={{ color: totals.balance >= 0 ? "#10b981" : "#ef4444", fontSize: "14px" }}>
              {totals.balance >= 0 ? "Positive balance" : "Deficit"}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <DollarSign size={20} color="#10b981" />
              <span>Income (Party Contributions)</span>
            </h3>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981", marginBottom: "15px" }}>
              ${formatNumber(totals.totalContributions)}
            </div>
            <div style={{ color: "#94a3b8" }}>
              From {totals.totalContributions > 0 ? totals.parties.length : 0} party contributors
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <CreditCard size={20} color="#ef4444" />
              <span>Expenses (Worker Salaries)</span>
            </h3>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ef4444", marginBottom: "15px" }}>
              ${formatNumber(totals.totalSalaries)}
            </div>
            <div style={{ color: "#94a3b8" }}>
              For {totals.totalWorkers} workers
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "20px"
        }}>
          <h3 style={{ margin: "0 0 20px" }}>Recent Activity</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr)", gap: "20px" }}>
            {/* Recent Workers */}
            <div>
              <h4 style={{ color: "#3b82f6", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} />
                Recent Workers
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.workers.slice(0, 3).map(worker => (
                  <div key={worker.id} style={{ 
                    background: "rgba(255,255,255,0.03)", 
                    padding: "12px", 
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{worker.full_name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                      <span>{worker.position}</span>
                      <span>${formatNumber(worker.salary)}</span>
                    </div>
                  </div>
                ))}
                {data.workers.length === 0 && (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>
                    No workers added yet
                  </div>
                )}
              </div>
            </div>

            {/* Recent Parties */}
            <div>
              <h4 style={{ color: "#10b981", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} />
                Recent Parties
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.parties.slice(0, 3).map(party => (
                  <div key={party.id} style={{ 
                    background: "rgba(255,255,255,0.03)", 
                    padding: "12px", 
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{party.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                      <span>{party.phone || "No phone"}</span>
                      <span>${formatNumber(party.amount_contributed)}</span>
                    </div>
                  </div>
                ))}
                {data.parties.length === 0 && (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>
                    No parties added yet
                  </div>
                )}
              </div>
            </div>

            {/* Material Categories */}
            <div>
              <h4 style={{ color: "#8b5cf6", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={16} />
                Material Categories
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.categories.slice(0, 3).map(category => (
                  <div key={category.id} style={{ 
                    background: "rgba(255,255,255,0.03)", 
                    padding: "12px", 
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div style={{ fontWeight: "bold" }}>{category.name}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Created {new Date(category.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {data.categories.length === 0 && (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>
                    No categories created yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Models Section */}
        {data.models.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={20} color="#8b5cf6" />
              3D Project Models
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr)", gap: "15px" }}>
              {data.models.map(model => (
                <div key={model.id} style={{
                  background: "rgba(255,255,255,0.03)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ fontWeight: "bold", marginBottom: "8px" }}>{model.original_name}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {model.file_type.toUpperCase()} - {(model.file_size / 1024 / 1024).toFixed(1)} MB
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px" }}>
                    Uploaded {new Date(model.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Info */}
        <div style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "30px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontWeight: "bold", color: "#10b981" }}>Project-Based System Active</span>
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>
            All data shown above is filtered for: <strong>{activeProject?.name}</strong>
          </div>
        </div>
      </div>
    </ProjectGate>
  );
}

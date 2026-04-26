import { useEffect, useState } from "react";
import api from "../services/api";
import { useProject } from "../contexts/ProjectContext";
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function UnitsModule() {
  const { activeProjectId, hasActiveProject } = useProject();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  // Load units when project changes
  useEffect(() => {
    if (hasActiveProject && activeProjectId) {
      loadUnits();
    } else {
      // Clear data when no project is selected
      setUnits([]);
      setLoading(false);
    }
  }, [activeProjectId, hasActiveProject]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      // Clear previous data immediately
      setUnits([]);
      
      const response = await api.get("/units");
      setUnits(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!hasActiveProject) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "400px",
        flexDirection: "column",
        gap: "20px"
      }}>
        <AlertCircle size={48} style={{ color: "#f59e0b" }} />
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", marginBottom: "10px" }}>No Project Selected</h2>
          <p style={{ color: "#94a3b8" }}>Please select a project to view units</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px" 
      }}>
        <div>
          <h1 style={{ color: "white", fontSize: "24px", marginBottom: "5px" }}>
            Units Management
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Showing {filteredUnits.length} of {units.length} units
            {activeProjectId && ` (Project ID: ${activeProjectId})`}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={loadUnits}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "#10b981",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer"
            }}
          >
            <Plus size={16} />
            Add Unit
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "25px",
        flexWrap: "wrap"
      }}>
        <div style={{ 
          flex: 1, 
          minWidth: "250px",
          position: "relative"
        }}>
          <Search 
            size={18} 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "#94a3b8"
            }} 
          />
          <input
            type="text"
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px"
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "200px",
          gap: "15px"
        }}>
          <div 
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid #94a3b8",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}
          />
          <span style={{ color: "#94a3b8" }}>Loading units...</span>
        </div>
      )}

      {/* Units Grid */}
      {!loading && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
          gap: "20px" 
        }}>
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "20px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.08)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.05)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "15px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Building size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ 
                      color: "white", 
                      fontSize: "16px", 
                      fontWeight: "bold",
                      marginBottom: "2px"
                    }}>
                      {unit.name || `Unit ${unit.id}`}
                    </h3>
                    <p style={{ 
                      color: "#94a3b8", 
                      fontSize: "12px",
                      margin: 0
                    }}>
                      {unit.status || 'Available'}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setEditingUnit(unit)}
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "6px",
                      color: "#3b82f6",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Edit size={14} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      color: "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
                {unit.description || "No description available"}
              </div>
              
              {unit.price && (
                <div style={{
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <span style={{ color: "#10b981", fontSize: "18px", fontWeight: "bold" }}>
                    ${unit.price?.toLocaleString() || '0'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUnits.length === 0 && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "200px",
          flexDirection: "column",
          gap: "15px"
        }}>
          <Building size={48} style={{ color: "#94a3b8" }} />
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "white", marginBottom: "5px" }}>
              {searchTerm ? "No units found" : "No units yet"}
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Add your first unit to get started"
              }
            </p>
          </div>
        </div>
      )}

      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  function handleDeleteUnit(unitId) {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      // Delete logic here
      setUnits(units.filter(unit => unit.id !== unitId));
    }
  }
}

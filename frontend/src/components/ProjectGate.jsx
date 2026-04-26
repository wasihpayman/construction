import { useProject } from "../contexts/ProjectContext";
import { Building, AlertCircle } from "lucide-react";

export default function ProjectGate({ children }) {
  const { hasActiveProject, activeProject } = useProject();

  if (!hasActiveProject) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27, #1e1b4b)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "60px",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 30px"
          }}>
            <AlertCircle size={40} color="#ef4444" />
          </div>
          
          <h2 style={{
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            margin: "0 0 15px"
          }}>
            No Project Selected
          </h2>
          
          <p style={{
            color: "#94a3b8",
            fontSize: "16px",
            lineHeight: "1.6",
            margin: "0 0 30px"
          }}>
            Please select a project from the dropdown in the navigation bar to access this module. All data is organized by project for better management.
          </p>
          
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "15px"
            }}>
              <Building size={24} color="#10b981" />
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "white", fontWeight: "bold", marginBottom: "5px" }}>
                  Core Rule
                </div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                  NO DATA is global. Everything depends on project_id
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "8px",
            padding: "15px"
          }}>
            <div style={{ color: "#10b981", fontSize: "14px", fontWeight: "bold" }}>
              Click "Select Project" in the top navigation bar to continue
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

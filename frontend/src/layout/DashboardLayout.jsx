import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { ChevronDown } from "lucide-react";
import api from "../services/projectApi";
import { useProject } from "../contexts/ProjectContext";

export default function DashboardLayout({ children }) {
  const [projects, setProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const { activeProject, selectProject, hasActiveProject } = useProject();

  useEffect(() => {
    loadProjects();
  }, [activeProject]); // Reload projects when active project changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProjectDropdown && !event.target.closest('.project-selector')) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProjectDropdown]);

  const loadProjects = async () => {
    try {
      const response = await api.get("/project-management");
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    }
  };

  const handleProjectSelect = (project) => {
    selectProject(project);
    setShowProjectDropdown(false);
    // Data will automatically update through ProjectContext
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ 
        flex: 1, 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27, #1e1b4b)",
        color: "white",
      }}>
        {/* Navbar */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          padding: "15px 30px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
            Construction Management System
          </h1>

          {/* Project Selector */}
          <div className="project-selector" style={{ position: "relative" }}>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              {activeProject ? activeProject.name : "Select Project"}
              <ChevronDown size={20} />
            </button>

            {showProjectDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "#1e1b4b",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                marginTop: "8px",
                minWidth: "200px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                zIndex: 1000
              }}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{project.name}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {project.location}
                    </div>
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <div style={{ padding: "12px 16px", color: "#94a3b8" }}>
                    No projects available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: "30px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
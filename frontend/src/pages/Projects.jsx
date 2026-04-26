import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Edit2, Trash2, MapPin, Calendar, Building, X } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    start_date: "",
    finish_at: "",
    description: ""
  });

  // Function to format date to YYYY/MMM/DD format
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/project-management");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await api.put(`/project-management/${editing.id}`, form);
      } else {
        await api.post("/project-management", form);
      }
      
      fetchProjects();
      setShowModal(false);
      setEditing(null);
      setForm({
        name: "",
        location: "",
        start_date: "",
        finish_at: "",
        description: ""
      });
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Error saving project");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name,
      location: project.location,
      start_date: project.start_date,
      finish_at: project.finish_at || "",
      description: project.description || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/project-management/${id}`);
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Error deleting project");
      }
    }
  };

  const openModal = () => {
    setEditing(null);
    setForm({
      name: "",
      location: "",
      start_date: "",
      finish_at: "",
      description: ""
    });
    setShowModal(true);
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
        Loading projects...
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
          Project Management
        </h1>
        <button
          onClick={openModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            background: "#10b981",
            border: "none",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          <Plus size={20} />
          Create Project
        </button>
      </div>

      {/* Projects Table */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Project Name
              </th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Location
              </th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Start Date
              </th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Finish Date
              </th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Description
              </th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Building size={20} color="#10b981" />
                    <span style={{ fontWeight: "bold" }}>{project.name}</span>
                  </div>
                </td>
                <td style={{ padding: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={16} color="#94a3b8" />
                    {project.location}
                  </div>
                </td>
                <td style={{ padding: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={16} color="#94a3b8" />
                    {formatDate(project.start_date)}
                  </div>
                </td>
                <td style={{ padding: "15px" }}>
                  {formatDate(project.finish_at)}
                </td>
                <td style={{ padding: "15px" }}>
                  <span style={{ color: "#94a3b8" }}>
                    {project.description ? project.description.substring(0, 50) + "..." : "No description"}
                  </span>
                </td>
                <td style={{ padding: "15px" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      onClick={() => handleEdit(project)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "8px 12px",
                        background: "#3b82f6",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "8px 12px",
                        background: "#ef4444",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {projects.length === 0 && (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
            <Building size={48} style={{ margin: "0 auto 20px", opacity: 0.5 }} />
            <h3>No projects found</h3>
            <p>Create your first project to get started</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#1e1b4b",
            padding: 30,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            width: "90%",
            maxWidth: 600
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>
                {editing ? "Edit Project" : "Create New Project"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: 5
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
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

                <div>
                  <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                    Finish Date
                  </label>
                  <input
                    type="date"
                    name="finish_at"
                    value={form.finish_at}
                    onChange={handleChange}
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
              </div>

              <div style={{ marginBottom: 30 }}>
                <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 15 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#10b981",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  {saving ? "Saving..." : (editing ? "Update Project" : "Create Project")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
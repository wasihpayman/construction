import { useState, useEffect } from "react";
import { useProjectApi } from "../services/projectApi";
import ProjectGate from "../components/ProjectGate";
import { Users, Plus, Edit2, Trash2, DollarSign, Calendar, Phone, MapPin, FileText } from "lucide-react";

export default function WorkersModule() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    position: "",
    start_date: "",
    salary: "",
    phone: "",
    address: "",
    description: "",
    national_id: "",
    contract_file: null
  });

  const { getWorkers, createWorker, updateWorker, deleteWorker } = useProjectApi();

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await getWorkers();
      setWorkers(response.data || []);
    } catch (error) {
      console.error("Error loading workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });

      if (editing) {
        await updateWorker(editing.id, formData);
      } else {
        await createWorker(formData);
      }
      
      loadWorkers();
      setShowModal(false);
      setEditing(null);
      resetForm();
    } catch (error) {
      console.error("Error saving worker:", error);
      alert("Error saving worker");
    }
  };

  const handleEdit = (worker) => {
    setEditing(worker);
    setForm({
      full_name: worker.full_name || "",
      position: worker.position || "",
      start_date: worker.start_date || "",
      salary: worker.salary || "",
      phone: worker.phone || "",
      address: worker.address || "",
      description: worker.description || "",
      national_id: worker.national_id || "",
      contract_file: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        await deleteWorker(id);
        loadWorkers();
      } catch (error) {
        console.error("Error deleting worker:", error);
        alert("Error deleting worker");
      }
    }
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      position: "",
      start_date: "",
      salary: "",
      phone: "",
      address: "",
      description: "",
      national_id: "",
      contract_file: null
    });
  };

  return (
    <ProjectGate>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e27, #1e1b4b)", padding: "20px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
            <Users size={32} style={{ marginRight: 15, verticalAlign: "middle" }} />
            Workers Management
          </h1>
          <button
            onClick={() => {
              resetForm();
              setEditing(null);
              setShowModal(true);
            }}
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
            Add Worker
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>Loading workers...</div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Worker</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Position</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Contact</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Salary</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Start Date</th>
                  <th style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "15px" }}>
                      <div>
                        <div style={{ fontWeight: "bold", marginBottom: 5 }}>{worker.full_name}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>ID: {worker.national_id}</div>
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", display: "inline-block" }}>
                        {worker.position}
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Phone size={14} color="#94a3b8" />
                          <span style={{ fontSize: "14px" }}>{worker.phone}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={14} color="#94a3b8" />
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{worker.address}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <DollarSign size={16} color="#10b981" />
                        <span style={{ fontWeight: "bold", color: "#10b981" }}>{worker.salary}</span>
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={14} color="#94a3b8" />
                        <span>{worker.start_date}</span>
                      </div>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(worker)}
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
                          onClick={() => handleDelete(worker.id)}
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

            {workers.length === 0 && (
              <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                <Users size={48} style={{ margin: "0 auto 20px", opacity: 0.5 }} />
                <h3>No workers found</h3>
                <p>Add your first worker to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Modal for Add/Edit Worker */}
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
              maxWidth: 600,
              maxHeight: "80vh",
              overflowY: "auto"
            }}>
              <h2 style={{ margin: "0 0 20px" }}>
                {editing ? "Edit Worker" : "Add New Worker"}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
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
                    <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={form.position}
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
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Start Date *</label>
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
                    <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Salary *</label>
                    <input
                      type="number"
                      name="salary"
                      value={form.salary}
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
                    <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>National ID</label>
                    <input
                      type="text"
                      name="national_id"
                      value={form.national_id}
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

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
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

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
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

                <div style={{ marginBottom: 30 }}>
                  <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Description</label>
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

                <div style={{ marginBottom: 30 }}>
                  <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>Contract File</label>
                  <input
                    type="file"
                    name="contract_file"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx"
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

                <div style={{ display: "flex", gap: 15 }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#10b981",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                  >
                    {editing ? "Update Worker" : "Create Worker"}
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
    </ProjectGate>
  );
}

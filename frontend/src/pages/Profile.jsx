import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/responsive.css";
import { User, Mail, Phone, MapPin, Camera, Lock, Save, X, LogOut } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profile_photo: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    // Check if token exists before loading profile
    const token = localStorage.getItem("token");
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await api.get("/profile");
      setProfile(response.data);
      setProfileLoaded(true);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validation check
    if (!profileLoaded) {
      alert("Please wait for profile to load!");
      setSaving(false);
      return;
    }
    
    if (!profile.name || !profile.email) {
      alert("Name and email are required!");
      setSaving(false);
      return;
    }

    const formData = new FormData();
    
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("phone", profile.phone || "");
    formData.append("address", profile.address || "");

    if (selectedPhoto) {
      formData.append("profile_photo", selectedPhoto, selectedPhoto.name);
    }

    try {
      formData.append("_method", "PUT");
      const response = await api.post("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setProfile(response.data.user);
      setPhotoPreview(null);
      setSelectedPhoto(null);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          alert(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
        });
      } else {
        alert("Error updating profile: " + (error.response?.data?.error || error.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedProject");
    window.location.href = "/login";
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/profile/password", passwordData);
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: ""
      });
      setShowPasswordModal(false);
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Error updating password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await api.delete("/profile/photo");
      setProfile({ ...profile, profile_photo: null });
      setPhotoPreview(null);
      setSelectedPhoto(null);
      alert("Profile photo deleted successfully!");
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Error deleting photo");
    }
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
        Loading profile...
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
        Profile Settings
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 30, maxWidth: 1200, margin: "0 auto" }}>
        {/* Profile Photo Section */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          padding: 30,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: 20 }}>Profile Photo</h2>
          
          <div style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "3px solid rgba(255,255,255,0.2)"
          }}>
            {photoPreview || profile.profile_photo_url ? (
              <img
                src={photoPreview || profile.profile_photo_url}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <User size={60} color="#94a3b8" />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#10b981",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              justifyContent: "center"
            }}>
              <Camera size={20} />
              Change Photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>

            {profile.profile_photo_url && (
              <button
                onClick={handleDeletePhoto}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  justifyContent: "center"
                }}
              >
                <X size={20} />
                Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Profile Information Section */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          padding: 30,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h2 style={{ marginBottom: 20 }}>Personal Information</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
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
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
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
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
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
              <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                Address
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                rows={3}
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
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  background: saving ? "#6b7280" : "#10b981",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                <Save size={20} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                <LogOut size={20} />
                Logout
              </button>

              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  background: "#3b82f6",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                <Lock size={20} />
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
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
            maxWidth: 400
          }}>
            <h3 style={{ marginBottom: 20 }}>Change Password</h3>
            
            <form onSubmit={handlePasswordUpdate}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                  required
                  minLength={8}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 5, color: "#94a3b8" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#10b981",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
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

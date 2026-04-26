import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CategoryFormBuilder from "../components/CategoryFormBuilder";
import api from "../services/api";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function CategoryFormBuilderPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasForm, setHasForm] = useState(false);

  useEffect(() => {
    fetchCategoryInfo();
  }, [categoryId]);

  const fetchCategoryInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${categoryId}/form`);
      setCategory({
        id: response.data.category_id,
        name: response.data.category_name
      });
      setHasForm(response.data.has_form);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormCreated = () => {
    navigate(`/category/${categoryId}`);
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading category...</p>

        <style>{css}</style>
      </div>
    );
  }

  /* ---------------- FORM EXISTS ---------------- */
  if (hasForm) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <AlertTriangle size={34} color="#fff" />
          </div>

          <h1 style={styles.title}>Form Already Exists</h1>

          <p style={styles.text}>
            Category: <span style={styles.highlight}>{category?.name}</span>
          </p>

          <p style={styles.subText}>
            This form is locked and cannot be modified.
          </p>

          <button style={styles.button} onClick={() => navigate(`/category/${categoryId}`)}>
            Go to Form <ArrowRight size={18} />
          </button>
        </div>

        <style>{css}</style>
      </div>
    );
  }

  /* ---------------- BUILDER ---------------- */
  return (
    <div style={styles.builderWrapper}>
      <CategoryFormBuilder
        categoryId={categoryId}
        categoryName={category?.name}
        onFormCreated={handleFormCreated}
      />

      <style>{css}</style>
    </div>
  );
}

/* ---------------- INLINE STYLES ---------------- */
const styles = {
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 25%, #0a0e27 50%, #1e1b4b 75%, #0a0e27 100%)",
    color: "#fff",
    position: "relative"
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid " + "rgba(59, 130, 246, 0.1)",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    fontWeight: "500"
  },

  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 25%, #0a0e27 50%, #1e1b4b 75%, #0a0e27 100%)",
    padding: 20,
    position: "relative"
  },

  card: {
    width: "420px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid " + "rgba(255, 255, 255, 0.18)",
    borderRadius: "24px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    position: "relative"
  },

  iconBox: {
    width: "70px",
    height: "70px",
    borderRadius: "16px",
    margin: "0 auto 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
  },

  title: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "10px",
    letterSpacing: "-0.02em"
  },

  text: {
    color: "#94a3b8",
    marginBottom: "10px",
    fontSize: "0.875rem"
  },

  highlight: {
    color: "#60a5fa",
    fontWeight: "bold"
  },

  subText: {
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "20px"
  },

  button: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    alignItems: "center",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
  },

  builderWrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 25%, #0a0e27 50%, #1e1b4b 75%, #0a0e27 100%)",
    padding: 20,
    position: "relative"
  }
};

/* ---------------- CSS ANIMATION ---------------- */
const css = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
import { useEffect, useState } from "react";
import api from "../services/projectApi";
import { useProject } from "../contexts/ProjectContext";
import "../styles/responsive.css";

export default function Materials() {
  const { activeProjectId, hasActiveProject } = useProject();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (hasActiveProject) {
      setItems([]);
      api.get("/materials").then(res => setItems(res.data));
    }
  }, [activeProjectId, hasActiveProject]);

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
        <div style={{ fontSize: "48px" }}>No Project Selected</div>
        <p>Please select a project to view materials</p>
      </div>
    );
  }

  return (
    <div className="responsive-container">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center sm:text-left">Materials</h1>
      <div className="responsive-grid">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-4">No Materials Yet</h3>
            <p className="text-gray-200">Add your first material to get started</p>
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setItems([])}
            >
              <Plus size={20} />
              Add First Material
            </button>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="responsive-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="text-gray-300 text-sm">Material ID: {item.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-400">${item.price_per_unit}</span>
                  <span className="text-gray-400 text-sm">per unit</span>
                </div>
              </div>
              <div className="text-gray-300 text-sm">
                <p>Stock: {item.stock_quantity || 0} units</p>
                <p>Category: {item.category || 'Uncategorized'}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Edit functionality
                  }}
                >
                  <Plus size={14} />
                  Edit
                </button>
                <button 
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  onClick={() => {
                    // Delete functionality
                  }}
                >
                  <Plus size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
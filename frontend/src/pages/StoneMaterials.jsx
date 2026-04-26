import { useEffect, useState } from "react";
import api from "../services/api";
import { Package, Plus, Edit, Trash2, CheckCircle2, X, AlertCircle, Search, Filter, Calendar, DollarSign, TrendingUp, CreditCard, Truck } from "lucide-react";
import "../css/Units.css";

export default function StoneMaterials() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    payment_status: '',
  });

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    bill_number: "",
    date: new Date().toISOString().split('T')[0],
    truck_type: "Other",
    currency: "AFN",
    payment_status: "pending",
  });

  // Date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${date.getFullYear()} ${months[date.getMonth()]} ${date.getDate()}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [materialsData, categoriesData] = await Promise.all([
        api.get("/stone-materials"),
        api.get("/material-categories"),
      ]);
      setMaterials(materialsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...materials];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(searchLower) ||
        m.bill_number?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.category_id) {
      filtered = filtered.filter(m => m.category_id == filters.category_id);
    }
    
    if (filters.payment_status) {
      filtered = filtered.filter(m => m.payment_status === filters.payment_status);
    }
    
    return filtered;
  };

  const filteredMaterials = applyFilters();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category_id: '', payment_status: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMaterial) {
        await api.put(`/stone-materials/${selectedMaterial.id}`, formData);
      } else {
        await api.post("/stone-materials", formData);
      }
      closeModal();
      loadData();
    } catch (error) {
      console.error("Error saving material:", error);
      alert("Error saving material. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        await api.delete(`/stone-materials/${id}`);
        loadData();
      } catch (error) {
        console.error("Error deleting material:", error);
        alert("Error deleting material. Please try again.");
      }
    }
  };

  const openModal = (material = null) => {
    setSelectedMaterial(material);
    if (material) {
      setFormData({
        category_id: material.category_id,
        name: material.name,
        bill_number: material.bill_number,
        date: material.date,
        truck_type: material.truck_type,
        currency: material.currency,
        payment_status: material.payment_status,
      });
    } else {
      setFormData({
        category_id: "",
        name: "",
        bill_number: "",
        date: new Date().toISOString().split('T')[0],
        truck_type: "Other",
        currency: "AFN",
        payment_status: "pending",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMaterial(null);
  };

  const hasActiveFilters = filters.search || filters.category_id || filters.payment_status;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
            <Package className="absolute inset-0 m-auto text-blue-400" size={22} />
          </div>
          <p className="text-blue-200 font-medium tracking-wide">Loading Stone Materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="units-container">
      {/* Header */}
      <div className="units-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-icon">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="header-text">
              <h1>Stone Materials</h1>
              <p>Manage stone materials and truck deliveries</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={() => openModal()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Stone
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Materials</div>
              <div className="stat-value">{filteredMaterials.length}</div>
            </div>
            <div className="stat-icon">
              <Package size={18} className="text-blue-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Paid Amount</div>
              <div className="stat-value text-emerald-400">
                {filteredMaterials
                  .filter(m => m.payment_status === 'paid')
                  .reduce((sum, m) => sum + parseFloat(m.amount || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
            <div className="stat-icon">
              <CreditCard size={18} className="text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Pending Amount</div>
              <div className="stat-value text-orange-400">
                {filteredMaterials
                  .filter(m => m.payment_status === 'pending')
                  .reduce((sum, m) => sum + parseFloat(m.amount || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
            <div className="stat-icon">
              <DollarSign size={18} className="text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="filters-panel">
        <div className="filters-card">
          <div className="filters-header">
            <div className="filters-title">
              <Filter size={14} className="text-blue-400" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="filter-badge">Active</span>
              )}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="clear-filters">
                  <X size={12} /> Clear All
                </button>
              )}
            </div>
          </div>

          <div className="filters-body">
            <div>
              <label className="filter-label">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name or bill number..."
                  className="modal-input"
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="filter-group">
              <div>
                <label className="filter-label">Category</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="filter-label">Payment Status</label>
                <select
                  value={filters.payment_status}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Display */}
      <div className="units-display">
        <div className="units-card">
          <div className="units-header-bar">
            <div className="units-title">
              <Package size={24} className="text-white" style={{ color: 'white' }} />
              <span>
                Stone Materials <span className="text-slate-500 font-normal">({filteredMaterials.length})</span>
              </span>
            </div>
            <div className="units-stats">
              <span className="stat-badge available">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                {filteredMaterials.filter(m => m.payment_status === 'paid').length} Paid
              </span>
              <span className="stat-badge sold">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block"></span>
                {filteredMaterials.filter(m => m.payment_status === 'pending').length} Pending
              </span>
            </div>
          </div>

          <div className="units-table-container">
            <table className="units-table">
              <thead>
                <tr className="table-header">
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Category</th>
                  <th className="table-header-cell">Bill Number</th>
                  <th className="table-header-cell">Truck Type</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Currency</th>
                  <th className="table-header-cell">Payment Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="table-cell text-center text-slate-400 py-8">
                      No stone materials found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => (
                    <tr key={material.id} className="table-row">
                      <td className="table-cell">
                        <span className="font-medium">{material.name}</span>
                      </td>
                      <td className="table-cell">
                        <span className="floor-badge">{material.category?.name}</span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-slate-400">{material.bill_number}</span>
                      </td>
                      <td className="table-cell">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Truck size={10} className="inline mr-1" />
                          {material.truck_type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDate(material.date)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {material.currency}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`status-badge ${material.payment_status === 'paid' ? 'available' : 'sold'}`}>
                          {material.payment_status === 'paid' ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                          {material.payment_status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(material)}
                            className="sell-button-small"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
                            title="Edit"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(material.id)}
                            className="sell-button-small"
                            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Material Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title">
                <Package className="w-5 h-5 text-blue-500" />
                <span>{selectedMaterial ? 'Edit Stone Material' : 'Add Stone Material'}</span>
              </div>
              <button onClick={closeModal} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="space-y-4">
                <div>
                  <label className="modal-label">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="modal-input"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="modal-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter material name"
                    value={formData.name}
                    onChange={handleChange}
                    className="modal-input"
                  />
                </div>

                <div>
                  <label className="modal-label">Bill Number</label>
                  <input
                    type="text"
                    name="bill_number"
                    placeholder="Enter bill number"
                    value={formData.bill_number}
                    onChange={handleChange}
                    className="modal-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="modal-label">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="modal-input"
                    />
                  </div>
                  <div>
                    <label className="modal-label">Truck Type</label>
                    <select
                      name="truck_type"
                      value={formData.truck_type}
                      onChange={handleChange}
                      className="modal-input"
                    >
                      <option value="Mazda">Mazda</option>
                      <option value="Hino">Hino</option>
                      <option value="Kamaz">Kamaz</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="modal-label">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="modal-input"
                    >
                      <option value="AFN">AFN (Afghani)</option>
                      <option value="USD">USD (Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>
                  <div>
                    <label className="modal-label">Payment Status</label>
                    <select
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleChange}
                      className="modal-input"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="modal-button secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="modal-button primary">
                <Plus size={16} />
                {selectedMaterial ? 'Update Material' : 'Add Material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

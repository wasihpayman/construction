import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Search,
  Filter,
  Download,
  Eye,
  X,
  Upload,
  FolderOpen,
  Package,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Table2,
  Image as ImageIcon,
  File,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

// Date formatting utility
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const [categoryBills, setCategoryBills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category_id: '',
    date_from: '',
    date_to: '',
    bill_number: '',
  });
  
  const [form, setForm] = useState({
    title: "",
    bill_number: "",
    category_id: "",
    bill_date: new Date().toISOString().split('T')[0],
    description: "",
    file: null,
  });

  useEffect(() => {
    fetchBills();
    fetchCategories();
  }, [currentPage, filters]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        ...filters,
      });
      
      const response = await api.get(`/bills?${params}`);
      setBills(response.data.bills.data);
      setTotalPages(response.data.bills.last_page);
    } catch (error) {
      showToast("Error fetching bills", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/material-categories");
      setCategories(response.data);
    } catch (error) {
      showToast("Error fetching categories", "error");
    }
  };

  const fetchBillsByCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bills/by-category");
      setCategoryBills(response.data);
    } catch (error) {
      showToast("Error fetching bills by category", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      if (editingBill) {
        await api.post(`/bills/${editingBill.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Bill updated successfully");
      } else {
        await api.post("/bills", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Bill uploaded successfully");
      }
      
      setShowModal(false);
      resetForm();
      fetchBills();
    } catch (error) {
      showToast(error.response?.data?.message || "Error saving bill", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/bills/${id}`);
      showToast("Bill deleted successfully");
      fetchBills();
    } catch (error) {
      showToast("Error deleting bill", "error");
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/bills/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showToast("Error downloading bill", "error");
    }
  };

  const handleView = (bill) => {
    setViewingBill(bill);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setForm({
      title: "",
      bill_number: "",
      category_id: "",
      bill_date: new Date().toISOString().split('T')[0],
      description: "",
      file: null,
    });
    setEditingBill(null);
  };

  const openEditModal = (bill) => {
    setEditingBill(bill);
    setForm({
      title: bill.title,
      bill_number: bill.bill_number,
      category_id: bill.category_id,
      bill_date: bill.bill_date,
      description: bill.description,
      file: null,
    });
    setShowModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const switchViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'category') {
      fetchBillsByCategory();
    } else {
      fetchBills();
    }
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      date_from: '',
      date_to: '',
      bill_number: '',
    });
  };

  const getFileIcon = (filePath) => {
    if (filePath?.toLowerCase().endsWith('.pdf')) return <File size={20} />;
    return <ImageIcon size={20} />;
  };

  const totalBillsCount = bills.length;
  const recentBills = bills.slice(0, 5);

  return (
    <div className="bills-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bills-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <FileText size={28} strokeWidth={1.5} />
            </div>
            <div className="header-text">
              <h1>
                Bills Management
                <span className="header-badge">Document Hub</span>
              </h1>
              <p>Organize, track, and manage all your financial documents</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} />
            <span>Upload Bill</span>
            <Upload size={14} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FileText size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalBillsCount}</span>
            <span className="stat-label">Total Bills</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <FolderOpen size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{recentBills.length}</span>
            <span className="stat-label">Recent Bills</span>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-toggle">
        <button
          onClick={() => switchViewMode('table')}
          className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
        >
          <Table2 size={18} />
          <span>Table View</span>
        </button>
        <button
          onClick={() => switchViewMode('category')}
          className={`toggle-btn ${viewMode === 'category' ? 'active' : ''}`}
        >
          <Grid3x3 size={18} />
          <span>Category View</span>
        </button>
      </div>

      {/* Filters Section */}
      {viewMode === 'table' && (
        <div className="filters-section">
          <div className="filters-header">
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            {(filters.category_id || filters.date_from || filters.date_to || filters.bill_number) && (
              <button onClick={clearFilters} className="clear-filters">
                Clear All
              </button>
            )}
          </div>
          
          {showFilters && (
            <div className="filters-grid">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Bill Number</label>
                <input
                  type="text"
                  value={filters.bill_number}
                  onChange={(e) => handleFilterChange('bill_number', e.target.value)}
                  placeholder="Search bill number..."
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={48} strokeWidth={1} />
              </div>
              <h3>No bills found</h3>
              <p>Upload your first bill to get started</p>
              <button onClick={() => setShowModal(true)} className="empty-btn">
                <Plus size={16} />
                Upload Bill
              </button>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="bills-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Bill Number</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>File</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill, index) => (
                      <tr key={bill.id} style={{ animationDelay: `${index * 0.03}s` }}>
                        <td className="title-cell">
                          <div className="title-wrapper">
                            <div className="file-badge">
                              {getFileIcon(bill.file_path)}
                            </div>
                            <span>{bill.title}</span>
                          </div>
                        </td>
                        <td className="bill-number">{bill.bill_number}</td>
                        <td>
                          <span className="category-badge">
                            {bill.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td>
                          <div className="date-cell">
                            <Calendar size={12} />
                            <span>{formatDate(bill.bill_date)}</span>
                          </div>
                        </td>
                        <td>
                          <button onClick={() => handleView(bill)} className="view-file-btn">
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleDownload(bill.id)} className="action-btn download" title="Download">
                              <Download size={14} />
                            </button>
                            <button onClick={() => openEditModal(bill)} className="action-btn edit" title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(bill.id)} className="action-btn delete" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="page-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Category View */}
      {viewMode === 'category' && (
        <div className="category-view">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : categoryBills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FolderOpen size={48} strokeWidth={1} />
              </div>
              <h3>No categories with bills</h3>
              <p>Upload bills and assign them to categories</p>
            </div>
          ) : (
            categoryBills.map((category, idx) => (
              <div key={category.id} className="category-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="category-header">
                  <div className="category-title">
                    <div className="category-icon">
                      <Package size={20} />
                    </div>
                    <h3>{category.name}</h3>
                    <span className="category-count">{category.bills?.length || 0} bills</span>
                  </div>
                </div>
                {category.bills && category.bills.length > 0 ? (
                  <div className="bills-grid">
                    {category.bills.map((bill) => (
                      <div key={bill.id} className="bill-card">
                        <div className="bill-card-header">
                          <div className="bill-file-icon">
                            {getFileIcon(bill.file_path)}
                          </div>
                          <div className="bill-actions">
                            <button onClick={() => handleView(bill)} title="View">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleDownload(bill.id)} title="Download">
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="bill-card-body">
                          <h4>{bill.title}</h4>
                          <p className="bill-number-text">#{bill.bill_number}</p>
                          <div className="bill-date">
                            <Calendar size={12} />
                            <span>{formatDate(bill.bill_date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-bills-text">No bills in this category</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  {editingBill ? <Edit size={18} /> : <Upload size={18} />}
                </div>
                <span>{editingBill ? 'Edit Bill' : 'Upload New Bill'}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Enter bill title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Bill Number <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="INV-001"
                      value={form.bill_number}
                      onChange={(e) => setForm({ ...form, bill_number: e.target.value })}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Bill Date <span className="required">*</span></label>
                    <input
                      type="date"
                      required
                      value={form.bill_date}
                      onChange={(e) => setForm({ ...form, bill_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Additional details about this bill..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>File {!editingBill && <span className="required">*</span>}</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      required={!editingBill}
                      onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <Upload size={20} />
                      <span>{form.file ? form.file.name : 'Click to upload or drag and drop'}</span>
                    </label>
                  </div>
                  {editingBill && (
                    <p className="file-hint">Leave empty to keep current file</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="modal-btn secondary">
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  {editingBill ? 'Update Bill' : 'Upload Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingBill && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  <FileText size={18} />
                </div>
                <span>Bill Details</span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="bill-details">
                <div className="detail-group">
                  <label>Title</label>
                  <p>{viewingBill.title}</p>
                </div>
                <div className="detail-group">
                  <label>Bill Number</label>
                  <p className="bill-number-highlight">{viewingBill.bill_number}</p>
                </div>
                <div className="detail-row">
                  <div className="detail-group flex-1">
                    <label>Category</label>
                    <p>
                      <span className="category-badge">
                        {viewingBill.category?.name || 'Uncategorized'}
                      </span>
                    </p>
                  </div>
                  <div className="detail-group flex-1">
                    <label>Date</label>
                    <p>{formatDate(viewingBill.bill_date)}</p>
                  </div>
                </div>
                {viewingBill.description && (
                  <div className="detail-group">
                    <label>Description</label>
                    <p className="description-text">{viewingBill.description}</p>
                  </div>
                )}
                <div className="detail-group">
                  <label>File Preview</label>
                  <div className="file-preview">
                    {viewingBill.file_path?.toLowerCase().endsWith('.pdf') ? (
                      <div className="pdf-preview">
                        <File size={64} />
                        <p>PDF Document</p>
                        <button onClick={() => handleDownload(viewingBill.id)} className="download-btn">
                          <Download size={16} />
                          Download PDF
                        </button>
                      </div>
                    ) : (
                      <img
                        src={viewingBill.file_url}
                        alt={viewingBill.title}
                        className="image-preview"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => handleDownload(viewingBill.id)} className="modal-btn download-btn-modal">
                <Download size={16} />
                Download
              </button>
              <button onClick={() => setShowViewModal(false)} className="modal-btn secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertCircle size={48} />
            </div>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this bill? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={() => setDeleteConfirm(null)} className="confirm-btn cancel">
                Cancel
              </button>
              <button onClick={() => {
                handleDelete(deleteConfirm);
                setDeleteConfirm(null);
              }} className="confirm-btn delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bills-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .bills-container {
            padding: 1rem;
          }
        }

        /* Toast */
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 1100;
          animation: slideIn 0.3s ease;
          border-radius: 12px;
          padding: 12px 20px;
          background: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
          border-left: 4px solid;
        }
        .toast-notification.success { border-left-color: #10b981; }
        .toast-notification.error { border-left-color: #ef4444; }
        .toast-content {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Header */
        .bills-header {
          margin-bottom: 2rem;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          padding: 1.25rem 2rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-text h1 {
          color: white;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .header-badge {
          background: rgba(139, 92, 246, 0.2);
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 40px;
          font-weight: 500;
          color: #a78bfa;
        }
        .header-text p {
          color: #94a3b8;
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          padding: 0.7rem 1.4rem;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: all 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.5);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #6366f1); }
        .stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: white; }
        .stat-label { font-size: 0.75rem; color: #94a3b8; }

        /* View Toggle */
        .view-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.25rem;
          border-radius: 48px;
          width: fit-content;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.2rem;
          border-radius: 40px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .toggle-btn.active {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        /* Filters */
        .filters-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: #a78bfa;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .clear-filters {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 0.75rem;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .filter-group label {
          display: block;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }
        .filter-group select,
        .filter-group input {
          width: 100%;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 0.875rem;
        }

        /* Table */
        .table-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          overflow: hidden;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        .bills-table {
          width: 100%;
          border-collapse: collapse;
        }
        .bills-table thead {
          background: rgba(0, 0, 0, 0.3);
        }
        .bills-table th {
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bills-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .bills-table tr {
          animation: fadeInUp 0.3s ease backwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .title-cell .title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .file-badge {
          width: 32px;
          height: 32px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a78bfa;
        }
        .category-badge {
          background: rgba(139, 92, 246, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #a78bfa;
        }
        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        .view-file-btn {
          background: rgba(59, 130, 246, 0.2);
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: #60a5fa;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
        }
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn.download { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .action-btn.delete { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .action-btn:hover { transform: scale(1.05); }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .page-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-info {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        /* Category View */
        .category-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .category-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          animation: fadeInUp 0.3s ease backwards;
        }
        .category-header {
          margin-bottom: 1.25rem;
        }
        .category-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .category-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .category-title h3 {
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }
        .category-count {
          background: rgba(139, 92, 246, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #a78bfa;
        }
        .bills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .bill-card {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 0.75rem;
          padding: 1rem;
          transition: all 0.2s;
        }
        .bill-card:hover {
          transform: translateY(-2px);
          background: rgba(0, 0, 0, 0.4);
        }
        .bill-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .bill-file-icon {
          width: 40px;
          height: 40px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a78bfa;
        }
        .bill-actions {
          display: flex;
          gap: 0.5rem;
        }
        .bill-actions button {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
        }
        .bill-actions button:hover { color: #a78bfa; }
        .bill-card-body h4 {
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
        }
        .bill-number-text {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        .bill-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Loading & Empty States */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          gap: 1rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(139, 92, 246, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        .empty-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b5cf6;
        }
        .empty-state h3 {
          color: #e2e8f0;
          margin-bottom: 0.5rem;
        }
        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        .empty-btn {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-container {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 1.5rem;
          width: 90%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(139, 92, 246, 0.3);
          animation: slideUp 0.3s ease;
        }
        .view-modal {
          max-width: 650px;
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }
        .modal-title-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-close {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #94a3b8;
        }
        .modal-body {
          padding: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-row {
          display: flex;
          gap: 1rem;
        }
        .flex-1 { flex: 1; }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .required { color: #ef4444; }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 0.875rem;
        }
        .file-upload-area {
          border: 2px dashed rgba(139, 92, 246, 0.3);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
        }
        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #a78bfa;
        }
        .file-hint {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.5rem;
        }
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        .modal-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }
        .modal-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }
        .modal-btn.primary {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
        }
        .download-btn-modal {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        /* Bill Details */
        .bill-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .detail-group label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          display: block;
          margin-bottom: 0.25rem;
        }
        .detail-group p {
          color: #e2e8f0;
          font-size: 0.875rem;
        }
        .detail-row {
          display: flex;
          gap: 1rem;
        }
        .bill-number-highlight {
          font-family: monospace;
          font-size: 1rem;
          font-weight: 600;
          color: #a78bfa !important;
        }
        .file-preview {
          margin-top: 0.5rem;
          border-radius: 10px;
          overflow: hidden;
        }
        .pdf-preview {
          text-align: center;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .image-preview {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 10px;
        }
        .download-btn {
          background: #3b82f6;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        /* Confirm Modal */
        .confirm-modal {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          max-width: 400px;
          width: 90%;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .confirm-icon {
          color: #ef4444;
          margin-bottom: 1rem;
        }
        .confirm-modal h3 {
          color: white;
          margin-bottom: 0.5rem;
        }
        .confirm-modal p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }
        .confirm-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .confirm-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .confirm-btn.cancel {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }
        .confirm-btn.delete {
          background: #ef4444;
          color: white;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          .bills-table th, .bills-table td {
            padding: 0.75rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          .header-left {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
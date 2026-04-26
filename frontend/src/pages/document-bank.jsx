import { useEffect, useState } from "react";
import api from "../services/api";
import { 
  Archive, 
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
  Phone,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Clock
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

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export default function DocumentBank() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    date: '',
  });
  
  const [form, setForm] = useState({
    person_name: "",
    phone: "",
    description: "",
    zip_file: null,
  });

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, filters]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        ...filters,
      });
      
      const response = await api.get(`/document-bank?${params}`);
      setDocuments(response.data.documents.data);
      setTotalPages(response.data.documents.last_page);
    } catch (error) {
      showToast("Error fetching documents", "error");
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

      if (editingDocument) {
        await api.post(`/document-bank/${editingDocument.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Document updated successfully");
      } else {
        await api.post("/document-bank", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Document uploaded successfully");
      }
      
      setShowModal(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      showToast(error.response?.data?.message || "Error saving document", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/document-bank/${id}`);
      showToast("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      showToast("Error deleting document", "error");
    }
  };

  const handleDownload = async (id) => {
    try {
      const link = document.createElement('a');
      link.href = `http://constraction.test/api/document-bank/${id}/download`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showToast("Error downloading file", "error");
    }
  };

  const handleView = (document) => {
    setViewingDocument(document);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setForm({
      person_name: "",
      phone: "",
      description: "",
      zip_file: null,
    });
    setEditingDocument(null);
  };

  const openEditModal = (document) => {
    setEditingDocument(document);
    setForm({
      person_name: document.person_name,
      phone: document.phone,
      description: document.description,
      zip_file: null,
    });
    setShowModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      date: '',
    });
  };

  const totalDocumentsCount = documents.length;
  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="document-bank-container">
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
      <div className="document-bank-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Archive size={28} strokeWidth={1.5} />
            </div>
            <div className="header-text">
              <h1>
                Document Bank
                <span className="header-badge">File Repository</span>
              </h1>
              <p>Store and manage document folders for people</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} />
            <span>Upload Document</span>
            <Upload size={14} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <Archive size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalDocumentsCount}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <User size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{new Set(documents.map(d => d.person_name)).size}</span>
            <span className="stat-label">Unique People</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{recentDocuments.length}</span>
            <span className="stat-label">Recent Uploads</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          {(filters.search || filters.date) && (
            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search by Person Name</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name..."
              />
            </div>
            <div className="filter-group">
              <label>Filter by Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Archive size={48} strokeWidth={1} />
            </div>
            <h3>No documents found</h3>
            <p>Upload your first document folder to get started</p>
            <button onClick={() => setShowModal(true)} className="empty-btn">
              <Plus size={16} />
              Upload Document
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>Person Name</th>
                    <th>Phone</th>
                    <th>Description</th>
                    <th>Uploaded File</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document, index) => (
                    <tr key={document.id} style={{ animationDelay: `${index * 0.03}s` }}>
                      <td className="name-cell">
                        <div className="name-wrapper">
                          <div className="person-avatar">
                            <User size={16} />
                          </div>
                          <span>{document.person_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="phone-cell">
                          <Phone size={12} />
                          <span>{document.phone}</span>
                        </div>
                      </td>
                      <td>
                        <div className="description-cell">
                          {document.description ? (
                            <span>{document.description}</span>
                          ) : (
                            <span className="no-description">No description</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="file-cell">
                          {document.zip_file_path ? (
                            <div className="file-info">
                              <FolderOpen size={16} />
                              <span>{document.file_name}</span>
                              <span className="file-size">{document.file_size}</span>
                            </div>
                          ) : (
                            <span className="no-file">No file</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={12} />
                          <span>{formatDate(document.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleView(document)} className="action-btn view" title="View Details">
                            <Eye size={14} />
                          </button>
                          {document.zip_file_path && (
                            <button onClick={() => handleDownload(document.id)} className="action-btn download" title="Download">
                              <Download size={14} />
                            </button>
                          )}
                          <button onClick={() => openEditModal(document)} className="action-btn edit" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(document.id)} className="action-btn delete" title="Delete">
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

      {/* Add/Edit Document Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  {editingDocument ? <Edit size={18} /> : <Upload size={18} />}
                </div>
                <span>{editingDocument ? 'Edit Document' : 'Upload Document Folder'}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Person Name <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Enter person's full name"
                    value={form.person_name}
                    onChange={(e) => setForm({ ...form, person_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="+1234567890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter document description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>ZIP File {!editingDocument && <span className="required">*</span>}</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="zip-file"
                      accept=".zip"
                      required={!editingDocument}
                      onChange={(e) => setForm({ ...form, zip_file: e.target.files[0] })}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="zip-file" className="file-upload-label">
                      <Archive size={20} />
                      <span>{form.zip_file ? form.zip_file.name : 'Click to upload ZIP file'}</span>
                    </label>
                  </div>
                  {editingDocument && (
                    <p className="file-hint">Leave empty to keep current file</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="modal-btn secondary">
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  {editingDocument ? 'Update Document' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {showViewModal && viewingDocument && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  <Archive size={18} />
                </div>
                <span>Document Details</span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="document-details">
                <div className="detail-group">
                  <label>Person Name</label>
                  <p>{viewingDocument.person_name}</p>
                </div>
                <div className="detail-row">
                  <div className="detail-group flex-1">
                    <label>Phone</label>
                    <p>{viewingDocument.phone}</p>
                  </div>
                  <div className="detail-group flex-1">
                    <label>Created Date</label>
                    <p>{formatDate(viewingDocument.created_at)}</p>
                  </div>
                </div>
                {viewingDocument.description && (
                  <div className="detail-group">
                    <label>Description</label>
                    <p className="description-text">{viewingDocument.description}</p>
                  </div>
                )}
                <div className="detail-group">
                  <label>File Information</label>
                  {viewingDocument.zip_file_path ? (
                    <div className="file-details">
                      <div className="file-item">
                        <Archive size={24} />
                        <div className="file-info">
                          <span className="file-name">{viewingDocument.file_name}</span>
                          <span className="file-size">{viewingDocument.file_size}</span>
                        </div>
                        <button onClick={() => handleDownload(viewingDocument.id)} className="download-btn">
                          <Download size={14} />
                          Download ZIP
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="no-file">No file uploaded</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => openEditModal(viewingDocument)} className="modal-btn edit-btn">
                <Edit size={16} />
                Edit Document
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
            <p>Are you sure you want to delete this document? This action cannot be undone.</p>
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
        .document-bank-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .document-bank-container {
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
        .document-bank-header {
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
          background: linear-gradient(135deg, #10b981, #059669);
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
          background: rgba(16, 185, 129, 0.2);
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 40px;
          font-weight: 500;
          color: #34d399;
        }
        .header-text p {
          color: #94a3b8;
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
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
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
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
        .stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
        .stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #6366f1); }
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: white; }
        .stat-label { font-size: 0.75rem; color: #94a3b8; }

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
          color: #34d399;
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
        .documents-table {
          width: 100%;
          border-collapse: collapse;
        }
        .documents-table thead {
          background: rgba(0, 0, 0, 0.3);
        }
        .documents-table th {
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .documents-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .documents-table tr {
          animation: fadeInUp 0.3s ease backwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .name-cell .name-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .person-avatar {
          width: 32px;
          height: 32px;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #34d399;
        }
        .phone-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        .description-cell .no-description {
          color: #64748b;
          font-style: italic;
        }
        .file-cell .file-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .file-cell .file-info span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        .file-size {
          color: #64748b;
          font-size: 0.75rem;
        }
        .no-file {
          color: #64748b;
          font-style: italic;
        }
        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
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
        .action-btn.view { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .action-btn.download { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .action-btn.edit { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
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
          background: linear-gradient(135deg, #10b981, #059669);
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
          max-width: 600px;
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
          background: linear-gradient(135deg, #10b981, #059669);
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
          color: #34d399;
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
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .modal-btn.edit-btn {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
        }

        /* Document Details */
        .document-details {
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
        .description-text {
          line-height: 1.5;
        }
        .file-details {
          margin-top: 0.5rem;
        }
        .file-item {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }
        .file-item:hover {
          background: rgba(0, 0, 0, 0.4);
        }
        .file-info {
          flex: 1;
        }
        .file-name {
          display: block;
          font-weight: 600;
          color: #e2e8f0;
        }
        .file-size {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
        }
        .download-btn {
          background: #10b981;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .no-file {
          color: #64748b;
          font-style: italic;
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
          .documents-table th, .documents-table td {
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

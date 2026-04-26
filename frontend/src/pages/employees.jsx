import { useEffect, useState } from "react";
import api from "../services/api";
import SalaryPaymentHistory from "../components/SalaryPaymentHistory";
import { 
  UserCheck, 
  UserPlus,
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
  DollarSign,
  MapPin,
  FileText,
  Briefcase,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard
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

const formatSalary = (salary) => {
  if (!salary) return 'AFN 0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AFN'
  }).format(salary);
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaySalaryModal, setShowPaySalaryModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    start_date_from: '',
    start_date_to: '',
  });
  
  const [form, setForm] = useState({
    full_name: "",
    position: "",
    start_date: new Date().toISOString().split('T')[0],
    salary: "",
    phone: "",
    address: "",
    description: "",
    tazkira_file: null,
    contract_file: null,
  });

  const [salaryForm, setSalaryForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    description: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, filters]);

  
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        ...filters,
      });
      
      const response = await api.get(`/employees?${params}`);
      setEmployees(response.data.employees.data);
      setPositions(response.data.positions);
      setTotalPages(response.data.employees.last_page);
    } catch (error) {
      showToast("Error fetching employees", "error");
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

      if (editingEmployee) {
        await api.post(`/employees/${editingEmployee.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Employee updated successfully");
      } else {
        await api.post("/employees", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast("Employee added successfully");
      }
      
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      showToast(error.response?.data?.message || "Error saving employee", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      showToast("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      showToast("Error deleting employee", "error");
    }
  };

  const handleDownload = async (id, type) => {
    try {
      const link = document.createElement('a');
      link.href = `http://constraction.test/api/employees/${id}/download/${type}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showToast("Error downloading file", "error");
    }
  };

  const handleView = (employee) => {
    setViewingEmployee(employee);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      position: "",
      start_date: new Date().toISOString().split('T')[0],
      salary: "",
      phone: "",
      address: "",
      description: "",
      tazkira_file: null,
      contract_file: null,
    });
    setEditingEmployee(null);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setForm({
      full_name: employee.full_name,
      position: employee.position,
      start_date: employee.start_date,
      salary: employee.salary,
      phone: employee.phone,
      address: employee.address,
      description: employee.description,
      tazkira_file: null,
      contract_file: null,
    });
    setShowModal(true);
  };

  const openPaySalaryModal = (employee) => {
    setViewingEmployee(employee);
    setSalaryForm({
      amount: "",
      payment_date: new Date().toISOString().split('T')[0],
      description: "",
    });
    
    setShowPaySalaryModal(true);
  };

  const handlePaySalary = async (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!salaryForm.amount || salaryForm.amount <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }
    
    try {
      const response = await api.post('/salary-payments', {
        employee_id: viewingEmployee.id,
        amount: salaryForm.amount,
        payment_date: salaryForm.payment_date,
        description: salaryForm.description,
      });
      
      showToast("Salary payment recorded successfully");
      setShowPaySalaryModal(false);
      setSalaryForm({
        amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        description: "",
      });
      
      // Refresh employee data to update payment count
      setTimeout(() => {
        fetchEmployees();
      }, 500);
    } catch (error) {
      showToast(error.response?.data?.message || "Error recording salary payment", "error");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      position: '',
      start_date_from: '',
      start_date_to: '',
    });
  };

  const totalEmployeesCount = employees.length;
  const recentEmployees = employees.slice(0, 5);

  return (
    <div className="employees-container">
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
      <div className="employees-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <UserCheck size={28} strokeWidth={1.5} />
            </div>
            <div className="header-text">
              <h1>
                Employees Management
                <span className="header-badge">Staff Directory</span>
              </h1>
              <p>Manage and track all employee information and documents</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} />
            <span>Add Employee</span>
            <Upload size={14} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <DollarSign size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">AFN {employees.reduce((total, employee) => total + (employee.total_paid_salary || 0), 0)}</span>
            <span className="stat-label">Total Paid</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <UserCheck size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalEmployeesCount}</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Briefcase size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{positions.length}</span>
            <span className="stat-label">Positions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Calendar size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{recentEmployees.length}</span>
            <span className="stat-label">Recent Hires</span>
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
          {(filters.search || filters.position || filters.start_date_from || filters.start_date_to) && (
            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name..."
              />
            </div>
            <div className="filter-group">
              <label>Position</label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
              >
                <option value="">All Positions</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Start Date From</label>
              <input
                type="date"
                value={filters.start_date_from}
                onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Start Date To</label>
              <input
                type="date"
                value={filters.start_date_to}
                onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
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
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <UserCheck size={48} strokeWidth={1} />
            </div>
            <h3>No employees found</h3>
            <p>Add your first employee to get started</p>
            <button onClick={() => setShowModal(true)} className="empty-btn">
              <Plus size={16} />
              Add Employee
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Position</th>
                    <th>Start Date</th>
                    <th>Salary</th>
                    <th>Total Paid</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={employee.id} style={{ animationDelay: `${index * 0.03}s` }}>
                      <td className="name-cell">
                        <div className="name-wrapper">
                          <div className="employee-avatar">
                            <User size={16} />
                          </div>
                          <span>{employee.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="position-badge">
                          {employee.position}
                        </span>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={12} />
                          <span>{formatDate(employee.start_date)}</span>
                        </div>
                      </td>
                      <td className="salary-cell">
                        <span className="salary-amount">{formatSalary(employee.salary)}</span>
                      </td>
                      <td className="paid-salary-cell">
                        <span className="paid-salary-amount">{formatSalary(employee.total_paid_salary || 0)}</span>
                      </td>
                      <td>
                        <div className="phone-cell">
                          <Phone size={12} />
                          <span>{employee.phone}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button type="button" onClick={() => handleView(employee)} className="action-btn view" title="View Details">
                            <Eye size={14} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => openPaySalaryModal(employee)} 
                            className="action-btn pay" 
                            title="Pay Salary"
                            style={{
                              background: 'rgba(16, 185, 129, 0.4)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <CreditCard size={14} />
                          </button>
                          <button type="button" onClick={() => openEditModal(employee)} className="action-btn edit" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button type="button" onClick={() => setDeleteConfirm(employee.id)} className="action-btn delete" title="Delete">
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

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  {editingEmployee ? <Edit size={18} /> : <UserPlus size={18} />}
                </div>
                <span>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Enter employee full name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Position <span className="required">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manager, Developer"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Start Date <span className="required">*</span></label>
                    <input
                      type="date"
                      required
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Salary <span className="required">*</span></label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="+1234567890"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    placeholder="Enter employee address"
                    value={form.address || ''}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Additional notes about the employee"
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Tazkira File</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="tazkira-file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setForm({ ...form, tazkira_file: e.target.files[0] })}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="tazkira-file" className="file-upload-label">
                        <FileText size={20} />
                        <span>{form.tazkira_file ? form.tazkira_file.name : 'Click to upload Tazkira'}</span>
                      </label>
                    </div>
                    {editingEmployee && (
                      <p className="file-hint">Leave empty to keep current file</p>
                    )}
                  </div>
                  <div className="form-group flex-1">
                    <label>Contract File</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="contract-file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setForm({ ...form, contract_file: e.target.files[0] })}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="contract-file" className="file-upload-label">
                        <FileText size={20} />
                        <span>{form.contract_file ? form.contract_file.name : 'Click to upload Contract'}</span>
                      </label>
                    </div>
                    {editingEmployee && (
                      <p className="file-hint">Leave empty to keep current file</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="modal-btn secondary">
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && viewingEmployee && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  <UserCheck size={18} />
                </div>
                <span>Employee Details</span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="employee-details">
                <div className="detail-group">
                  <label>Full Name</label>
                  <p>{viewingEmployee.full_name}</p>
                </div>
                <div className="detail-row">
                  <div className="detail-group flex-1">
                    <label>Position</label>
                    <p>
                      <span className="position-badge">
                        {viewingEmployee.position}
                      </span>
                    </p>
                  </div>
                  <div className="detail-group flex-1">
                    <label>Start Date</label>
                    <p>{formatDate(viewingEmployee.start_date)}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-group flex-1">
                    <label>Salary</label>
                    <p className="salary-highlight">{formatSalary(viewingEmployee.salary)}</p>
                  </div>
                  <div className="detail-group flex-1">
                    <label>Phone</label>
                    <p>{viewingEmployee.phone}</p>
                  </div>
                </div>
                {viewingEmployee.address && (
                  <div className="detail-group">
                    <label>Address</label>
                    <p className="address-text">
                      <MapPin size={14} />
                      {viewingEmployee.address}
                    </p>
                  </div>
                )}
                {viewingEmployee.description && (
                  <div className="detail-group">
                    <label>Description</label>
                    <p className="description-text">{viewingEmployee.description}</p>
                  </div>
                )}
                <div className="detail-group">
                  <label>Documents</label>
                  <div className="documents-grid">
                    {viewingEmployee.tazkira_file && (
                      <div className="document-item">
                        <FileText size={24} />
                        <span>Tazkira</span>
                        <button onClick={() => handleDownload(viewingEmployee.id, 'tazkira')} className="download-btn">
                          <Download size={14} />
                          Download
                        </button>
                      </div>
                    )}
                    {viewingEmployee.contract_file && (
                      <div className="document-item">
                        <FileText size={24} />
                        <span>Contract</span>
                        <button onClick={() => handleDownload(viewingEmployee.id, 'contract')} className="download-btn">
                          <Download size={14} />
                          Download
                        </button>
                      </div>
                    )}
                    {!viewingEmployee.tazkira_file && !viewingEmployee.contract_file && (
                      <p className="no-documents">No documents uploaded</p>
                    )}
                  </div>
                </div>

                {/* Salary Payment History */}
                <div className="detail-group">
                  <label>Salary Payment History</label>
                  <div className="salary-payments-info">
                    <span className="payment-count">
                      Salary Paid: {viewingEmployee.salary_payments_count} times
                    </span>
                  </div>
                  <SalaryPaymentHistory employeeId={viewingEmployee.id} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => openEditModal(viewingEmployee)} className="modal-btn edit-btn">
                <Edit size={16} />
                Edit Employee
              </button>
              <button onClick={() => setShowViewModal(false)} className="modal-btn secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Payment Modal */}
      {showPaySalaryModal && viewingEmployee && (
        <>
          <div className="modal-overlay">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  <CreditCard size={18} />
                </div>
                <span>Pay Salary - {viewingEmployee.full_name}</span>
              </div>
              <button onClick={() => setShowPaySalaryModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePaySalary}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Employee</label>
                  <input
                    type="text"
                    value={viewingEmployee.full_name}
                    readOnly
                    className="read-only-input"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Amount <span className="required">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={salaryForm.amount}
                    onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Date <span className="required">*</span></label>
                  <input
                    type="date"
                    required
                    value={salaryForm.payment_date}
                    onChange={(e) => setSalaryForm({ ...salaryForm, payment_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Add any notes about this payment..."
                    value={salaryForm.description || ''}
                    onChange={(e) => setSalaryForm({ ...salaryForm, description: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowPaySalaryModal(false)} className="modal-btn secondary">
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
        </>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertCircle size={48} />
            </div>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
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

      <style>{`
        .employees-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .employees-container {
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
        .employees-header {
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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
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
          background: rgba(59, 130, 246, 0.2);
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 40px;
          font-weight: 500;
          color: #60a5fa;
        }
        .header-text p {
          color: #94a3b8;
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
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
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
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
        .stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
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
          color: #60a5fa;
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
        .employees-table {
          width: 100%;
          border-collapse: collapse;
        }
        .employees-table thead {
          background: rgba(0, 0, 0, 0.3);
        }
        .employees-table th {
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .employees-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .employees-table tr {
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
        .employee-avatar {
          width: 32px;
          height: 32px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
        }
        .position-badge {
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
        .salary-cell .salary-amount {
          color: #10b981;
          font-weight: 600;
        }
        .phone-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        .action-buttons {
          display: flex !important;
          gap: 0.5rem;
          visibility: visible !important;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 32px;
          min-height: 32px;
        }
        .action-btn.view { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .action-btn.pay { 
          background: rgba(16, 185, 129, 0.3) !important; 
          color: #34d399 !important;
          border: 1px solid rgba(16, 185, 129, 0.5) !important;
        }
        .paid-salary-cell .paid-salary-amount {
          color: #10b981;
          font-weight: 600;
        }
        .action-btn.edit { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
        .action-btn.delete { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .action-btn:hover { transform: scale(1.05); }
        .salary-payments-info {
          margin-top: 0.5rem;
        }
        .payment-count {
          font-size: 0.875rem;
          color: #34d399;
          font-weight: 600;
        }
        .read-only-input {
          background: rgba(0, 0, 0, 0.2);
          cursor: not-allowed;
        }

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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
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
          color: #60a5fa;
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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }
        .modal-btn.edit-btn {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
        }

        /* Employee Details */
        .employee-details {
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
        .salary-highlight {
          font-family: monospace;
          font-size: 1rem;
          font-weight: 600;
          color: #10b981 !important;
        }
        .address-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .description-text {
          line-height: 1.5;
        }
        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .document-item {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
          transition: all 0.2s;
        }
        .document-item:hover {
          background: rgba(0, 0, 0, 0.4);
        }
        .document-item span {
          display: block;
          margin: 0.5rem 0;
          color: #e2e8f0;
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
          margin-top: 0.5rem;
        }
        .no-documents {
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
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          .employees-table th, .employees-table td {
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

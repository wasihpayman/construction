import { useEffect, useState } from "react";
import api from "../services/projectApi";
import { useProject } from "../contexts/ProjectContext";
import "../styles/responsive.css";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter,
  Download,
  PieChart,
  Wallet,
  Clock
} from "lucide-react";

export default function Expenses() {
  const { activeProjectId, hasActiveProject } = useProject();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "AFN",
    description: "",
    details: "",
    date: new Date().toISOString().split('T')[0],
    purpose: "",
    authorized_by: "",
    bill_num: "",
    paid_by: "",
  });

  useEffect(() => {
    if (hasActiveProject) {
      fetchExpenses();
    }
  }, [activeProjectId, hasActiveProject]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setExpenses([]);
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.log(err);
      showToast("Failed to load expenses", "error");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createOrUpdateExpense = async () => {
    if (!form.title.trim() || !form.amount) {
      showToast("Please fill in title and amount", "error");
      return;
    }

    try {
      const expenseData = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, expenseData);
        showToast("Expense updated successfully!", "success");
      } else {
        await api.post("/expenses", expenseData);
        showToast("Expense added successfully!", "success");
      }
      
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.log(err);
      showToast("Error saving expense", "error");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      showToast("Expense deleted successfully!", "success");
      fetchExpenses();
      setDeleteConfirm(null);
    } catch (err) {
      console.log(err);
      showToast("Error deleting expense", "error");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      amount: "",
      currency: "AFN",
      description: "",
      details: "",
      date: new Date().toISOString().split('T')[0],
      purpose: "",
      authorized_by: "",
      bill_num: "",
      paid_by: "",
    });
    setEditingExpense(null);
    setShowModal(false);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      amount: expense.amount,
      currency: expense.currency,
      description: expense.description || "",
      details: expense.details || "",
      date: expense.date || new Date().toISOString().split('T')[0],
      purpose: expense.purpose || "",
      authorized_by: expense.authorized_by || "",
      bill_num: expense.bill_num || "",
      paid_by: expense.paid_by || "",
    });
    setShowModal(true);
  };

  const getCurrencySymbol = (currency) => {
    switch(currency) {
      case 'AFN': return '؋';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return '؋';
    }
  };

  const getTotalExpenses = () => {
    const totals = {};
    expenses.forEach(exp => {
      if (!totals[exp.currency]) totals[exp.currency] = 0;
      totals[exp.currency] += parseFloat(exp.amount || 0);
    });
    return totals;
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (exp.authorized_by && exp.authorized_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (exp.paid_by && exp.paid_by.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCurrency = filterCurrency === "ALL" || exp.currency === filterCurrency;
    return matchesSearch && matchesCurrency;
  });

  const totalExpenses = getTotalExpenses();
  const totalCount = filteredExpenses.length;

  if (!hasActiveProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <AlertCircle size={40} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">No Project Selected</h2>
            <p className="text-indigo-200">Please select a project to view expenses</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin"></div>
            <Wallet className="absolute inset-0 m-auto text-indigo-400" size={22} />
          </div>
          <p className="text-indigo-200 font-medium tracking-wide">Loading Expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="expenses-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <DollarSign className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div className="header-text">
              <h1>
                Expense Tracker
                <span className="header-badge">Financial</span>
              </h1>
              <p>Track and manage all your project expenses</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">Total Expenses</span>
          </div>
        </div>
        {Object.entries(totalExpenses).map(([currency, amount]) => (
          <div key={currency} className="stat-card">
            <div className="stat-icon blue">
              <Wallet size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {getCurrencySymbol(currency)} {amount.toLocaleString()}
              </span>
              <span className="stat-label">Total ({currency})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search expenses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-wrapper">
          <Filter size={18} className="filter-icon" />
          <select 
            value={filterCurrency} 
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Currencies</option>
            <option value="AFN">AFN (؋)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="expenses-list">
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Wallet size={48} strokeWidth={1} />
            </div>
            <h3>No expenses found</h3>
            <p>
              {searchTerm || filterCurrency !== "ALL" 
                ? "Try adjusting your search or filter" 
                : "Click 'Add Expense' to track your first expense"}
            </p>
            {!searchTerm && filterCurrency === "ALL" && (
              <button onClick={() => setShowModal(true)} className="empty-btn">
                <Plus size={16} />
                Add Expense
              </button>
            )}
          </div>
        ) : (
          <div className="expenses-grid">
            {filteredExpenses.map((expense, index) => (
              <div key={expense.id} className="expense-card" style={{ animationDelay: `${index * 0.05}s` }}>
                {deleteConfirm === expense.id && (
                  <div className="delete-overlay">
                    <div className="delete-dialog">
                      <p>Delete this expense?</p>
                      <div className="delete-actions">
                        <button onClick={() => deleteExpense(expense.id)} className="confirm-delete">
                          Yes
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="cancel-delete">
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="expense-card-header">
                  <div className="expense-title-section">
                    <div className="expense-icon">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <h3 className="expense-title">{expense.title}</h3>
                      {expense.description && (
                        <p className="expense-description">{expense.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="expense-actions">
                    <button onClick={() => openEditModal(expense)} className="action-btn edit-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirm(expense.id)} className="action-btn delete-btn" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="expense-card-footer">
                  <div className="expense-amount">
                    <span className="amount-value">
                      {getCurrencySymbol(expense.currency)} {parseFloat(expense.amount || 0).toLocaleString()}
                    </span>
                    <span className="amount-currency">{expense.currency}</span>
                  </div>
                  <div className="expense-date">
                    <Calendar size={14} />
                    <span>{expense.expense_date || new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  {editingExpense ? <Edit size={18} /> : <Plus size={18} />}
                </div>
                <span>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</span>
              </div>
              <button onClick={resetForm} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="modal-label">
                  Title <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Office Supplies, Travel, Equipment"
                  value={form.title}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">
                  Details
                </label>
                <textarea
                  name="details"
                  placeholder="Optional: Add more details about this expense..."
                  value={form.details}
                  onChange={handleChange}
                  className="modal-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">
                  Date <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">
                  Purpose
                </label>
                <input
                  type="text"
                  name="purpose"
                  placeholder="e.g., Office Supplies, Travel, Equipment"
                  value={form.purpose}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">
                  Authorized By
                </label>
                <input
                  type="text"
                  name="authorized_by"
                  placeholder="Person who authorized this expense"
                  value={form.authorized_by}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">
                  Bill Number
                </label>
                <input
                  type="text"
                  name="bill_num"
                  placeholder="Bill reference number"
                  value={form.bill_num}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="modal-label">
                    Amount <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    className="modal-input"
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="modal-label">Currency</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="modal-select"
                  >
                    <option value="AFN">AFN (افغانی)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="modal-label">
                  Paid By
                </label>
                <input
                  type="text"
                  name="paid_by"
                  placeholder="Person who paid this expense"
                  value={form.paid_by}
                  onChange={handleChange}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">Description</label>
                <textarea
                  name="description"
                  placeholder="Optional: Add more details about this expense..."
                  value={form.description}
                  onChange={handleChange}
                  className="modal-textarea"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={resetForm} className="modal-button secondary">
                Cancel
              </button>
              <button onClick={createOrUpdateExpense} className="modal-button primary">
                {editingExpense ? (
                  <>
                    <Edit size={16} />
                    Update Expense
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Expense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .expenses-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .expenses-container {
            padding: 1rem;
          }
        }

        /* Toast */
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 1000;
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
        .expenses-header {
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
          width: 50px;
          height: 50px;
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
          padding: 0.6rem 1.2rem;
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

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: white; }
        .stat-label { font-size: 0.75rem; color: #94a3b8; }

        /* Search & Filter */
        .search-filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .search-wrapper {
          flex: 2;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #8b5cf6;
          background: rgba(0, 0, 0, 0.5);
        }
        .filter-wrapper {
          flex: 1;
          position: relative;
        }
        .filter-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }
        .filter-select {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .filter-select option {
          background: #1e1b4b;
        }

        /* Expenses Grid */
        .expenses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.25rem;
        }
        .expense-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.4s ease backwards;
        }
        .expense-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .expense-card-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .expense-title-section {
          display: flex;
          gap: 0.75rem;
          flex: 1;
        }
        .expense-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .expense-title {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
        }
        .expense-description {
          color: #94a3b8;
          font-size: 0.75rem;
          margin: 0;
        }
        .expense-actions {
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
        .edit-btn {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
        .edit-btn:hover {
          background: #3b82f6;
          color: white;
        }
        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .delete-btn:hover {
          background: #ef4444;
          color: white;
        }
        .expense-card-footer {
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .expense-amount {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .amount-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #a78bfa;
        }
        .amount-currency {
          font-size: 0.7rem;
          color: #64748b;
        }
        .expense-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.75rem;
        }

        /* Delete Overlay */
        .delete-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .delete-dialog {
          text-align: center;
          padding: 1rem;
        }
        .delete-dialog p {
          color: white;
          margin-bottom: 1rem;
        }
        .delete-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        .confirm-delete, .cancel-delete {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .confirm-delete {
          background: #ef4444;
          color: white;
        }
        .cancel-delete {
          background: #334155;
          color: white;
        }

        /* Empty State */
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
          font-size: 1.25rem;
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
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
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
        .flex-1 {
          flex: 1;
        }
        .modal-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .required-star {
          color: #ef4444;
          margin-left: 0.25rem;
        }
        .modal-input, .modal-select, .modal-textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .modal-input:focus, .modal-select:focus, .modal-textarea:focus {
          outline: none;
          border-color: #8b5cf6;
        }
        .modal-textarea {
          resize: vertical;
          font-family: inherit;
        }
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        .modal-button {
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .modal-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }
        .modal-button.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .modal-button.primary {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .modal-button.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        @media (max-width: 640px) {
          .expenses-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          .header-left {
            flex-direction: column;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
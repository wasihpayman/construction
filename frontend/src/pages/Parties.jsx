import { useEffect, useState } from "react";
import api from "../services/api";
import { useProject } from "../contexts/ProjectContext";
import "../styles/responsive.css";
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Phone, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  DollarSign,
  Calendar,
  Wallet,
  User
} from "lucide-react";

export default function Parties() {
  const { activeProjectId, hasActiveProject } = useProject();
  const [projects, setProjects] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partyPayments, setPartyPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [balanceSummary, setBalanceSummary] = useState({});

  const [partyForm, setPartyForm] = useState({
    name: "",
    phone: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    amount: "",
    currency: "AFN",
    project_id: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    party_id: "",
    amount: "",
    currency: "AFN",
    payment_date: new Date().toISOString().split('T')[0],
    description: "",
  });

  useEffect(() => {
    // Load projects for dropdown
    loadProjects();
    if (hasActiveProject) {
      fetchParties();
      fetchBalanceSummary();
    }
  }, [activeProjectId, hasActiveProject]);

  const loadProjects = async () => {
    try {
      const res = await api.get("/project-management");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setProjects([]);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchParties = async () => {
    try {
      setLoading(true);
      const res = await api.get("/parties", {
        params: { project_id: activeProjectId, include: 'payments' }
      });
      console.log("Parties API response:", res.data);
      setParties(res.data || []);
    } catch (err) {
      console.error("Error fetching parties:", err);
      showToast("Failed to load parties", "error");
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSummary = async () => {
    try {
      const res = await api.get("/balance-summary");
      setBalanceSummary(res.data || {});
    } catch (err) {
      console.log(err);
      setBalanceSummary({});
    }
  };

  const fetchPartyPayments = async (partyId) => {
    try {
      const res = await api.get(`/parties/${partyId}/payments`);
      setPartyPayments(res.data);
    } catch (err) {
      console.log(err);
      showToast("Failed to load payments", "error");
    }
  };

  const handlePartyChange = (e) => {
    setPartyForm({
      ...partyForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value,
    });
  };

  const createOrUpdateParty = async () => {
    if (!partyForm.name.trim()) {
      showToast("Please enter party name", "error");
      return;
    }
    if (!partyForm.amount) {
      showToast("Please enter amount", "error");
      return;
    }
    if (!partyForm.project_id) {
      showToast("Please select a project", "error");
      return;
    }

    try {
      if (editingParty) {
        await api.put(`/parties/${editingParty.id}`, partyForm);
        showToast("Party updated successfully!", "success");
      } else {
        await api.post("/parties", partyForm);
        showToast("Party added successfully!", "success");
      }
      
      resetPartyForm();
      fetchParties();
    } catch (err) {
      console.log(err);
      showToast("Error saving party", "error");
    }
  };

  const deleteParty = async (id) => {
    try {
      await api.delete(`/parties/${id}`);
      showToast("Party deleted successfully!", "success");
      fetchParties();
      setDeleteConfirm(null);
    } catch (err) {
      console.log(err);
      showToast("Error deleting party", "error");
    }
  };

  const createPayment = async () => {
    if (!paymentForm.amount || !paymentForm.party_id) {
      showToast("Please fill in amount and select party", "error");
      return;
    }

    try {
      const response = await api.post("/party-payments", {
        ...paymentForm,
        amount: Number(paymentForm.amount),
      });
      
      console.log("Payment created:", response.data);
      showToast("Payment added successfully!", "success");
      resetPaymentForm();
      fetchPartyPayments(paymentForm.party_id);
      fetchParties(); // Refresh parties to update payment display
      fetchBalanceSummary();
    } catch (err) {
      console.log("Error adding payment:", err);
      showToast("Error adding payment", "error");
    }
  };

  const resetPartyForm = () => {
    setPartyForm({
      name: "",
      phone: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      amount: "",
      currency: "AFN",
      project_id: activeProjectId || "",
    });
    setEditingParty(null);
    setShowModal(false);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      party_id: "",
      amount: "",
      currency: "AFN",
      payment_date: new Date().toISOString().split('T')[0],
      description: "",
    });
    setShowPaymentModal(false);
  };

  const openPartyModal = (party) => {
    setEditingParty(party);
    if (party) {
      setPartyForm({
        name: party.name,
        phone: party.phone || "",
        description: party.description || "",
        date: party.date || new Date().toISOString().split('T')[0],
        amount: party.amount || "",
        currency: party.currency || "AFN",
        project_id: party.project_id || activeProjectId || "",
      });
    } else {
      resetPartyForm();
    }
    setShowModal(true);
  };

  const openPaymentModal = (party) => {
    setSelectedParty(party);
    setPaymentForm({
      ...paymentForm,
      party_id: party.id,
    });
    setShowPaymentModal(true);
  };

  const viewPartyDetails = (party) => {
    setSelectedParty(party);
    fetchPartyPayments(party.id);
  };

  const getCurrencySymbol = (currency) => {
    switch(currency) {
      case 'AFN': return 'AFN';
      case 'USD': return '$';
      case 'EUR': return 'EUR';
      default: return 'AFN';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return `${year} ${month} ${day}`;
  };

  const getPartyTotalBalance = (party) => {
    const balances = {};
    if (party.payments) {
      party.payments.forEach(payment => {
        if (!balances[payment.currency]) balances[payment.currency] = 0;
        balances[payment.currency] += parseFloat(payment.amount || 0);
      });
    }
    return balances;
  };

  const filteredParties = parties.filter(party => {
    const matchesName = party.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhone = party.phone && party.phone.includes(searchTerm);
    console.log("Filtering party:", party.name, "matchesName:", matchesName, "matchesPhone:", matchesPhone);
    return matchesName || matchesPhone;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
            <Users className="absolute inset-0 m-auto text-blue-400" size={22} />
          </div>
          <p className="text-blue-200 font-medium tracking-wide">Loading Parties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parties-container">
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
      <div className="parties-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Users className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div className="header-text">
              <h1>
                Party Management
                <span className="header-badge">Balance</span>
              </h1>
              <p>Manage partners and track their contributions</p>
            </div>
          </div>
          <button onClick={() => openPartyModal()} className="btn-primary">
            <Plus size={18} />
            <span>Add Party</span>
          </button>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="balance-summary">
        <div className="summary-header">
          <Wallet size={20} />
          <h3>Total Balance Summary</h3>
        </div>
        <div className="balance-cards">
          {Object.entries(balanceSummary).map(([currency, amount]) => (
            <div key={currency} className="balance-card">
              <span className="currency-symbol">{getCurrencySymbol(currency)}</span>
              <span className="balance-amount">{Number(amount).toLocaleString()}</span>
              <span className="currency-name">{currency}</span>
            </div>
          ))}
          {Object.keys(balanceSummary).length === 0 && (
            <div className="no-balance">
              <span>No payments recorded yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search parties by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Parties List */}
      <div className="parties-list">
        {filteredParties.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={48} strokeWidth={1} />
            </div>
            <h3>No parties found</h3>
            <p>
              {searchTerm ? "Try a different search term" : "Click 'Add Party' to create your first party"}
            </p>
            {!searchTerm && (
              <button onClick={() => openPartyModal()} className="empty-btn">
                <Plus size={16} />
                Add Party
              </button>
            )}
          </div>
        ) : (
          <div className="parties-grid">
            {filteredParties.map((party, index) => {
              const balances = getPartyTotalBalance(party);
              return (
                <div key={party.id} className="party-card" style={{ animationDelay: `${index * 0.05}s` }}>
                  {deleteConfirm === party.id && (
                    <div className="delete-overlay">
                      <div className="delete-dialog">
                        <p>Delete this party?</p>
                        <div className="delete-actions">
                          <button onClick={() => deleteParty(party.id)} className="confirm-delete">
                            Yes
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="cancel-delete">
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="party-card-header">
                    <div className="party-info">
                      <div className="party-avatar">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="party-name">{party.name}</h3>
                        {party.phone && (
                          <p className="party-phone">
                            <Phone size={14} />
                            {party.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="party-actions">
                      <button onClick={() => openPartyModal(party)} className="action-btn edit-btn" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm(party.id)} className="action-btn delete-btn" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="party-card-body">
                    {party.description && (
                      <p className="party-description">{party.description}</p>
                    )}
                    <div className="party-balance">
                      {Object.keys(balances).length > 0 ? (
                        <div className="balance-list">
                          {Object.entries(balances).map(([currency, amount]) => (
                            <div key={currency} className="balance-item">
                              <span className="amount">{getCurrencySymbol(currency)} {Number(amount).toLocaleString()}</span>
                              <span className="currency">{currency}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-payments">No payments yet</span>
                      )}
                    </div>
                  </div>
                  <div className="party-card-footer">
                    <button onClick={() => viewPartyDetails(party)} className="view-details-btn">
                      <FileText size={16} />
                      View Details
                    </button>
                    <button onClick={() => openPaymentModal(party)} className="add-payment-btn">
                      <DollarSign size={16} />
                      Add Payment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Party Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetPartyForm}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  {editingParty ? <Edit size={18} /> : <Plus size={18} />}
                </div>
                <span>{editingParty ? 'Edit Party' : 'Add New Party'}</span>
              </div>
              <button onClick={resetPartyForm} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="modal-label">
                  Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., John Doe, Company Name"
                  value={partyForm.name}
                  onChange={handlePartyChange}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label className="modal-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g., +93 70 123 4567"
                  value={partyForm.phone}
                  onChange={handlePartyChange}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label className="modal-label">Description</label>
                <textarea
                  name="description"
                  placeholder="Optional: Add details about this party..."
                  value={partyForm.description}
                  onChange={handlePartyChange}
                  className="modal-textarea"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="modal-label">
                  Project <span className="required-star">*</span>
                </label>
                <select
                  name="project_id"
                  value={partyForm.project_id}
                  onChange={handlePartyChange}
                  className="modal-select"
                  required
                >
                  <option value="">Select a project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="modal-label">
                  Date <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={partyForm.date}
                  onChange={handlePartyChange}
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
                    value={partyForm.amount}
                    onChange={handlePartyChange}
                    className="modal-input"
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="modal-label">Currency</label>
                  <select
                    name="currency"
                    value={partyForm.currency}
                    onChange={handlePartyChange}
                    className="modal-select"
                  >
                    <option value="AFN">AFN (Afghani)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={resetPartyForm} className="modal-button secondary">
                Cancel
              </button>
              <button onClick={createOrUpdateParty} className="modal-button primary">
                {editingParty ? (
                  <>
                    <Edit size={16} />
                    Update Party
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Party
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={resetPaymentForm}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  <DollarSign size={18} />
                </div>
                <span>Add Payment for {selectedParty?.name}</span>
              </div>
              <button onClick={resetPaymentForm} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="modal-label">
                  Amount <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label className="modal-label">Currency</label>
                <select
                  name="currency"
                  value={paymentForm.currency}
                  onChange={handlePaymentChange}
                  className="modal-select"
                >
                  <option value="AFN">AFN (Afghani)</option>
                  <option value="USD">USD (Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="modal-label">
                  Payment Date <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={paymentForm.payment_date}
                  onChange={handlePaymentChange}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label className="modal-label">Description</label>
                <textarea
                  name="description"
                  placeholder="Optional: Add payment details..."
                  value={paymentForm.description}
                  onChange={handlePaymentChange}
                  className="modal-textarea"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={resetPaymentForm} className="modal-button secondary">
                Cancel
              </button>
              <button onClick={createPayment} className="modal-button primary">
                <DollarSign size={16} />
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Party Details Modal */}
      {selectedParty && !showPaymentModal && !showModal && (
        <div className="modal-overlay" onClick={() => setSelectedParty(null)}>
          <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-title-icon">
                  <User size={18} />
                </div>
                <span>{selectedParty.name} - Payment History</span>
              </div>
              <button onClick={() => setSelectedParty(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="party-details">
                <div className="party-info-section">
                  <h4>Party Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{selectedParty.name}</span>
                    </div>
                    {selectedParty.phone && (
                      <div className="info-item">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{selectedParty.phone}</span>
                      </div>
                    )}
                    {selectedParty.description && (
                      <div className="info-item full-width">
                        <span className="info-label">Description:</span>
                        <span className="info-value">{selectedParty.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="payments-section">
                  <div className="payments-header">
                    <h4>Payment History</h4>
                    <button onClick={() => openPaymentModal(selectedParty)} className="add-payment-btn-small">
                      <Plus size={14} />
                      Add Payment
                    </button>
                  </div>
                  
                  {partyPayments.length === 0 ? (
                    <div className="no-payments-state">
                      <DollarSign size={32} />
                      <p>No payments recorded yet</p>
                    </div>
                  ) : (
                    <div className="payments-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partyPayments.map((payment) => (
                            <tr key={payment.id}>
                              <td>
                                <div className="payment-date">
                                  <Calendar size={14} />
                                  {formatDate(payment.payment_date)}
                                </div>
                              </td>
                              <td>
                                <span className="payment-amount">
                                  {getCurrencySymbol(payment.currency)} {parseFloat(payment.amount || 0).toLocaleString()}
                                </span>
                              </td>
                              <td>
                                <span className="payment-currency">{payment.currency}</span>
                              </td>
                              <td>
                                <span className="payment-description">
                                  {payment.description || '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Styles for Parties page - similar to existing pages */
        .parties-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .parties-container {
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
        .parties-header {
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
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #59a5f5, #3b82f6);
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
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        /* Balance Summary */
        .balance-summary {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: white;
        }
        .summary-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }
        .balance-cards {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .balance-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
          border-radius: 12px;
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .currency-symbol {
          font-size: 0.875rem;
          color: #94a3b8;
        }
        .balance-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #60a5fa;
        }
        .currency-name {
          font-size: 0.75rem;
          color: #64748b;
        }
        .no-balance {
          color: #94a3b8;
          font-style: italic;
        }

        /* Search */
        .search-bar {
          margin-bottom: 2rem;
        }
        .search-wrapper {
          position: relative;
          max-width: 400px;
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
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(0, 0, 0, 0.5);
        }

        /* Parties Grid */
        .parties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.25rem;
        }
        .party-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.4s ease backwards;
        }
        .party-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .party-card-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .party-info {
          display: flex;
          gap: 0.75rem;
          flex: 1;
        }
        .party-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .party-name {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
        }
        .party-phone {
          color: #94a3b8;
          font-size: 0.75rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .party-actions {
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
        .party-card-body {
          padding: 1rem;
        }
        .party-description {
          color: #94a3b8;
          font-size: 0.75rem;
          margin: 0 0 1rem;
        }
        .party-balance {
          margin-bottom: 1rem;
        }
        .balance-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .balance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .amount {
          font-weight: 600;
          color: #60a5fa;
        }
        .currency {
          font-size: 0.75rem;
          color: #64748b;
        }
        .no-payments {
          color: #94a3b8;
          font-style: italic;
          font-size: 0.875rem;
        }
        .party-card-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 0.75rem;
        }
        .view-details-btn, .add-payment-btn {
          flex: 1;
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .view-details-btn {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
        .view-details-btn:hover {
          background: #3b82f6;
          color: white;
        }
        .add-payment-btn {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }
        .add-payment-btn:hover {
          background: #10b981;
          color: white;
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
          background: rgba(59, 130, 246, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
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
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(59, 130, 246, 0.3);
          animation: slideUp 0.3s ease;
        }
        .modal-container.large {
          max-width: 800px;
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
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .modal-input:focus, .modal-select:focus, .modal-textarea:focus {
          outline: none;
          border-color: #3b82f6;
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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .modal-button.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        /* Party Details */
        .party-details {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .party-info-section h4, .payments-section h4 {
          color: white;
          margin: 0 0 1rem;
          font-size: 1.125rem;
          font-weight: 600;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .info-item.full-width {
          grid-column: 1 / -1;
        }
        .info-label {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        .info-value {
          color: #e2e8f0;
          font-weight: 500;
        }
        .payments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .add-payment-btn-small {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-payment-btn-small:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .no-payments-state {
          text-align: center;
          padding: 2rem;
          color: #94a3b8;
        }
        .payments-table {
          overflow-x: auto;
        }
        .payments-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .payments-table th {
          background: rgba(59, 130, 246, 0.1);
          color: #e2e8f0;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .payments-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
        }
        .payment-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
        }
        .payment-amount {
          font-weight: 600;
          color: #60a5fa;
        }
        .payment-currency {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
        }
        .payment-description {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .parties-grid {
            grid-template-columns: 1fr;
          }
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          .header-left {
            flex-direction: column;
            text-align: center;
          }
          .balance-cards {
            flex-direction: column;
          }
          .modal-container.large {
            max-width: 95%;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

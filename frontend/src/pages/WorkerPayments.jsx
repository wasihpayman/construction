import { useEffect, useState } from "react";
import api from "../services/api";
import { Users, Wallet, Calendar, Search, Filter, Plus, Edit, Trash2, CheckCircle, CheckCircle2, X, AlertCircle, TrendingUp, CreditCard, FileText, DollarSign } from "lucide-react";
import "../css/Units.css";

export default function WorkerPayments() {
  const [items, setItems] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${date.getFullYear()} ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const [form, setForm] = useState({
    worker_id: "",
    amount: "",
    payment_date: "",
    payment_method: "cash",
    currency: "AFN",
    description: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/worker-payments");
    const w = await api.get("/workers");

    setItems(res.data);
    setWorkers(w.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("Submitting payment data:", form);
    
    // Validate worker selection before sending
    if (!form.worker_id) {
      alert("Please select a worker");
      return;
    }
    
    try {
      await api.post("/worker-payments", form);

      setForm({
        worker_id: "",
        amount: "",
        payment_date: "",
        payment_method: "cash",
        currency: "AFN",
        description: "",
      });

      load();
      setShowModal(false); // Close modal after successful submission
    } catch (error) {
      console.error("Error saving payment:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/worker-payments/${id}`);
      load();
    } catch (error) {
      console.error("Error deleting payment:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  return (
    <div className="units-container">
      {/* Header */}
      <div className="units-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-icon">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="header-text">
              <h1>Worker Payments</h1>
              <p>Manage and track worker payment records</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Payment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Payments</div>
              <div className="stat-value">{items.length}</div>
            </div>
            <div className="stat-icon">
              <CreditCard size={18} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Amount</div>
              <div className="stat-value">{items.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()} AFN</div>
            </div>
            <div className="stat-icon">
              <Wallet size={18} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">This Month</div>
              <div className="stat-value">
                {items
                  .filter(p => new Date(p.payment_date).getMonth() === new Date().getMonth() && new Date(p.payment_date).getFullYear() === new Date().getFullYear())
                  .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                  .toLocaleString()} AFN
              </div>
            </div>
            <div className="stat-icon">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Workers Display */}
      <div className="units-display">
        <div className="units-card">
          <div className="units-header-bar">
            <div className="units-title">
              <Wallet size={24} className="text-white" style={{ color: 'white' }} />
              <span>
                Worker Payments <span className="text-slate-500 font-normal">({items.length})</span>
              </span>
            </div>
            <div className="units-stats">
              <span className="stat-badge available">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                {items.length} Total
              </span>
            </div>
          </div>

          <div className="units-table-container">
            <table className="units-table">
              <thead>
                <tr className="table-header">
                  <th className="table-header-cell">Worker</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Currency</th>
                  <th className="table-header-cell">Payment Method</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-cell text-center text-slate-400 py-8">
                      No worker payments found. Click "Add Payment" to create your first payment record.
                    </td>
                  </tr>
                ) : (
                  items.map((payment) => (
                    <tr key={payment.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                            <Users size={14} className="text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{payment.worker?.name}</div>
                            <div className="text-xs text-slate-400">{payment.worker?.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell price-cell">
                        {parseFloat(payment.amount || 0).toLocaleString()}
                      </td>
                      <td className="table-cell">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {payment.currency}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {payment.payment_type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDate(payment.payment_date)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(payment.id)}
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

      {/* Add Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title">
                <Wallet className="w-5 h-5 text-blue-500" />
                <span>Add New Payment</span>
              </div>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="space-y-4">
                {/* Worker Selection */}
                <div>
                  <label className="modal-label">Select Worker</label>
                  <select
                    name="worker_id"
                    value={form.worker_id}
                    onChange={handleChange}
                    className="modal-input"
                  >
                    <option value="">Choose a worker...</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} - {w.position}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="modal-label">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="modal-input"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="modal-label">Currency</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="modal-input"
                  >
                    <option value="AFN">AFN (Afghani)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="modal-label">Payment Method</label>
                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={handleChange}
                    className="modal-input"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="modal-label">Payment Date</label>
                  <input
                    type="date"
                    name="payment_date"
                    value={form.payment_date}
                    onChange={handleChange}
                    className="modal-input"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="modal-label">Description</label>
                  <input
                    name="description"
                    placeholder="Payment description (optional)"
                    value={form.description}
                    onChange={handleChange}
                    className="modal-input"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="modal-button secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="modal-button primary">
                <Plus size={16} />
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
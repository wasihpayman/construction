import { useEffect, useState } from "react";

import api from "../services/projectApi";
import { useProject } from "../contexts/ProjectContext";

import "../styles/responsive.css";

import { 
  User, 
  Users, 
  DollarSign, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Wallet 
} from "lucide-react";

import "../css/Units.css";


export default function Workers() {

  const { activeProjectId, hasActiveProject } = useProject();

  const [workers, setWorkers] = useState([]);

  const [filteredWorkers, setFilteredWorkers] = useState([]);

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState(null);

  const [filters, setFilters] = useState({

    search: '',

    status: '',

    payment_status: ''

  });



  // Form states

  const [formData, setFormData] = useState({

    name: '',

    phone: '',

    position: '',

    hire_date: new Date().toISOString().split('T')[0],

    status: 'active',

    description: ''

  });



  const [paymentFormData, setPaymentFormData] = useState({

    worker_id: '',

    amount: '',

    payment_date: new Date().toISOString().split('T')[0],

    payment_method: 'cash',

    description: ''

  });



  useEffect(() => {

    if (hasActiveProject) {

      loadData();

    }

  }, [activeProjectId, hasActiveProject]);



  useEffect(() => {

    applyFilters();

  }, [workers, payments, filters]);



  const loadData = async () => {

    try {

      setLoading(true);
      
      // Clear previous data immediately
      setWorkers([]);
      setFilteredWorkers([]);
      setPayments([]);

      const [workersData, paymentsData] = await Promise.all([

        api.get("/workers"),

        api.get("/worker-payments")

      ]);

      const workersList = workersData.data || [];

      setWorkers(workersList);

      setFilteredWorkers(workersList);

      setPayments(paymentsData.data || []);

    } catch (error) {

      console.error("Error loading data:", error);
      
      // Clear data on error too
      setWorkers([]);
      setFilteredWorkers([]);
      setPayments([]);

    } finally {

      setLoading(false);

    }

  };



  const applyFilters = () => {

    let filtered = [...workers];

    

    if (filters.search) {

      const searchLower = filters.search.toLowerCase();

      filtered = filtered.filter(w => 

        w.name?.toLowerCase().includes(searchLower) ||

        w.position?.toLowerCase().includes(searchLower) ||

        w.phone?.includes(searchLower)

      );

    }

    

    if (filters.status) {

      filtered = filtered.filter(w => w.status === filters.status);

    }

    

    if (filters.payment_status) {

      filtered = filtered.filter(w => {

        const workerPayments = payments.filter(p => p.worker_id === w.id);

        const totalPaid = workerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        
        if (filters.payment_status === 'paid') {

          return totalPaid > 0;

        } else if (filters.payment_status === 'unpaid') {

          return totalPaid === 0;

        }

        return true;

      });

    }

    

    setFilteredWorkers(filtered);

  };



  const handleFilterChange = (field, value) => {

    setFilters(prev => ({ ...prev, [field]: value }));

  };



  const clearFilters = () => {

    setFilters({ search: '', status: '', payment_status: '' });

  };



  const openModal = (worker = null) => {

    setSelectedWorker(worker);

    if (worker) {

      setFormData({

        name: worker.name,

        phone: worker.phone,

        position: worker.position,

        hire_date: worker.hire_date,

        status: worker.status

      });

    } else {

      setFormData({

        name: '',

        phone: '',

        position: '',

        hire_date: new Date().toISOString().split('T')[0],

        status: 'active'

      });

    }

    setShowModal(true);

  };



  const closeModal = () => {

    setShowModal(false);

    setSelectedWorker(null);

    setFormData({

      name: '',

      phone: '',
      position: '',
      hire_date: new Date().toISOString().split('T')[0],

      status: 'active'

    });

  };



  const openPaymentModal = (worker) => {

    setSelectedWorker(worker);

    setPaymentFormData({

      worker_id: worker.id,

      amount: '',

      payment_date: new Date().toISOString().split('T')[0],

      payment_method: 'cash',

      description: ''

    });

    setShowPaymentModal(true);

  };



  const closePaymentModal = () => {

    setShowPaymentModal(false);

    setSelectedWorker(null);

    setPaymentFormData({

      worker_id: '',

      amount: '',

      payment_date: new Date().toISOString().split('T')[0],

      payment_method: 'cash',

      description: ''

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    console.log("Submitting worker data:", formData);

    try {

      if (selectedWorker) {

        await api.put(`/workers/${selectedWorker.id}`, formData);

      } else {

        await api.post("/workers", formData);

      }

      closeModal();

      loadData();

    } catch (error) {

      console.error("Error saving worker:", error);

      console.error("Error response:", error.response?.data);

      alert("Error saving worker. Please try again.");

    }

  };



  const handlePaymentSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.post("/worker-payments", paymentFormData);

      closePaymentModal();

      loadData();

    } catch (error) {

      console.error("Error recording payment:", error);

      alert("Error recording payment. Please try again.");

    }

  };



  const handleDelete = async (workerId) => {

    if (confirm("Are you sure you want to delete this worker?")) {

      try {

        await api.delete(`/workers/${workerId}`);

        loadData();

      } catch (error) {

        console.error("Error deleting worker:", error);

        alert("Error deleting worker. Please try again.");

      }

    }

  };



  const getWorkerPaymentStatus = (workerId) => {
    const workerPayments = payments.filter(p => p.worker_id === workerId);
    const totalPaid = workerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    // Since salary is removed, we'll just show payment status based on amount
    const hasPayment = totalPaid > 0;
    
    if (hasPayment) return { status: 'paid', amount: totalPaid, percentage: 100 };
    return { status: 'unpaid', amount: totalPaid, percentage: 0 };
  };



  const hasActiveFilters = filters.search || filters.status || filters.payment_status;



  if (!hasActiveProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
            <AlertCircle size={40} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">No Project Selected</h2>
            <p className="text-blue-200">Please select a project to view workers</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">

        <div className="flex flex-col items-center gap-4">

          <div className="relative w-16 h-16">

            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>

            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>

            <Users className="absolute inset-0 m-auto text-blue-400" size={22} />

          </div>

          <p className="text-blue-200 font-medium tracking-wide">Loading Workers...</p>

        </div>

      </div>

    );

  }



  return (

    <div className="responsive-container units-container">

      {/* Header */}

      <div className="units-header">

        <div className="header-content">

          <div className="header-center">

            <div className="header-icon">

              <Users className="w-6 h-6 text-white" />

            </div>

            <div className="header-text">

              <h1>Workers</h1>

              <p>Manage your workforce and track payments</p>

            </div>

          </div>

          <div className="header-actions">

            <button

              onClick={() => openModal()}

              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"

            >

              <Plus size={16} />

              Add Worker

            </button>

          </div>

        </div>

      </div>



      {/* Stats Cards */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-header">

            <div>

              <div className="stat-label">Total Workers</div>

              <div className="stat-value">{filteredWorkers.length}</div>

            </div>

            <div className="stat-icon">

              <Users size={18} className="text-blue-400" />

            </div>

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-header">

            <div>

              <div className="stat-label">Active</div>

              <div className="stat-value">{filteredWorkers.filter(w => w.status === 'active').length}</div>

            </div>

            <div className="stat-icon">

              <CheckCircle2 size={18} className="text-emerald-400" />

            </div>

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-header">

            <div>

              <div className="stat-label">Inactive</div>

              <div className="stat-value">{filteredWorkers.filter(w => w.status === 'inactive').length}</div>

            </div>

            <div className="stat-icon">

              <AlertCircle size={18} className="text-slate-400" />

            </div>

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-header">

            <div>

              <div className="stat-label">Total Salary</div>

              <div className="stat-value">${filteredWorkers.reduce((sum, w) => sum + parseFloat(w.salary || 0), 0).toLocaleString()}</div>

            </div>

            <div className="stat-icon">

              <DollarSign size={18} className="text-amber-400" />

            </div>

          </div>

        </div>



        <div className="stat-card">

          <div className="stat-header">

            <div>

              <div className="stat-label">Paid Amount</div>

              <div className="stat-value">{payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()} AFN</div>

            </div>

            <div className="stat-icon">

              <Wallet size={18} className="text-green-400" />

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

              <span>Filters & Display</span>

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

            {/* Search Input */}

            <div>

              <label className="filter-label">Search Worker</label>

              <div className="relative">

                <input

                  type="text"

                  value={filters.search}

                  onChange={(e) => handleFilterChange('search', e.target.value)}

                  placeholder="Type name, position, or phone number..."

                  className="modal-input"

                />

                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

              </div>

            </div>



            <div className="filter-group">

              {/* Status Filter */}

              <div>

                <label className="filter-label">Status</label>

                <select

                  value={filters.status}

                  onChange={(e) => handleFilterChange('status', e.target.value)}

                  className="filter-select"

                >

                  <option value="">All Status</option>

                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>

                </select>

              </div>



              {/* Payment Status Filter */}

              <div>

                <label className="filter-label">Payment Status</label>

                <select

                  value={filters.payment_status}

                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}

                  className="filter-select"

                >

                  <option value="">All Workers</option>

                  <option value="paid">Has Payment</option>

                  <option value="unpaid">No Payment</option>

                </select>

              </div>

            </div>

          </div>

        </div>

      </div>



      {/* Workers Display */}

      <div className="units-display">

        <div className="units-card">

          <div className="units-header-bar">

            <div className="units-title">

              <Users size={24} className="text-white" style={{ color: 'white' }} />

              <span>

                Workers <span className="text-slate-500 font-normal">({filteredWorkers.length})</span>

              </span>

            </div>

            <div className="units-stats">

              <span className="stat-badge available">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>

                {filteredWorkers.filter(w => w.status === 'active').length} Active

              </span>

              <span className="stat-badge sold">

                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block"></span>

                {filteredWorkers.filter(w => w.status === 'inactive').length} Inactive

              </span>

            </div>

          </div>



          <div className="units-table-container">

            <table className="units-table">

              <thead>

                <tr className="table-header">

                  <th className="table-header-cell">Name</th>

                  <th className="table-header-cell">Position</th>

                  <th className="table-header-cell">Phone</th>

                  
                  <th className="table-header-cell">Payment Status</th>

                  <th className="table-header-cell">Status</th>

                  <th className="table-header-cell">Actions</th>

                </tr>

              </thead>

              <tbody className="table-body">

                {filteredWorkers.length === 0 ? (

                  <tr>

                    <td colSpan="6" className="table-cell text-center">

                      No workers found matching your filters.

                    </td>

                  </tr>

                ) : (

                  filteredWorkers.map(worker => {

                    const paymentStatus = getWorkerPaymentStatus(worker.id);

                    return (

                      <tr key={worker.id} className="table-row">

                        <td className="table-cell">

                          <div className="unit-cell">

                            <div className={`unit-icon-small ${worker.status === 'active' ? 'available' : 'sold'}`}>

                              <Users size={13} className={worker.status === 'active' ? 'text-emerald-400' : 'text-violet-400'} />

                            </div>

                            <div>

                              <span className="unit-name">{worker.name}</span>
                            </div>

                          </div>

                        </td>

                        <td className="table-cell">

                          <span className="floor-badge">{worker.position}</span>

                        </td>

                        <td className="table-cell">{worker.phone}</td>

                        
                        <td className="table-cell">

                          <span className={`status-badge ${paymentStatus.status === 'paid' ? 'available' : 'sold'}`}>

                            {paymentStatus.status === 'paid' ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}

                            {paymentStatus.percentage}% paid

                          </span>

                        </td>

                        <td className="table-cell">

                          <span className={`status-badge ${worker.status === 'active' ? 'available' : 'sold'}`}>

                            {worker.status === 'active' ? <CheckCircle2 size={9} /> : <X size={9} />}

                            {worker.status}

                          </span>

                        </td>

                        <td className="table-cell">

                          <div className="flex items-center gap-2">
                            <button

                              onClick={() => handleDelete(worker.id)}

                              className="sell-button-small"

                              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}

                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>



      {/* Add/Edit Worker Modal */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal-container">

            {/* Modal Header */}

            <div className="modal-header">

              <div className="modal-header-content">

                <div className="modal-icon">

                  <Users size={18} className="text-white" />

                </div>

                <div>

                  <h3 className="text-white font-bold text-lg">{selectedWorker ? 'Edit Worker' : 'Add Worker'}</h3>

                  <p className="text-blue-300/70 text-xs">Fill in worker details</p>

                </div>

              </div>

              <button onClick={closeModal} className="modal-close">

                <X size={16} />

              </button>

            </div>



            {/* Modal Form */}

            <div className="modal-body">

              {[

                { label: 'Name', key: 'name', type: 'text', placeholder: 'Enter full name', icon: <User size={14} /> },

                { label: 'Phone', key: 'phone', type: 'tel', placeholder: 'Phone number', icon: <Users size={14} /> },

                { label: 'Position', key: 'position', type: 'text', placeholder: 'Job position', icon: <Users size={14} /> },

                { label: 'Hire Date', key: 'hire_date', type: 'date', placeholder: '', icon: <Calendar size={14} /> },

                { label: 'Status', key: 'status', type: 'select', placeholder: '', icon: <CheckCircle2 size={14} /> },

              ].map(({ label, key, type, placeholder, icon }) => (

                <div key={key} className="modal-field">

                  <label className="modal-label">

                    <span className="text-slate-500">{icon}</span>

                    {label}

                  </label>

                  {type === 'select' ? (

                    <select

                      value={formData[key]}

                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}

                      className="modal-input"

                    >

                      <option value="active" className="bg-slate-800">Active</option>

                      <option value="inactive" className="bg-slate-800">Inactive</option>

                    </select>

                  ) : (

                    <input

                      type={type}

                      value={formData[key]}

                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}

                      placeholder={placeholder}

                      className="modal-input"
                    />

                  )}

                </div>

              ))}

            </div>



            <div className="modal-footer">

              <button

                onClick={handleSubmit}

                className="modal-submit"

              >

                {selectedWorker ? 'Update Worker' : 'Add Worker'}

              </button>

            </div>

          </div>

        </div>

      )}



      {/* Add Payment Modal */}

      {showPaymentModal && selectedWorker && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePaymentModal} />

          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">

            <div className="relative px-6 pt-6 pb-4 border-b border-white/10">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">

                  <DollarSign size={18} className="text-white" />

                </div>

                <div>

                  <h3 className="text-white font-bold text-lg">Add Payment</h3>

                  <p className="text-blue-300/70 text-xs">Worker: <span className="font-semibold text-blue-300">{selectedWorker.name}</span></p>

                </div>

              </div>

              <button onClick={closePaymentModal} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">

                <X size={16} />

              </button>

            </div>



            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount ($)</label>

                  <input

                    type="number"

                    value={paymentFormData.amount}

                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}

                    placeholder="Payment amount"

                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"

                    required

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Date</label>

                  <input

                    type="date"

                    value={paymentFormData.payment_date}

                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_date: e.target.value }))}

                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"

                    required

                  />

                </div>

              </div>



              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>

                  <div className="relative">

                    <select

                      value={paymentFormData.payment_method}

                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_method: e.target.value }))}

                      className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all cursor-pointer"

                    >

                      <option value="cash" className="bg-slate-800">Cash</option>

                      <option value="bank_transfer" className="bg-slate-800">Bank Transfer</option>

                      <option value="check" className="bg-slate-800">Check</option>

                      <option value="other" className="bg-slate-800">Other</option>

                    </select>

                  </div>

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>

                  <input

                    type="text"

                    value={paymentFormData.description}

                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, description: e.target.value }))}

                    placeholder="Payment description (optional)"

                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"

                  />

                </div>

              </div>



              <div className="flex justify-end pt-4">

                <button

                  type="submit"

                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"

                >

                  Add Worker

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}
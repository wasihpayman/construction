import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/Units.css";
import "../styles/Modal.css";
import {
  Building2, Package, DollarSign, Calendar, User,
  Filter, LayoutGrid, X, CheckCircle2, Clock,
  ChevronDown, Search, Sparkles, TrendingUp, Home,
  BadgeDollarSign, BarChart3, ArrowUpRight, Download
} from "lucide-react";
import DialogBox, { useDialog } from "../components/DialogBox";

// Helper function to get base URL
const getBaseUrl = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
};

export default function Units() {
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog hook
  const { showSuccess, showError, showInfo, DialogComponent } = useDialog();
  const [groupByFloor, setGroupByFloor] = useState(true);
  const [useSettingsBased, setUseSettingsBased] = useState(true);
  const [filters, setFilters] = useState({
    project_id: '',
    floor: '',
    status: ''
  });
  const [markingSold, setMarkingSold] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [saleDetailsModalData, setSaleDetailsModalData] = useState(null);
  const [form, setForm] = useState({ buyer_name: '', sale_price: '', sold_date: '', sale_description: '' });
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: '',
    payment_method: 'cash',
    notes: ''
  });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadData(); }, [useSettingsBased]);
  useEffect(() => { applyFilters(); }, [units, filters, groupByFloor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unitsData, projectsData, settingsData] = await Promise.all([
        api.get("/units"),
        api.get("/projects"),
        api.get("/unit-settings")
      ]);
      setProjects(projectsData.data || []);
      if (useSettingsBased && settingsData.data) {
        const generatedUnits = generateUnitsFromSettings(settingsData.data);

        // Merge with database units to get real status
        const dbUnits = unitsData.data || [];
        const mergedUnits = generatedUnits.map(gen => {
          const dbUnit = dbUnits.find(u => u.unit_number === gen.unit_number);
          return dbUnit ? dbUnit : gen;
        });

        setUnits(mergedUnits);
      } else {
        setUnits(unitsData.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateUnitsFromSettings = (settings) => {
    const generatedUnits = [];
    settings.floors.forEach((floor) => {
      for (let i = 1; i <= floor.unitsPerFloor; i++) {
        const unitName = floor.unitNamingConvention
          .replace('{floor}', floor.floorNumber)
          .replace('{unit}', i);
        generatedUnits.push({
          id: `generated-${floor.floorNumber}-${i}`,
          unit_number: unitName,
          floor: floor.floorNumber.toString(),
          area: (floor.baseArea || 100) + (i * 5),
          price: (floor.basePrice || 50000) + ((i - 1) * (floor.priceIncrement || 1000)),
          status: 'available',
          position: floor.positionLabels[i - 1] || `Position ${i}`,
          project_id: null,
          generated: true
        });
      }
    });
    return generatedUnits;
  };

  const applyFilters = () => {
    let filtered = [...units];
    if (filters.project_id) filtered = filtered.filter(u => u.project_id == filters.project_id);
    if (filters.floor) filtered = filtered.filter(u => u.floor === filters.floor);
    if (filters.status) filtered = filtered.filter(u => u.status === filters.status);
    setFilteredUnits(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ project_id: '', floor: '', status: '' });
  };

  const openSoldModal = (unitId, unitNumber) => {
    setModalData({ unitId, unitNumber });
    setForm({ buyer_name: '', sale_price: '', sold_date: '', sale_description: '' });
  };

  const closeModal = () => {
    setModalData(null);
    setForm({ buyer_name: '', sale_price: '', sold_date: '', sale_description: '' });
  };

  const openPaymentModal = (saleId, unitNumber, unitId) => {
    setPaymentModal({ saleId, unitNumber, unitId });
    
    // Find the sale details to calculate down payment
    const sale = units.find(u => u.id === unitId && u.status === 'sold');
    const downPaymentAmount = sale ? (sale.total_price || 0) - (sale.down_payment || 0) - ((sale.total_months_paid || 0) * (sale.monthly_payment || 0)) : 0;
    
    setPaymentForm({
      amount: downPaymentAmount > 0 ? downPaymentAmount.toString() : '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: ''
    });
  };

  const closePaymentModal = () => {
    setPaymentModal(null);
    setPaymentForm({
      amount: '',
      payment_date: '',
      payment_method: 'cash',
      notes: ''
    });
  };

  const handlePaymentSubmit = async () => {
    if (!paymentModal) return;

    // Validate form data
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }

    if (!paymentForm.payment_date) {
      alert('Please select a payment date.');
      return;
    }

    try {
      const paymentData = {
        payment_amount: parseFloat(paymentForm.amount),
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        notes: paymentForm.notes || '',
        months_paid: 1 // Default to 1 month paid for each payment
      };

      console.log('=== PAYMENT SUBMISSION DEBUG ===');
      console.log('Sale ID:', paymentModal.saleId);
      console.log('Unit ID:', paymentModal.unitId, '(not sent - backend will handle relationship)');
      console.log('Payment Data (with months_paid):', JSON.stringify(paymentData, null, 2));
      console.log('Payment Modal:', paymentModal);
      console.log('Payment Form:', paymentForm);
      console.log('================================');

      const response = await api.post(`/sales/${paymentModal.saleId}/payment`, paymentData);
      console.log('Payment response:', response);

      closePaymentModal();
      showSuccess('Payment recorded successfully!', 'Payment Success');
      
      // Wait a moment for database to update, then reload sale details
      setTimeout(async () => {
        try {
          // Find the unit ID from the units data using saleId
          const unit = units.find(u => u.id === paymentModal.saleId);
          const unitId = unit ? unit.id : paymentModal.unitId;
          
          console.log('Found unit for reload:', unit);
          console.log('Using unitId for reload:', unitId);
          
          const response = await api.get(`/sales/by-unit/${unitId}`);
          const saleInfo = response.data;
        
        if (saleInfo) {
          const paidAmount = (saleInfo.down_payment || 0) + (saleInfo.payments?.reduce(
            (sum, p) => sum + parseFloat(p.payment_amount || p.amount),
            0
          ) || 0);
          const remainingAmount = (saleInfo.total_price || 0) - paidAmount;

          setSaleDetailsModalData({
            sale_id: saleInfo.id,
            unit_id: saleInfo.unit_id,
            unit_number: saleInfo.unit_number,
            unit_floor: saleInfo.floor,
            unit_area: saleInfo.area,
            unit_price: saleInfo.price,
            buyer_name: saleInfo.buyer_name || '',
            buyer_phone: saleInfo.buyer_phone || '',
            buyer_email: saleInfo.buyer_email || '',
            buyer_address: saleInfo.buyer_address || '',
            buyer_national_id: saleInfo.buyer_national_id || '',
            seller_name: saleInfo.seller_name || '',
            seller_phone: saleInfo.seller_phone || '',
            seller_email: saleInfo.seller_email || '',
            seller_address: saleInfo.seller_address || '',
            sale_price: saleInfo.sale_price || '',
            total_price: saleInfo.total_price || '',
            down_payment: saleInfo.down_payment || '',
            monthly_payment: saleInfo.monthly_payment || '',
            payment_method: saleInfo.payment_method || '',
            sold_date: saleInfo.sold_date || '',
            sale_description: saleInfo.sale_description || '',
            remaining_amount: remainingAmount || 0,
            payments: saleInfo.payments || [],
            documents: saleInfo.documents || []
          });
        }
        } catch (error) {
          console.error('Error reloading sale details:', error);
        }
        
        loadData();
      }, 1000); // Wait 1 second for database to update
    } catch (error) {
      console.error('Error recording payment:', error);
      
      // More detailed error message
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 500) {
          showError('Server error occurred. Please check the server logs and try again.');
        } else if (error.response.status === 422) {
          const errorMessage = error.response.data.message || 'Validation error occurred.';
          showError(`Validation Error: ${errorMessage}`);
        } else {
          showError(`Error recording payment: ${error.response.data?.message || error.message}`);
        }
      } else if (error.request) {
        showError('Network error. Please check your connection and try again.');
      } else {
        showError(`Error recording payment: ${error.message}`);
      }
    }
  };

  const handleSoldSubmit = async () => {
    if (!modalData) return;
    
    try {
      setMarkingSold(modalData.unitId);
      
      // Use the SellUnit API endpoint instead of direct unit update
      await api.post('/sales/create', {
        unit_id: modalData.unitId,
        buyer_name: form.buyer_name,
        sale_price: parseFloat(form.sale_price),
        sold_date: form.sold_date,
        sale_description: form.sale_description,
        payment_method: 'full',
        total_price: parseFloat(form.sale_price),
        buyer_phone: '',
        buyer_email: '',
        buyer_address: '',
        buyer_national_id: ''
      });
      
      // Update local state
      setUnits(prev => prev.map(unit => 
        unit.id === modalData.unitId 
          ? { ...unit, status: 'sold', buyer_name: form.buyer_name, sale_price: parseFloat(form.sale_price), sold_date: form.sold_date }
          : unit
      ));
      
      closeModal();
      alert('Unit marked as sold successfully!');
    } catch (error) {
      console.error('Error marking unit as sold:', error);
      alert('Error marking unit as sold. Please use the Sell Unit page for complete sales processing.');
    } finally {
      setMarkingSold(null);
    }
  };

  const getUniqueFloors = () => [...new Set(units.map(u => u.floor))].sort((a, b) => Number(a) - Number(b));

  const totalAvailable = filteredUnits.filter(u => u.status === 'available').length;
  const totalSold = filteredUnits.filter(u => u.status === 'sold').length;
  const soldPercent = filteredUnits.length ? Math.round((totalSold / filteredUnits.length) * 100) : 0;
  // Calculate revenue from actual sales data
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  
  // Fetch sales data to calculate accurate revenue
  useEffect(() => {
    const calculateRevenue = async () => {
      try {
        const soldUnits = filteredUnits.filter(u => u.status === 'sold');
        let revenue = 0;
        let remaining = 0;
        
        for (const unit of soldUnits) {
          const response = await api.get(`/sales/by-unit/${unit.id}?include=payments,documents`);
          const saleInfo = response.data;
          
          if (saleInfo) {
            // Calculate actual paid amount from payments
            const downPayment = Number(saleInfo.down_payment) || 0;
            const paymentsTotal = saleInfo.payments?.reduce(
              (sum, p) => sum + Number(p.payment_amount || p.amount || 0),
              0
            ) || 0;
            const paidAmount = downPayment + paymentsTotal;
            
            revenue += paidAmount;
            
            // Calculate remaining amount
            const totalPrice = Number(saleInfo.total_price) || 0;
            const remainingAmount = totalPrice - paidAmount;
            remaining += remainingAmount;
          }
        }
        
        setTotalRevenue(revenue);
        setTotalRemaining(remaining);
      } catch (error) {
        console.error('Error calculating revenue:', error);
        // Fallback to unit data if API fails
        const fallbackRevenue = filteredUnits.filter(u => u.status === 'sold')
          .reduce((s, u) => s + Number(u.total_price || u.sale_price || u.price || 0), 0);
        setTotalRevenue(fallbackRevenue);
        setTotalRemaining(0); // Reset remaining if API fails
      }
    };
    
    calculateRevenue();
  }, [filteredUnits]);

  const hasActiveFilters = filters.project_id || filters.floor || filters.status;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
            <Building2 className="absolute inset-0 m-auto text-blue-400" size={22} />
          </div>
          <p className="text-blue-200 font-medium tracking-wide">Loading Units...</p>
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
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="header-text">
              <h1>Units</h1>
              <p>Manage your property units</p>
            </div>
          </div>
          <div className="header-actions">
          </div>
        </div>
      </div>

      {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-label">Total Units</div>
                <div className="stat-value">{filteredUnits.length}</div>
              </div>
              <div className="stat-icon">
                <Home size={18} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-label">Available</div>
                <div className="stat-value">{totalAvailable}</div>
              </div>
              <div className="stat-icon">
                <CheckCircle2 size={18} className="text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-label">Sold</div>
                <div className="stat-value">{totalSold}</div>
                <div className="stat-sub">{soldPercent}% of total</div>
              </div>
              <div className="stat-icon">
                <TrendingUp size={18} className="text-violet-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-label">Revenue</div>
                <div className="stat-value">${totalRevenue.toLocaleString()}</div>
                <div className="stat-sub">Paid Amount</div>
              </div>
              <div className="stat-icon">
                <BadgeDollarSign size={18} className="text-amber-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-label">Remaining</div>
                <div className="stat-value">${totalRemaining.toLocaleString()}</div>
                <div className="stat-sub">Unpaid Amount</div>
              </div>
              <div className="stat-icon">
                <ArrowUpRight size={18} className="text-red-400" />
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
                <button className="clear-filters">
                  <X size={12} /> Clear All
                </button>
              )}
            </div>

            <div className="filters-body">
              {/* Search Input */}
              <div>
                <label className="filter-label">Search Unit</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Type unit number, floor, or buyer name..."
                    className="modal-input"
                  />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="filter-group">
                {/* Project Filter */}
                <div>
                  <label className="filter-label">Project</label>
                  <select
                    value={filters.project_id}
                    onChange={(e) => handleFilterChange('project_id', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Projects</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Floor Filter */}
                <div>
                  <label className="filter-label">Floor</label>
                  <select
                    value={filters.floor}
                    onChange={(e) => handleFilterChange('floor', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Floors</option>
                    {getUniqueFloors().map(floor => (
                      <option key={floor} value={floor}>Floor {floor}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="filter-label">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="filters-toggles">
          <label className="toggle-item">
            <div 
              className={`toggle-switch ${groupByFloor ? 'active' : ''}`}
              onClick={() => setGroupByFloor(v => !v)}
            >
              <div className="toggle-knob" />
            </div>
            <div className="toggle-label">
              <LayoutGrid size={14} />
              <span>Group by Floor</span>
            </div>
          </label>
        </div>

        {/* Units Display */}
        <div className="units-display">
          <div className="units-card">
            <div className="units-header-bar">
              <div className="units-title">
                <BarChart3 size={14} className="text-violet-400" />
                <span>
                  Units <span className="text-slate-500 font-normal">({filteredUnits.length})</span>
                </span>
              </div>
              <div className="units-stats">
                <span className="stat-badge available">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {totalAvailable} Available
                </span>
                <span className="stat-badge sold">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block"></span>
                  {totalSold} Sold
                </span>
              </div>
            </div>
          </div>

          <div className="p-5">
            {filteredUnits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Search size={28} className="text-slate-600" />
                </div>
                <h3 className="empty-title">No units found</h3>
                <p className="empty-subtitle">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : groupByFloor ? (
              <GroupedView filteredUnits={filteredUnits} markingSold={markingSold} openSoldModal={openSoldModal} openPaymentModal={openPaymentModal} setSaleDetailsModalData={setSaleDetailsModalData} />
            ) : (
              <FlatView filteredUnits={filteredUnits} markingSold={markingSold} openSoldModal={openSoldModal} setSaleDetailsModalData={setSaleDetailsModalData} />
            )}
          </div>
        </div>
      </div>

      {/* Dialog Component */}
      <DialogComponent />

      {/* Mark as Sold Modal */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <DollarSign size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Mark as Sold</h3>
                  <p className="text-blue-300/70 text-xs">Unit: <span className="font-semibold text-blue-300">{modalData.unitNumber}</span></p>
                </div>
              </div>
              <button onClick={closeModal} className="modal-close">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="modal-body">
              {[
                { label: 'Buyer Name', key: 'buyer_name', type: 'text', placeholder: 'Enter buyer full name', icon: <User size={14} /> },
                { label: 'Sale Price ($)', key: 'sale_price', type: 'number', placeholder: 'Enter sale price', icon: <DollarSign size={14} /> },
                { label: 'Sale Date', key: 'sold_date', type: 'date', placeholder: '', icon: <Calendar size={14} /> },
                { label: 'Description (optional)', key: 'sale_description', type: 'text', placeholder: 'Add a note...', icon: <Package size={14} /> },
              ].map(({ label, key, type, placeholder, icon }) => (
                <div key={key} className="modal-field">
                  <label className="modal-label">
                    <span className="text-slate-500">{icon}</span>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="modal-input"
                  />
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                onClick={handleSoldSubmit}
                disabled={markingSold === modalData?.unitId}
                className="modal-submit"
              >
                {markingSold === modalData?.unitId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} /> Confirm Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      {saleDetailsModalData && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <Package size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Sale Details</h3>
                  <p className="text-blue-300/70 text-xs">Unit: <span className="font-semibold text-blue-300">{saleDetailsModalData.unit_number}</span></p>
                </div>
              </div>
              <button onClick={() => setSaleDetailsModalData(null)} className="modal-close-btn">
                <X size={20} className="text-white/70 hover:text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {saleDetailsModalData.error ? (
                <div className="error-message">
                  <X size={48} className="mx-auto" />
                  <p>{saleDetailsModalData.error}</p>
                </div>
              ) : (
                <div className="sale-details-grid">

                  {/* Buyer Information */}
                  <div className="sale-section">
                    <h4>
                      <User size={14} />
                      Buyer Information
                    </h4>
                    <div className="sale-grid">
                      <div className="sale-item">
                        <p>Name</p>
                        <p>{saleDetailsModalData.buyer_name}</p>
                      </div>
                      <div className="sale-item">
                        <p>Phone</p>
                        <p>{saleDetailsModalData.buyer_phone}</p>
                      </div>
                      <div className="sale-item">
                        <p>Email</p>
                        <p>{saleDetailsModalData.buyer_email || 'N/A'}</p>
                      </div>
                      <div className="sale-item">
                        <p>National ID</p>
                        <p>{saleDetailsModalData.buyer_national_id}</p>
                      </div>
                      <div className="sale-item col-span-2">
                        <p>Address</p>
                        <p>{saleDetailsModalData.buyer_address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div className="sale-section">
                    <h4>
                      <User size={14} />
                      Seller Information
                    </h4>
                    <div className="sale-grid">
                      <div className="sale-item">
                        <p>Name</p>
                        <p>{saleDetailsModalData.seller_name || 'N/A'}</p>
                      </div>
                      <div className="sale-item">
                        <p>Phone</p>
                        <p>{saleDetailsModalData.seller_phone || 'N/A'}</p>
                      </div>
                      <div className="sale-item">
                        <p>Email</p>
                        <p>{saleDetailsModalData.seller_email || 'N/A'}</p>
                      </div>
                      <div className="sale-item">
                        <p>Address</p>
                        <p>{saleDetailsModalData.seller_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sale Information */}
                  <div className="sale-section">
                    <h4>
                      <DollarSign size={14} />
                      Sale Information
                    </h4>
                    <div className="sale-grid">
                      <div className="sale-item">
                        <p>Sale Price</p>
                        <p>${saleDetailsModalData.sale_price?.toLocaleString()}</p>
                      </div>
                      <div className="sale-item">
                        <p>Total Price</p>
                        <p>${saleDetailsModalData.total_price?.toLocaleString()}</p>
                      </div>
                      <div className="sale-item">
                        <p>Down Payment</p>
                        <p>${saleDetailsModalData.down_payment?.toLocaleString()}</p>
                      </div>
                      <div className="sale-item">
                        <p>Monthly Payment</p>
                        <p>${saleDetailsModalData.monthly_payment?.toLocaleString()}</p>
                      </div>
                      <div className="sale-item">
                        <p>Payment Method</p>
                        <p className="capitalize">{saleDetailsModalData.payment_method}</p>
                      </div>
                      <div className="sale-item">
                        <p>Sale Date</p>
                        <p>{saleDetailsModalData.sold_date}</p>
                      </div>
                      <div className="sale-item col-span-2">
                        <p>Remaining Amount</p>
                        <p>${Number(saleDetailsModalData.remaining_amount || 0).toFixed(2).toLocaleString()}</p>
                      </div>
                      <div className="sale-item col-span-2">
                        <p>Description</p>
                        <p>{saleDetailsModalData.sale_description || 'No description'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="sale-section">
                    <h4>
                      <Package size={14} />
                      Documents
                    </h4>
                    <div className="sale-grid">
                      {saleDetailsModalData.documents && saleDetailsModalData.documents.length > 0 ? (
                        saleDetailsModalData.documents.map((doc, index) => (
                          <div key={index} className="sale-item col-span-2">
                            <p>{doc.category || 'Document'} {index + 1}</p>
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-blue-400" />
                              <a 
                                href={`${getBaseUrl()}/storage/${doc.file_path || doc.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:text-blue-700 underline cursor-pointer"
                                title="Click to view document"
                              >
                                {doc.original_name || doc.filename}
                              </a>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `${getBaseUrl()}/storage/${doc.file_path || doc.path}`;
                                  link.download = doc.original_name || doc.filename;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                title="Download document"
                              >
                                <Download size={12} />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {doc.file_size || doc.size ? `${(doc.file_size || doc.size) / 1024 < 1024 ? 
                                `${Math.round((doc.file_size || doc.size) / 1024 * 10) / 10} KB` : 
                                `${Math.round((doc.file_size || doc.size) / 1024 / 1024 * 10) / 10} MB`
                              }` : 'Size unknown'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="sale-item col-span-2">
                          <p>Documents</p>
                          <p className="text-gray-400">No documents uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment History Section */}
                  <div className="sale-section">
                    <h4>
                      <DollarSign size={14} />
                      Payment History
                    </h4>
                    <div className="sale-grid">
                      <div className="sale-item col-span-2">
                        <p>Total Price</p>
                        <p>${saleDetailsModalData.total_price?.toLocaleString()}</p>
                      </div>
                      <div className="sale-item col-span-2">
                        <p>Paid Amount</p>
                        <p className="text-green-400">
                          ${(
                            Number((saleDetailsModalData.down_payment || 0)) +
                            Number(saleDetailsModalData.payments?.reduce(
                              (sum, payment) =>
                                sum + Number(payment.payment_amount || payment.amount),
                              0
                            ) || 0)
                          ).toFixed(2).toLocaleString()}
                        </p>
                      </div>
                      <div className="sale-item col-span-2">
                        <p>Remaining</p>
                        <p className="text-orange-400">
                          ${(
                            Number(saleDetailsModalData.total_price || 0) -
                            (Number(saleDetailsModalData.down_payment || 0) +
                             Number(saleDetailsModalData.payments?.reduce(
                               (sum, payment) =>
                                 sum + Number(payment.payment_amount || payment.amount),
                               0
                             ) || 0))
                          ).toFixed(2).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Payment Table */}
                    <table className="payment-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {saleDetailsModalData?.payments?.length > 0 ? (
                          saleDetailsModalData.payments.map((payment, index) => (
                            <tr key={payment.id}>
                              <td>{index + 1}</td>
                              <td>${parseFloat(payment.payment_amount || payment.amount).toLocaleString()}</td>
                              <td>{payment.payment_date}</td>
                              <td>{payment.payment_method}</td>
                              <td>{payment.notes || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-gray-400">
                              No payments yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button onClick={() => setSaleDetailsModalData(null)} className="btn-secondary">
                Close
              </button>
              {!saleDetailsModalData.error && (
                <button onClick={() => {
                  setSaleDetailsModalData(null);
                  openPaymentModal(saleDetailsModalData.sale_id, saleDetailsModalData.unit_number, saleDetailsModalData.unit_id);
                }} className="btn-primary">
                  Add Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <DollarSign size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Add Payment</h3>
                  <p className="text-blue-300/70 text-xs">Unit: <span className="font-semibold text-blue-300">{paymentModal.unitNumber}</span></p>
                </div>
              </div>
              <button onClick={closePaymentModal} className="modal-close-btn">
                <X size={20} className="text-white/70 hover:text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="sale-details-grid">
                {/* Unit Information */}
                <div className="sale-section">
                  <h4>
                    <Package size={14} />
                    Unit Information
                  </h4>
                  <div className="sale-grid">
                    <div className="sale-item">
                      <p>Unit Number</p>
                      <p>{paymentModal.unitNumber}</p>
                    </div>
                    <div className="sale-item">
                      <p>Status</p>
                      <p className="text-green-400">Sold</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="sale-section">
                  <h4>
                    <DollarSign size={14} />
                    Payment Information
                  </h4>
                  <div className="sale-grid">
                    <div className="sale-item col-span-2">
                      <p>Payment Amount <span className="text-red-500">*</span></p>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Enter payment amount"
                        className="modal-input"
                        required
                      />
                    </div>
                    <div className="sale-item col-span-2">
                      <p>Payment Date <span className="text-red-500">*</span></p>
                      <input
                        type="date"
                        value={paymentForm.payment_date}
                        onChange={e => setPaymentForm(prev => ({ ...prev, payment_date: e.target.value }))}
                        className="modal-input"
                        required
                      />
                    </div>
                    <div className="sale-item col-span-2">
                      <p>Payment Method <span className="text-red-500">*</span></p>
                      <select
                        value={paymentForm.payment_method}
                        onChange={e => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="modal-input"
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>
                    <div className="sale-item col-span-2">
                      <p>Notes</p>
                      <textarea
                        value={paymentForm.notes}
                        onChange={e => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add a note about this payment..."
                        className="modal-textarea"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button onClick={closePaymentModal} className="btn-secondary">
                Close
              </button>
              <button onClick={handlePaymentSubmit} className="btn-primary">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grouped by Floor ──────────────────────────────────────────────────────────
function GroupedView({
  filteredUnits,
  markingSold,
  openSoldModal,
  openPaymentModal,
  setSaleDetailsModalData
}) {
  const grouped = filteredUnits.reduce((acc, unit) => {
    if (!acc[unit.floor]) acc[unit.floor] = [];
    acc[unit.floor].push(unit);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([floor, floorUnits]) => (
          <div key={floor}>
            {/* Floor Header */}
            <div className="floor-header">
              <div className="flex items-center gap-3">
                <div className="floor-info">
                  <Building2 size={15} className="text-blue-400" />
                  <span className="floor-number">Floor {floor}</span>
                  <span className="floor-count">{floorUnits.length} units</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                <div className="floor-stats">
                  <span className="available">{floorUnits.filter(u => u.status === 'available').length} avail.</span>
                  <span>·</span>
                  <span className="sold">{floorUnits.filter(u => u.status === 'sold').length} sold</span>
                </div>
              </div>
            </div>

            {/* Units Grid */}
            <div className="units-grid">
              {floorUnits.map(unit => (
                <UnitCard key={unit.id} unit={unit} markingSold={markingSold} openSoldModal={openSoldModal} openPaymentModal={openPaymentModal} setSaleDetailsModalData={setSaleDetailsModalData} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

// ── Unit Card Component ──────────────────────────────────────────────────────────
function UnitCard({ unit, markingSold, openSoldModal, openPaymentModal, setSaleDetailsModalData }) {
  const isSold = unit.status === 'sold';

  const handleUnitClick = async () => {
    if (isSold) {
      // Show detailed sale information modal
      try {
        const response = await api.get(`/sales/by-unit/${unit.id}?include=payments,documents`);
        const saleInfo = response.data;

        if (saleInfo) {
          const paidAmount = (saleInfo.down_payment || 0) + (saleInfo.payments?.reduce(
            (sum, p) => sum + parseFloat(p.payment_amount || p.amount),
            0
          ) || 0);
          const remainingAmount = (saleInfo.total_price || 0) - paidAmount;

          setSaleDetailsModalData({
            sale_id: saleInfo.id,
            unit_id: unit.id,
            unit_number: unit.unit_number,
            unit_floor: unit.floor,
            unit_area: unit.area,
            unit_price: unit.price,
            buyer_name: saleInfo.buyer_name || '',
            buyer_phone: saleInfo.buyer_phone || '',
            buyer_email: saleInfo.buyer_email || '',
            buyer_address: saleInfo.buyer_address || '',
            buyer_national_id: saleInfo.buyer_national_id || '',
            seller_name: saleInfo.seller_name || '',
            seller_phone: saleInfo.seller_phone || '',
            seller_email: saleInfo.seller_email || '',
            seller_address: saleInfo.seller_address || '',
            sale_price: saleInfo.sale_price || '',
            total_price: saleInfo.total_price || '',
            down_payment: saleInfo.down_payment || '',
            monthly_payment: saleInfo.monthly_payment || '',
            payment_method: saleInfo.payment_method || '',
            sold_date: saleInfo.sold_date || '',
            sale_description: saleInfo.sale_description || '',
            remaining_amount: remainingAmount || 0,
              payments: saleInfo.payments || [],
              documents: saleInfo.documents || []
          });
        } else {
          setSaleDetailsModalData({
            error: 'No sale information found for this unit.'
            
          });
        }
      } catch (error) {
        console.error('Error fetching sale details:', error);
        setSaleDetailsModalData({
          error: 'Error loading sale details. Please try again.'
        });
      }
    } else {
      openSoldModal(unit.id, unit.unit_number);
    }
  };

  return (
    <div className={`unit-card ${isSold ? 'sold' : 'available'}`}>
      <div className="unit-card-content">
        {/* Unit Header */}
        <div className="unit-header">
          <div className="unit-info">
            <div className={`unit-icon ${isSold ? 'sold' : 'available'}`}>
              <Home size={18} className={isSold ? 'text-violet-400' : 'text-emerald-400'} />
            </div>
            <div>
              <h4 className="unit-number">{unit.unit_number}</h4>
              {unit.position && <p className="unit-position">{unit.position}</p>}
            </div>
          </div>
          <span className={`status-badge ${isSold ? 'sold' : 'available'}`}>
            {isSold ? <><Clock size={10} /> SOLD</> : <><CheckCircle2 size={10} /> Available</>}
          </span>
        </div>

        {/* Unit Details */}
        <div className="unit-details">
          <div className="detail-item">
            <div className="detail-label">Area</div>
            <div className="detail-value">{unit.area} m²</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Price</div>
            <div className="detail-value">${unit.price?.toLocaleString()}</div>
          </div>
        </div>

        {/* Sold Info */}
        {isSold && (
          <div className="sold-info">
            {unit.buyer_name && (
              <div className="sold-info-row">
                <User size={12} className="text-slate-500 shrink-0" />
                <span className="text-slate-300 text-xs truncate">{unit.buyer_name}</span>
              </div>
            )}
            {unit.sold_date && (
              <div className="sold-info-row">
                <Calendar size={12} className="text-slate-500 shrink-0" />
                <span className="text-slate-300 text-xs">{new Date(unit.sold_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            )}
            {unit.sale_price && (
              <div className="sold-info-row">
                <DollarSign size={12} className="text-slate-500 shrink-0" />
                <span className="text-emerald-400 text-xs font-semibold">${unit.sale_price?.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Unit Actions */}
        <div className="unit-card-footer">
          {isSold ? (
            <div className="flex gap-2">
              <button
                onClick={handleUnitClick}
                className="btn-secondary flex-1"
              >
                <User size={14} />
                View Details
              </button>
              <button
                onClick={() => openPaymentModal(unit.id, unit.unit_number)}
                className="btn-primary flex-1"
              >
                <DollarSign size={14} />
                Add Payment
              </button>
            </div>
          
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Flat List View ─────────────────────────────────────────────────────────────
function FlatView({ filteredUnits, markingSold, openSoldModal, setSaleDetailsModalData }) {
  const handleUnitClick = async (unit) => {
    if (unit.status === 'sold') {
      try {
        const response = await api.get(`/sales/by-unit/${unit.id}?include=payments,documents`);
        const saleInfo = response.data;

        console.log('=== FLAT VIEW SALE INFO DEBUG ===');
        console.log('Sale Info:', saleInfo);
        console.log('Documents:', saleInfo.documents);
        console.log('Payments:', saleInfo.payments);
        console.log('=================================');

        // Check database directly for documents
        try {
          const docsResponse = await api.get(`/sales/${saleInfo.id}/documents`);
          console.log('=== DIRECT DOCUMENTS CHECK ===');
          console.log('Direct Docs Response:', docsResponse.data);
          console.log('Documents Count:', docsResponse.data?.length || 0);
          console.log('===============================');
          
          // Use direct documents if available
          if (docsResponse.data && docsResponse.data.length > 0) {
            saleInfo.documents = docsResponse.data;
          }
        } catch (docError) {
          console.log('Error fetching documents directly:', docError);
        }

        if (saleInfo) {
          const paidAmount = (saleInfo.down_payment || 0) + (saleInfo.payments?.reduce(
            (sum, p) => sum + parseFloat(p.payment_amount || p.amount),
            0
          ) || 0);
          const remainingAmount = (saleInfo.total_price || 0) - paidAmount;

          setSaleDetailsModalData({
            sale_id: saleInfo.id,
            unit_id: unit.id,
            unit_number: unit.unit_number,
            unit_floor: unit.floor,
            unit_area: unit.area,
            unit_price: unit.price,
            buyer_name: saleInfo.buyer_name || '',
            buyer_phone: saleInfo.buyer_phone || '',
            buyer_email: saleInfo.buyer_email || '',
            buyer_address: saleInfo.buyer_address || '',
            buyer_national_id: saleInfo.buyer_national_id || '',
            seller_name: saleInfo.seller_name || '',
            seller_phone: saleInfo.seller_phone || '',
            seller_email: saleInfo.seller_email || '',
            seller_address: saleInfo.seller_address || '',
            sale_price: saleInfo.sale_price || '',
            total_price: saleInfo.total_price || '',
            down_payment: saleInfo.down_payment || '',
            monthly_payment: saleInfo.monthly_payment || '',
            payment_method: saleInfo.payment_method || '',
            sold_date: saleInfo.sold_date || '',
            sale_description: saleInfo.sale_description || '',
            remaining_amount: remainingAmount || 0,
            payments: saleInfo.payments || [],
            documents: saleInfo.documents || []
          });
          
          console.log('=== SALE DETAILS MODAL DATA DEBUG ===');
          console.log('Modal Data:', saleDetailsModalData);
          console.log('Modal Documents:', saleDetailsModalData.documents);
          console.log('====================================');
        } else {
          setSaleDetailsModalData({
            error: 'No sale information found for this unit.'
          });
        }
      } catch (error) {
        console.error('Error fetching sale details:', error);
        setSaleDetailsModalData({
          error: 'Error loading sale details. Please try again.'
        });
      }
    } else {
      openSoldModal(unit.id, unit.unit_number);
    }
  };

  return (
    <div className="units-table-container">
      <table className="units-table">
        <thead>
          <tr className="table-header">
            {['Unit', 'Floor', 'Area', 'Price', 'Status', 'Project'].map(h => (
              <th key={h} className="table-header-cell">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {filteredUnits.map(unit => {
            const isSold = unit.status === 'sold';
            return (
              <tr 
                key={unit.id} 
                className={`table-row ${isSold ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => isSold && handleUnitClick(unit)}
              >
                <td className="table-cell">
                  <div className="unit-cell">
                    <div className={`unit-icon-small ${isSold ? 'sold' : 'available'}`}>
                      <Package size={13} className={isSold ? 'text-violet-400' : 'text-emerald-400'} />
                    </div>
                    <span className="unit-name">{unit.unit_number}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className="floor-badge">{unit.floor}</span>
                </td>
                <td className="table-cell">{unit.area} m²</td>
                <td className="table-cell price-cell">${unit.price?.toLocaleString()}</td>
                <td className="table-cell">
                  <span className={`status-badge ${isSold ? 'sold' : 'available'}`}>
                    {isSold ? <Clock size={9} /> : <CheckCircle2 size={9} />}
                    {isSold ? 'Sold' : 'Available'}
                  </span>
                </td>
                <td className="table-cell">{unit.project?.name || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

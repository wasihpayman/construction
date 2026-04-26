import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/SellUnit.css";
import "../styles/Modal.css";
import {
  ShoppingCart, DollarSign, Package, User, Calendar, FileText, MapPin, Building2, Upload, CreditCard, File, X, Plus, Minus, Filter, AlertCircle, CheckCircle, ChevronDown, Search
} from "lucide-react";
import DialogBox, { useDialog } from "../components/DialogBox";

export default function SellUnit() {
  const [units, setUnits] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [soldUnitWarning, setSoldUnitWarning] = useState('');
  const [useSettingsBased, setUseSettingsBased] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    project_id: '',
    floor: '',
    status: ''
  });
  
  // Form data for comprehensive sale
  const [formData, setFormData] = useState({
    // Buyer Information
    buyer_name: '',
    buyer_phone: '',
    buyer_email: '',
    buyer_address: '',
    buyer_national_id: '',
    
    // Seller Information
    seller_name: '',
    seller_phone: '',
    seller_email: '',
    seller_address: '',
    
    // Sale Information
    sale_price: '',
    total_price: '',
    sold_date: new Date().toISOString().split('T')[0],
    sale_description: '',
    
    // Payment Information
    payment_method: 'full', // full, monthly
    down_payment: '',
    monthly_payment: '',
    number_of_months: '12',
    total_months_paid: '0',
    
    // Documents
    documents: {
      national_id: [],
      contract: [],
      payment_proof: [],
      other_documents: []
    }
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Dialog hook
  const { showSuccess, showError, DialogComponent } = useDialog();

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    loadData();
  }, [useSettingsBased]);

  useEffect(() => {
    applyFilters();
  }, [allUnits, filters]);

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

        setAllUnits(mergedUnits);
        setUnits(mergedUnits);
      } else {
        setAllUnits(unitsData.data || []);
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
          id: `generated-${floor.floorNumber}-${i}-${Date.now()}`,
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
    let filtered = [...allUnits];
    
    // Project filter
    if (filters.project_id) {
      filtered = filtered.filter(u => u.project_id == filters.project_id);
    }
    
    // Floor filter
    if (filters.floor) {
      filtered = filtered.filter(u => u.floor === filters.floor);
    }
    
    // Status filter
    if (filters.status) {
      filtered = filtered.filter(u => u.status === filters.status);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(u => {
        const unitNumber = u.unit_number?.toLowerCase() || '';
        const floor = u.floor?.toString() || '';
        const buyerName = u.buyer_name?.toLowerCase() || '';
        
        return unitNumber.includes(searchLower) ||
               floor.includes(searchLower) ||
               buyerName.includes(searchLower);
      });
    }
    
    setUnits(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', project_id: '', floor: '', status: '' });
  };

  const getUniqueFloors = () => {
    const floors = [...new Set(allUnits.map(u => u.floor))].sort((a, b) => Number(a) - Number(b));
    return floors;
  };

  const hasActiveFilters = filters.search || filters.project_id || filters.floor || filters.status;

  const totalAvailable = units.filter(u => u.status === 'available').length;
  const totalSold = units.filter(u => u.status === 'sold').length;

  const handleUnitSelect = async (unit) => {
    // For database units, check current status from server
    if (unit.id && !unit.generated) {
      try {
        const response = await api.get(`/units/${unit.id}`);
        const currentUnit = response.data;
        
        if (currentUnit.status === 'sold') {
          setSoldUnitWarning(`This unit (${currentUnit.unit_number}) is already sold to ${currentUnit.buyer_name || 'a buyer'} on ${currentUnit.sold_date || 'N/A'}. Please select an available unit.`);
          // Reload units to reflect current status
          loadData();
          return;
        }
      } catch (error) {
        console.error('Error checking unit status:', error);
      }
    }
    
    // Check if unit is already sold (for generated units)
    if (unit.status === 'sold') {
      setSoldUnitWarning(`This unit (${unit.unit_number}) is already sold to ${unit.buyer_name || 'a buyer'} on ${unit.sold_date || 'N/A'}. Please select an available unit.`);
      return;
    }
    
    setSoldUnitWarning('');
    setSelectedUnit(unit);
    setFormData(prev => ({
      ...prev,
      sale_price: unit.price.toString(),
      total_price: unit.price.toString()
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate payment details
      if (field === 'payment_method') {
        if (value === 'full') {
          newData.down_payment = newData.total_price;
          newData.monthly_payment = '0';
          newData.number_of_months = '1';
          newData.total_months_paid = '0';
        }
      }

      // Calculate monthly payment when down payment or number of months changes
      if ((field === 'down_payment' || field === 'number_of_months') && newData.payment_method === 'monthly') {
        const totalPrice = parseFloat(newData.total_price) || 0;
        const downPayment = parseFloat(field === 'down_payment' ? value : newData.down_payment) || 0;
        const months = parseInt(field === 'number_of_months' ? value : newData.number_of_months) || 1;
        
        if (totalPrice > downPayment && months > 0) {
          const remaining = totalPrice - downPayment;
          const monthlyPayment = remaining / months;
          newData.monthly_payment = monthlyPayment.toFixed(2);
        }
      }

      return newData;
    });
  };

  const handleFileUpload = async (category, files) => {
    const fileArray = Array.from(files);
    const newFiles = [...(uploadedFiles[category] || []), ...fileArray];
    
    setUploadedFiles(prev => ({
      ...prev,
      [category]: newFiles
    }));

    // Update form data
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [category]: newFiles
      }
    }));
  };

  const removeFile = (category, index) => {
    const newFiles = uploadedFiles[category].filter((_, i) => i !== index);
    
    setUploadedFiles(prev => ({
      ...prev,
      [category]: newFiles
    }));

    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [category]: newFiles
      }
    }));
  };

  const validateForm = () => {
    const required = ['buyer_name', 'buyer_phone', 'buyer_address', 'buyer_national_id', 
                     'sale_price', 'sold_date'];
    
    for (const field of required) {
      if (!formData[field]) {
        alert(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Validate documents
    if (!uploadedFiles.national_id || uploadedFiles.national_id.length === 0) {
      alert('Please upload buyer national ID');
      return false;
    }

    // Validate payment
    if (formData.payment_method === 'monthly') {
      if (!formData.down_payment || !formData.monthly_payment || !formData.number_of_months) {
        alert('Please fill in all payment details for monthly payment');
        return false;
      }
    }

    return true;
  };

  const saveGeneratedUnit = async (unit) => {
    try {
      console.log('Saving generated unit:', unit);
      
      const unitData = {
        unit_number: unit.unit_number,
        floor: parseInt(unit.floor),
        area: unit.area,
        price: unit.price,
        position: unit.position,
        project_id: unit.project_id
      };
      
      console.log('Sending unit data:', unitData);
      
      const response = await api.post('/units/store-generated', unitData);
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        return response.data.unit;
      }
      throw new Error('Failed to save generated unit');
    } catch (error) {
      console.error('Error saving generated unit:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUnit) {
      alert("Please select a unit to sell");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      let unitToUse = selectedUnit;
      
            
      // If this is a generated unit, save it to database first
      const isGeneratedUnit = selectedUnit.generated || 
                           (typeof selectedUnit.id === 'string' && selectedUnit.id.startsWith('generated-')) ||
                           (!selectedUnit.id && selectedUnit.project_id === null);
      
            
      if (isGeneratedUnit) {
        try {
          unitToUse = await saveGeneratedUnit(selectedUnit);
          // Update the selected unit with the real database unit
          setSelectedUnit(unitToUse);
          // Reload units to reflect the new database unit
          loadData();
        } catch (error) {
          alert('Error saving generated unit to database. Please try again.');
          return;
        }
      }
      
      // Create FormData for file uploads
      const submitData = new FormData();
      
      console.log('=== DOCUMENT SUBMISSION DEBUG ===');
      console.log('Form Data:', formData);
      console.log('Uploaded Files:', uploadedFiles);
      console.log('Documents in Form:', formData.documents);
      
      // Add all form fields except unit_id (will be added separately)
      Object.keys(formData).forEach(key => {
        if (key === 'documents') {
          console.log('Processing documents...');
          Object.keys(formData.documents).forEach(docCategory => {
            console.log(`Category: ${docCategory}, Files:`, formData.documents[docCategory]);
            formData.documents[docCategory].forEach((file, index) => {
              console.log(`Adding file ${index}:`, file.name, file.size);
              submitData.append(`documents.${docCategory}[]`, file);
            });
          });
        } else if (key !== 'unit_id') {
          submitData.append(key, formData[key]);
        }
      });
      
      console.log('FormData entries:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('===================================');
      
      // Add the correct unit_id after potentially saving generated unit
      submitData.append('unit_id', unitToUse.id);
      // Always send project_id, even if null (backend will handle it)
      submitData.append('project_id', unitToUse.project_id || '');

      await api.post("/sales/create", submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success dialog
      showSuccess(
        `Unit ${selectedUnit.unit_number} sold successfully to ${formData.buyer_name}!`,
        'Sale Successful!'
      );
      
      // Reload units to show updated status
      loadData();
      
      // Reset form
      setFormData({
        buyer_name: '',
        buyer_phone: '',
        buyer_email: '',
        buyer_address: '',
        buyer_national_id: '',
        seller_name: '',
        seller_phone: '',
        seller_email: '',
        seller_address: '',
        sale_price: '',
        total_price: '',
        sold_date: new Date().toISOString().split('T')[0],
        sale_description: '',
        payment_method: 'full',
        down_payment: '',
        monthly_payment: '',
        number_of_months: '12',
        total_months_paid: '0',
        documents: {
          national_id: [],
          contract: [],
          payment_proof: [],
          other_documents: []
        }
      });
      
      setUploadedFiles({});
      setSelectedUnit(null);
      
      // Reload all units
      loadData();
      
    } catch (error) {
      console.error("Error selling unit:", error);
      showError("Error selling unit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading available units...</div>
      </div>
    );
  }

  return (
    <div className="sell-unit-container">
      <div className="sell-header">
        <h1>
          <ShoppingCart size={24} />
          Sell Unit
        </h1>
      </div>
  
      <div className="sell-grid">
          {/* ستون اول - انتخاب واحد */}
          <div className="sell-card">
            <div className="card-header">
              <Package size={20} />
              <h2>Select Unit to Sell</h2>
            </div>
            <div className="card-body">
              {/* Sold Unit Warning */}
              {soldUnitWarning && (
                <div className="warning-alert">
                  <AlertCircle size={20} />
                  <div>
                    <div className="warning-title">Unit Already Sold</div>
                    <div className="warning-message">{soldUnitWarning}</div>
                  </div>
                </div>
              )}
              
              {/* Filters Section */}
              <div className="filters-section">
                <div className="filters-header">
                  <div className="filters-title">
                    <Filter size={14} />
                    <span>Filters & Display</span>
                    {hasActiveFilters && <span className="filter-badge">Active</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="clear-btn" onClick={() => loadData()} title="Refresh units">
                      ↻ Refresh
                    </button>
                    {hasActiveFilters && (
                      <button className="clear-btn" onClick={clearFilters}>
                        <X size={12} />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Search Input */}
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={14} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Type unit number, floor, or buyer name..."
                    className="search-input"
                  />
                </div>

                {/* Filter Group */}
                <div className="filter-group">
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

              {/* Units List */}
              <div className="units-list">
                {units.length === 0 ? (
                  <div className="empty-state">
                    <Package size={32} />
                    <p>No units found matching your filters.</p>
                  </div>
                ) : (
                  units.map(unit => (
                    <div
                      key={unit.id}
                      onClick={() => handleUnitSelect(unit)}
                      className={`unit-item ${unit.status === 'sold' ? 'sold' : ''} ${selectedUnit?.id === unit.id ? 'selected' : ''}`}
                    >
                      <div className="unit-header-row">
                        <div className="unit-title">
                          {unit.unit_number}
                          <span className={`status-badge ${unit.status === 'sold' ? 'sold' : 'available'}`}>
                            {unit.status === 'sold' ? 'Sold' : 'Available'}
                          </span>
                        </div>
                        <div className="unit-price">${unit.price?.toLocaleString()}</div>
                      </div>
                      
                      <div className="unit-details-row">
                        <Building2 size={14} />
                        <span>Floor {unit.floor}</span>
                        <span>•</span>
                        <span>{unit.area}m²</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

          {/* ستون دوم - فرم فروش */}
    <div className="sell-card">
      <div className="card-header">
        <DollarSign size={20} />
        <h2>Sale Information</h2>
      </div>
      <div className="card-body">
        {selectedUnit && (
          <div className="selected-unit-info">
            <div className="selected-unit-title">Selected Unit</div>
            <div className="selected-unit-details">
              <div className="selected-detail">
                <span className="selected-detail-label">Unit:</span>
                <span className="selected-detail-value">{selectedUnit.unit_number}</span>
              </div>
              <div className="selected-detail">
                <span className="selected-detail-label">Floor:</span>
                <span className="selected-detail-value">{selectedUnit.floor}</span>
              </div>
              <div className="selected-detail">
                <span className="selected-detail-label">Area:</span>
                <span className="selected-detail-value">{selectedUnit.area}m²</span>
              </div>
              <div className="selected-detail">
                <span className="selected-detail-label">Price:</span>
                <span className="selected-detail-value">${selectedUnit.price}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
              {/* Buyer Information */}
          <div className="form-section">
            <div className="form-section-title">
              <User size={16} />
              Buyer Information
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Buyer Name *</label>
                <input
                  type="text"
                  value={formData.buyer_name}
                  onChange={(e) => handleInputChange('buyer_name', e.target.value)}
                  className="form-input"
                  placeholder="Enter buyer full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.buyer_phone}
                  onChange={(e) => handleInputChange('buyer_phone', e.target.value)}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={formData.buyer_email}
                  onChange={(e) => handleInputChange('buyer_email', e.target.value)}
                  className="form-input"
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label className="form-label">National ID</label>
                <input
                  type="text"
                  value={formData.buyer_national_id}
                  onChange={(e) => handleInputChange('buyer_national_id', e.target.value)}
                  className="form-input"
                  placeholder="Enter national ID"
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  value={formData.buyer_address}
                  onChange={(e) => handleInputChange('buyer_address', e.target.value)}
                  className="form-input"
                  placeholder="Enter buyer address"
                />
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="form-section">
            <div className="form-section-title">
              <User size={16} />
              Seller Information
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Seller Name</label>
                <input
                  type="text"
                  value={formData.seller_name}
                  onChange={(e) => handleInputChange('seller_name', e.target.value)}
                  className="form-input"
                  placeholder="Enter seller full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.seller_phone}
                  onChange={(e) => handleInputChange('seller_phone', e.target.value)}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={formData.seller_email}
                  onChange={(e) => handleInputChange('seller_email', e.target.value)}
                  className="form-input"
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  value={formData.seller_address}
                  onChange={(e) => handleInputChange('seller_address', e.target.value)}
                  className="form-input"
                  placeholder="Enter seller address"
                />
              </div>
            </div>
          </div>

          {/* Sale Information */}
          <div className="form-section">
            <div className="form-section-title">
              <DollarSign size={16} />
              Sale Information
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Sale Price *</label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={(e) => handleInputChange('sale_price', e.target.value)}
                  className="form-input"
                  placeholder="Enter sale price"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Price *</label>
                <input
                  type="number"
                  name="total_price"
                  value={formData.total_price}
                  onChange={(e) => handleInputChange('total_price', e.target.value)}
                  className="form-input"
                  placeholder="Enter total price"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sale Date *</label>
                <input
                  type="date"
                  name="sold_date"
                  value={formData.sold_date}
                  onChange={(e) => handleInputChange('sold_date', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                  name="sale_description"
                  value={formData.sale_description}
                  onChange={(e) => handleInputChange('sale_description', e.target.value)}
                  className="form-textarea"
                  placeholder="Enter sale description"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <div className="form-section-title">
              <CreditCard size={16} />
              Payment Method
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
                className="form-select"
                required
              >
                <option value="full">Full Payment</option>
                <option value="monthly">Monthly Installments</option>
              </select>
            </div>
            
            {formData.payment_method === 'monthly' && (
              <div className="payment-box">
                <div className="payment-grid">
                  <div className="form-group">
                    <label className="form-label">Down Payment</label>
                    <input
                      type="number"
                      name="down_payment"
                      value={formData.down_payment}
                      onChange={(e) => handleInputChange('down_payment', e.target.value)}
                      className="form-input"
                      placeholder="Enter down payment"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Months</label>
                    <input
                      type="number"
                      name="number_of_months"
                      value={formData.number_of_months}
                      onChange={(e) => handleInputChange('number_of_months', e.target.value)}
                      className="form-input"
                      placeholder="Enter number of months"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Payment</label>
                    <input
                      type="number"
                      name="monthly_payment"
                      value={formData.monthly_payment}
                      onChange={(e) => handleInputChange('monthly_payment', e.target.value)}
                      className="form-input"
                      placeholder="Calculated automatically"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

              {/* Document Upload */}
          <div className="form-section">
            <div className="form-section-title">
              <FileText size={16} />
              Documents
            </div>
            <div className="space-y-4">
              {['national_id', 'contract', 'payment_proof', 'other_documents'].map(category => (
                <div key={category}>
                  <label className="form-label">{category.replace('_', ' ').toUpperCase()}</label>
                  <div className="upload-area">
                    <Upload className="upload-icon" size={24} />
                    <div className="upload-text">Drop files here or click to browse</div>
                    <div className="upload-subtext">PDF, JPG, PNG up to 20MB</div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(category, e.target.files)}
                      className="upload-input"
                    />
                  </div>
                  {uploadedFiles[category]?.length > 0 && (
                    <div className="file-list">
                      {uploadedFiles[category].map((file, index) => (
                        <div key={index} className="file-item">
                          <div className="file-info">
                            <File size={16} />
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(category, index)}
                            className="remove-file"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="btn-group">
            <button
              type="submit"
              disabled={submitting}
              className="btn-submit"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle size={16} className="mr-2" />
                  Complete Sale
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  buyer_name: '',
                  buyer_phone: '',
                  buyer_email: '',
                  buyer_address: '',
                  buyer_national_id: '',
                  seller_name: '',
                  seller_phone: '',
                  seller_email: '',
                  seller_address: '',
                  sale_price: '',
                  total_price: '',
                  sold_date: new Date().toISOString().split('T')[0],
                  sale_description: '',
                  payment_method: 'full',
                  down_payment: '',
                  monthly_payment: '',
                  number_of_months: '12',
                  total_months_paid: '0',
                  documents: {
                    national_id: [],
                    contract: [],
                    payment_proof: [],
                    other_documents: []
                  }
                });
                setUploadedFiles({});
                setSelectedUnit(null);
              }}
              className="btn-clear"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>

      {/* Dialog Component */}
      <DialogComponent />
      </div>
  );
}

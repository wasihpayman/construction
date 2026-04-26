import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function CategoryDynamicForm({ categoryId }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [showAddField, setShowAddField] = useState(false);

  useEffect(() => {
    fetchFormSchema();
    loadHistory();
  }, [categoryId]);

  const loadHistory = async () => {
    try {
      const response = await api.get(`/categories/${categoryId}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  const addField = () => {
    const newField = {
      id: Date.now(), // unique ID for React key
      label: "",
      type: "text",
      name: "",
      value: "", // Add value for actual input handling
      required: false,
      system: false // Mark as custom field
    };
    setCustomFields([...customFields, newField]);
    setShowAddField(false);
  };

  const updateCustomField = (index, property, value) => {
    const updatedFields = [...customFields];
    updatedFields[index] = { ...updatedFields[index], [property]: value };
    
    // If updating label, also update the name
    if (property === 'label') {
      updatedFields[index].name = generateFieldName(value);
    }
    
    setCustomFields(updatedFields);
    
    // Also update formValues for actual form submission
    if (property === 'value' && updatedFields[index].name) {
      setFormValues(prev => ({
        ...prev,
        [updatedFields[index].name]: value
      }));
    }
  };

  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const generateFieldName = (label) => {
    return label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  const handleUpdatePaymentStatus = async (entryId, newStatus) => {
    try {
      // Find the entry in history
      const entry = history.find(h => h.id === entryId);
      if (!entry) {
        alert('Entry not found');
        return;
      }

      // Update the payment status in the data
      const updatedData = {
        ...entry.data,
        payment_status: newStatus
      };

      // Call API to update the entry
      await api.put(`/category-entries/${entryId}`, {
        data: updatedData
      });

      alert('Payment status updated successfully!');
      loadHistory(); // Reload history to show updated data
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Error updating payment status: ' + (err.response?.data?.message || err.message));
    }
  };

  const saveCustomFieldsToSchema = async () => {
    try {
      // Prepare custom fields for schema
      const customFieldsSchema = customFields
        .filter(field => field.label && field.name) // Only save fields with label and name
        .map(field => ({
          name: field.name,
          type: field.type,
          label: field.label,
          required: field.required,
          system: false // Mark as custom field
        }));

      // Get current form data
      const currentForm = await api.get(`/categories/${categoryId}/form`);
      const currentSchema = currentForm.data.schema || { fields: [] };
      
      // Combine system fields and custom fields
      const updatedSchema = {
        fields: [
          ...currentSchema.fields.filter(field => field.system !== false), // Keep system fields
          ...customFieldsSchema // Add custom fields
        ]
      };

      // Update form schema
      await api.put(`/categories/${categoryId}/form`, {
        schema: updatedSchema
      });

      alert('Custom fields saved successfully!');
    } catch (err) {
      console.error('Error saving custom fields:', err);
      alert('Error saving custom fields: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchFormSchema = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${categoryId}/form`);
      setFormData(response.data);
      
      // Initialize form values with empty strings
      const initialValues = {};
      if (response.data.schema && response.data.schema.fields) {
        response.data.schema.fields.forEach(field => {
          initialValues[field.name] = field.default || "";
        });
      }
      setFormValues(initialValues);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const systemFields = formData.schema.fields;
    const allFields = [...systemFields, ...customFields];

    allFields.forEach(field => {
      const value = formValues[field.name];

      // Check required fields
      if (field.required && (!value || value === "")) {
        errors[field.name] = `${field.label || field.name} is required`;
        return;
      }

      // Skip validation if field is not provided and not required
      if (!value || value === "") {
        return;
      }

      // Type-specific validation
      switch (field.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors[field.name] = `${field.label || field.name} must be a number`;
          }
          if (field.min !== undefined && Number(value) < field.min) {
            errors[field.name] = `${field.label || field.name} must be at least ${field.min}`;
          }
          if (field.max !== undefined && Number(value) > field.max) {
            errors[field.name] = `${field.label || field.name} must not exceed ${field.max}`;
          }
          break;

        case 'text':
          if (field.min_length && String(value).length < field.min_length) {
            errors[field.name] = `${field.label || field.name} must be at least ${field.min_length} characters`;
          }
          if (field.max_length && String(value).length > field.max_length) {
            errors[field.name] = `${field.label || field.name} must not exceed ${field.max_length} characters`;
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field.name] = `${field.label || field.name} must be a valid email`;
          }
          break;

        case 'select':
          if (field.options && !field.options.some(opt => opt.value === value)) {
            errors[field.name] = `${field.label || field.name} must be a valid option`;
          }
          break;

        case 'currency':
          const validCurrencies = ['USD', 'AFN'];
          if (!validCurrencies.includes(value)) {
            errors[field.name] = `${field.label || field.name} must be USD or AFN`;
          }
          break;

        case 'payment_status':
          const validPaymentStatuses = ['paid', 'pending'];
          if (!validPaymentStatuses.includes(value)) {
            errors[field.name] = `${field.label || field.name} must be Paid Amount or Pending`;
          }
          break;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // Merge system fields and custom fields values for submission
      const submissionData = { ...formValues };
      
      // Add custom fields values to submission data
      customFields.forEach(field => {
        if (field.name && field.value) {
          submissionData[field.name] = field.value;
        }
      });
      
      await api.post(`/categories/${categoryId}/entries`, {
        data: submissionData
      });
      
      alert('Entry submitted successfully!');
      setFormValues({});
      setValidationErrors({});
      
      // Keep custom fields structure but clear values for next entry
      // Custom fields remain available for multiple submissions
      setCustomFields(customFields.map(field => ({ ...field, value: "" })));
      
      loadHistory(); // Reload history after submission
    } catch (err) {
      console.error('Error submitting form:', err);
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else {
        alert('Error submitting form: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = formValues[field.name] || "";
    const error = validationErrors[field.name];

    const commonProps = {
      style: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: error ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        padding: "0.875rem 1rem",
        color: "#ffffff",
        fontSize: "0.875rem",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        outline: "none",
        width: "100%"
      },
      placeholder: field.placeholder || "",
      required: field.required || false,
      onFocus: (e) => {
        if (!error) {
          e.target.style.background = "rgba(255, 255, 255, 0.08)";
          e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
        }
      },
      onBlur: (e) => {
        if (!error) {
          e.target.style.background = "rgba(255, 255, 255, 0.05)";
          e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
          e.target.style.boxShadow = "none";
        }
      }
    };

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            {...commonProps}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            step={field.step || "any"}
            min={field.min}
            max={field.max}
            {...commonProps}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            {...commonProps}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={field.rows || 4}
            {...commonProps}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            {...commonProps}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
            className={`w-5 h-5 text-blue-600 border rounded focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className={`w-5 h-5 text-blue-600 border rounded focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            {...commonProps}
          />
        );

      case "file":
        return (
          <input
            type="file"
            onChange={(e) => handleInputChange(field.name, e.target.files[0])}
            accept={field.accept || "*"}
            {...commonProps}
          />
        );

      case "currency":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: error ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "0.875rem 1rem",
              color: "#ffffff",
              fontSize: "0.875rem",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              outline: "none",
              width: "100%",
              cursor: "pointer"
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.background = "rgba(255, 255, 255, 0.08)";
                e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.background = "rgba(255, 255, 255, 0.05)";
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            <option value="" style={{ background: "#ffffff", color: "#000000" }}>Select currency</option>
            <option value="USD" style={{ background: "#ffffff", color: "#000000" }}>$ USD - US Dollar</option>
            <option value="AFN" style={{ background: "#ffffff", color: "#000000" }}>Ø AFN - Afghan Afghani</option>
          </select>
        );

      case "payment_status":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: error ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "0.875rem 1rem",
              color: "#ffffff",
              fontSize: "0.875rem",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              outline: "none",
              width: "100%",
              cursor: "pointer"
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.background = "rgba(255, 255, 255, 0.08)";
                e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.background = "rgba(255, 255, 255, 0.05)";
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            <option value="" style={{ background: "#ffffff", color: "#000000" }}>Select payment status</option>
            <option value="paid" style={{ background: "#ffffff", color: "#000000" }}>Paid Amount</option>
            <option value="pending" style={{ background: "#ffffff", color: "#000000" }}>Pending</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            {...commonProps}
          />
        );
    }
  };

  // Filter history based on search
  const filteredHistory = history.filter(entry => {
    if (!historySearch) return true;
    
    const searchLower = historySearch.toLowerCase();
    
    // Search in all field values
    return Object.values(entry.data).some(value => 
      value && value.toString().toLowerCase().includes(searchLower)
    ) || 
    // Search in creator name
    (entry.creator?.name && entry.creator.name.toLowerCase().includes(searchLower)) ||
    // Search in date
    new Date(entry.created_at).toLocaleDateString().toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!formData || !formData.has_form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Form Configured</h1>
          <p className="text-gray-600 mb-6">
            {formData?.category_name ? `No form configured for category: ${formData.category_name}` : 'Form not found'}
          </p>
          <p className="text-gray-600 mb-6">
            You need to create a form schema for this category before you can submit entries.
          </p>
          <Link
            to={`/category/${categoryId}/build-form`}
            className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Build Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 25%, #0a0e27 50%, #1e1b4b 75%, #0a0e27 100%)",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Form Header */}
        <div style={{
          marginBottom: "2rem",
          textAlign: "center"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div style={{
              textAlign: "left"
            }}>
              <h1 style={{
                color: "#ffffff",
                fontSize: "2.5rem",
                fontWeight: "700",
                margin: "0",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                {formData.category_name}
              </h1>
              <p style={{
                color: "#94a3b8",
                fontSize: "1.125rem",
                margin: "0.5rem 0 0 0",
                fontWeight: "400"
              }}>
                Submit your entry below
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          padding: "3rem",
          marginBottom: "2rem"
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: "grid",
              gap: "2rem"
            }}>
              {formData.schema.fields.map((field, index) => (
                <div key={index} style={{
                  display: "grid",
                  gap: "0.75rem"
                }}>
                  <label style={{
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    {field.label || field.name}
                    {field.required && (
                      <span style={{
                        color: "#ef4444",
                        fontSize: "0.75rem"
                      }}>*</span>
                    )}
                    {field.system && (
                      <span style={{
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#60a5fa",
                        fontSize: "0.625rem",
                        padding: "0.125rem 0.375rem",
                        borderRadius: "0.25rem",
                        fontWeight: "500",
                        border: "1px solid rgba(59, 130, 246, 0.3)"
                      }}>
                        System
                      </span>
                    )}
                    {field.locked && !field.system && (
                      <span style={{
                        background: "rgba(245, 158, 11, 0.2)",
                        color: "#f59e0b",
                        fontSize: "0.625rem",
                        padding: "0.125rem 0.375rem",
                        borderRadius: "0.25rem",
                        fontWeight: "500",
                        border: "1px solid rgba(245, 158, 11, 0.3)"
                      }}>
                        Locked
                      </span>
                    )}
                  </label>
                  
                  {renderField(field)}
                  
                  {field.description && (
                    <p style={{
                      color: "#64748b",
                      fontSize: "0.8rem",
                      margin: "0.25rem 0 0 0"
                    }}>
                      {field.description}
                    </p>
                  )}
                  
                  {validationErrors[field.name] && (
                    <div style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      marginTop: "0.5rem"
                    }}>
                      <p style={{
                        color: "#f87171",
                        fontSize: "0.875rem",
                        margin: "0",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {validationErrors[field.name]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Fields Section */}
            <div style={{
              marginTop: "2rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{
                  color: "#ffffff",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  margin: "0",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#f59e0b",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontWeight: "500"
                  }}>
                    Custom Fields
                  </span>
                </h3>
                
                {!showAddField ? (
                  <div style={{
                    display: "flex",
                    gap: "0.5rem"
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowAddField(true)}
                      style={{
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        color: "#22c55e",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(34, 197, 94, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(34, 197, 94, 0.1)";
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add Field
                    </button>
                    
                    {customFields.length > 0 && (
                      <button
                        type="button"
                        onClick={saveCustomFieldsToSchema}
                        style={{
                          background: "rgba(59, 130, 246, 0.1)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          borderRadius: "8px",
                          padding: "0.5rem 1rem",
                          color: "#3b82f6",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(59, 130, 246, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "rgba(59, 130, 246, 0.1)";
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z"/>
                          <polyline points="17,21 17,13 7,13 7,21"/>
                          <polyline points="7,3 7,8 15,16"/>
                        </svg>
                        Save Fields
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Add Field Form */}
              {showAddField && (
                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem"
                  }}>
                    <div>
                      <label style={{
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        display: "block",
                        marginBottom: "0.5rem"
                      }}>
                        Label
                      </label>
                      <input
                        type="text"
                        placeholder="Field Label"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "6px",
                          padding: "0.5rem 0.75rem",
                          color: "#ffffff",
                          fontSize: "0.875rem"
                        }}
                        onChange={(e) => {
                          const newField = {
                            id: Date.now(),
                            label: e.target.value,
                            name: generateFieldName(e.target.value),
                            type: "text",
                            required: false
                          };
                          // This will be used when adding the field
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        display: "block",
                        marginBottom: "0.5rem"
                      }}>
                        Type
                      </label>
                      <select
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "6px",
                          padding: "0.5rem 0.75rem",
                          color: "#ffffff",
                          fontSize: "0.875rem",
                          cursor: "pointer"
                        }}
                      >
                        <option value="text" style={{ background: "#ffffff", color: "#000000" }}>Text</option>
                        <option value="number" style={{ background: "#ffffff", color: "#000000" }}>Number</option>
                        <option value="select" style={{ background: "#ffffff", color: "#000000" }}>Dropdown</option>
                        <option value="date" style={{ background: "#ffffff", color: "#000000" }}>Date</option>
                      </select>
                    </div>
                    
                    <div style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "0.5rem"
                    }}>
                      <label style={{
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer"
                      }}>
                        <input
                          type="checkbox"
                          style={{
                            accentColor: "#22c55e"
                          }}
                        />
                        Required
                      </label>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "flex-end"
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowAddField(false)}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addField}
                      style={{
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "6px",
                        padding: "0.5rem 1rem",
                        color: "#22c55e",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Add Field
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Fields List */}
              {customFields.map((field, index) => (
                <div key={field.id} style={{
                  display: "grid",
                  gap: "0.75rem",
                  marginBottom: "1rem"
                }}>
                  {/* Field Configuration Row */}
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    padding: "0.5rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                      placeholder="Field Label"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        flex: "1"
                      }}
                    />
                    
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        cursor: "pointer"
                      }}
                    >
                      <option value="text" style={{ background: "#ffffff", color: "#000000" }}>Text</option>
                      <option value="number" style={{ background: "#ffffff", color: "#000000" }}>Number</option>
                      <option value="select" style={{ background: "#ffffff", color: "#000000" }}>Dropdown</option>
                      <option value="date" style={{ background: "#ffffff", color: "#000000" }}>Date</option>
                    </select>
                    
                    <label style={{
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(index, 'required', e.target.checked)}
                        style={{
                          accentColor: "#22c55e"
                        }}
                      />
                      Required
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "0.25rem",
                        borderRadius: "4px"
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>

                  {/* Actual Input Field - This is the REAL input users can type in */}
                  {field.label && (
                    <div style={{
                      display: "grid",
                      gap: "0.5rem"
                    }}>
                      <label style={{
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        {field.label}
                        {field.required && (
                          <span style={{
                            color: "#ef4444",
                            fontSize: "0.75rem"
                          }}>*</span>
                        )}
                        <span style={{
                          background: "rgba(245, 158, 11, 0.2)",
                          color: "#f59e0b",
                          fontSize: "0.625rem",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "0.25rem",
                          fontWeight: "500"
                        }}>
                          Custom
                        </span>
                      </label>

                      {/* Render actual input based on field type */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          placeholder={`Enter ${field.label}`}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            padding: "0.875rem 1rem",
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            outline: "none",
                            width: "100%"
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.08)";
                            e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.05)";
                            e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          placeholder={`Enter ${field.label}`}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            padding: "0.875rem 1rem",
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            outline: "none",
                            width: "100%"
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.08)";
                            e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.05)";
                            e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            padding: "0.875rem 1rem",
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            outline: "none",
                            width: "100%"
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.08)";
                            e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.05)";
                            e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          value={field.value}
                          onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            padding: "0.875rem 1rem",
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            outline: "none",
                            width: "100%",
                            cursor: "pointer"
                          }}
                          onFocus={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.08)";
                            e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.background = "rgba(255, 255, 255, 0.05)";
                            e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          <option value="" style={{ background: "#ffffff", color: "#000000" }}>Select option</option>
                          <option value="option1" style={{ background: "#ffffff", color: "#000000" }}>Option 1</option>
                          <option value="option2" style={{ background: "#ffffff", color: "#000000" }}>Option 2</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <button
                type="button"
                onClick={() => {
                  setFormValues({});
                  setValidationErrors({});
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "0.875rem 2rem",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M12 20a9 9 0 0 1-6.74-2.74L3 16"/>
                  <path d="M20 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M20 20v-5h-5"/>
                </svg>
                Reset
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting 
                    ? "linear-gradient(135deg, #64748b, #475569)" 
                    : "linear-gradient(135deg, #10b981, #38ef7d)",
                  border: "none",
                  padding: "0.875rem 2.5rem",
                  borderRadius: "12px",
                  color: "white",
                  fontWeight: "700",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "1rem",
                  opacity: submitting ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
                  }
                }}
              >
                {submitting ? (
                  <>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div style={{
            marginTop: "3rem",
            background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 25%, #0a0e27 50%, #1e1b4b 75%, #0a0e27 100%)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            overflow: "hidden"
          }}>
            {/* History Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.5rem 2rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem"
              }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    color: "#ffffff",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    margin: "0"
                  }}>
                    Submission History
                  </h3>
                  <p style={{
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    margin: "0",
                    marginTop: "0.25rem"
                  }}>
                    {history.length} {history.length === 1 ? 'entry' : 'entries'} recorded
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                }}
              >
                {showHistory ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                    Hide History
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    Show History
                  </>
                )}
              </button>
            </div>

            {/* History Table */}
            {showHistory && (
              <div style={{
                padding: "1.5rem 2rem 2rem"
              }}>
                {/* Search Bar */}
                <div style={{
                  marginBottom: "1.5rem",
                  position: "relative"
                }}>
                  <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{
                        position: "absolute",
                        left: "1rem",
                        color: "#64748b",
                        pointerEvents: "none"
                      }}
                    >
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.875rem 1rem 0.875rem 3rem",
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.08)";
                        e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.05)";
                        e.target.style.border = "1px solid rgba(255, 255, 255, 0.2)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {historySearch && (
                    <div style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      background: "rgba(59, 130, 246, 0.2)",
                      color: "#60a5fa",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600"
                    }}>
                      {filteredHistory.length} results
                    </div>
                  )}
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  overflow: "hidden"
                }}>
                  <div style={{
                    overflowX: "auto"
                  }}>
                    <table style={{
                      width: "100%",
                      borderCollapse: "collapse"
                    }}>
                      <thead>
                        <tr style={{
                          background: "rgba(59, 130, 246, 0.1)"
                        }}>
                          <th style={{
                            padding: "1rem 1.5rem",
                            textAlign: "left",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: "#60a5fa",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                          }}>
                            Date
                          </th>
                          {/* Combine system fields and custom fields for table headers */}
                          {[...(formData.schema?.fields || []), ...customFields.filter(field => field.label)].map(field => (
                            <th key={field.name || field.id} style={{
                              padding: "1rem 1.5rem",
                              textAlign: "left",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              color: "#60a5fa",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                            }}>
                              {field.label || field.name}
                              {field.system && (
                                <span style={{
                                  marginLeft: "0.5rem",
                                  background: "rgba(59, 130, 246, 0.2)",
                                  color: "#60a5fa",
                                  fontSize: "0.6rem",
                                  padding: "0.125rem 0.375rem",
                                  borderRadius: "0.25rem",
                                  fontWeight: "500"
                                }}>
                                  System
                                </span>
                              )}
                              {!field.system && (
                                <span style={{
                                  marginLeft: "0.5rem",
                                  background: "rgba(245, 158, 11, 0.2)",
                                  color: "#f59e0b",
                                  fontSize: "0.6rem",
                                  padding: "0.125rem 0.375rem",
                                  borderRadius: "0.25rem",
                                  fontWeight: "500"
                                }}>
                                  Custom
                                </span>
                              )}
                            </th>
                          ))}
                          <th style={{
                            padding: "1rem 1.5rem",
                            textAlign: "left",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: "#60a5fa",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                          }}>
                            Submitted By
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((entry, index) => (
                          <tr key={entry.id} style={{
                            background: index % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.05)",
                            transition: "all 0.2s ease"
                          }}>
                            <td style={{
                              padding: "1rem 1.5rem",
                              color: "#e2e8f0",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                            }}>
                              {new Date(entry.created_at).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </td>
                            {/* Combine system fields and custom fields for table data */}
                          {[...(formData.schema?.fields || []), ...customFields.filter(field => field.label)].map(field => {
                            const fieldValue = field.system 
                              ? entry.data[field.name] // System fields from JSON data
                              : entry.data[field.name]; // Custom fields also from JSON data
                            
                            // Check if this is payment_status field and value is 'pending'
                            const isPaymentStatusPending = field.name === 'payment_status' && fieldValue === 'pending';
                            
                            return (
                              <td key={field.name || field.id} style={{
                                padding: "1rem 1.5rem",
                                color: "#f1f5f9",
                                fontSize: "0.875rem",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                              }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "0.25rem 0.75rem",
                                  background: field.system 
                                    ? (isPaymentStatusPending ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.1)")
                                    : "rgba(245, 158, 11, 0.1)",
                                  borderRadius: "20px",
                                  fontSize: "0.8rem",
                                  fontWeight: "500",
                                  color: isPaymentStatusPending ? "#f59e0b" : (field.system ? "#60a5fa" : "#f59e0b")
                                }}>
                                  {fieldValue === 'paid' ? 'Paid Amount' : fieldValue === 'pending' ? 'Pending' : (fieldValue || '-')}
                                </span>
                                
                                {/* Edit button for pending payment status */}
                                {isPaymentStatusPending && (
                                  <button
                                    onClick={() => handleUpdatePaymentStatus(entry.id, 'paid')}
                                    style={{
                                      marginLeft: "0.5rem",
                                      background: "rgba(34, 197, 94, 0.1)",
                                      border: "1px solid rgba(34, 197, 94, 0.3)",
                                      borderRadius: "6px",
                                      padding: "0.25rem 0.5rem",
                                      color: "#22c55e",
                                      fontSize: "0.75rem",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = "rgba(34, 197, 94, 0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = "rgba(34, 197, 94, 0.1)";
                                    }}
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                              </td>
                            );
                          })}
                            <td style={{
                              padding: "1rem 1.5rem",
                              borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                            }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                              }}>
                                <div style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #10b981, #38ef7d)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "0.75rem",
                                  fontWeight: "600"
                                }}>
                                  {entry.creator?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span style={{
                                  color: "#f1f5f9",
                                  fontSize: "0.875rem",
                                  fontWeight: "500"
                                }}>
                                  {entry.creator?.name || 'Unknown'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

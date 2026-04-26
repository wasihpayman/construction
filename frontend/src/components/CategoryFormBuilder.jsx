import React, { useState } from "react";
import api from "../services/api";
import { Plus, Trash2, Save, X, AlertTriangle } from "lucide-react";

export default function CategoryFormBuilder({ categoryId, categoryName, onFormCreated }) {
  const [schema, setSchema] = useState({
    fields: []
  });
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    label: '',
    required: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: 'T' },
    { value: 'number', label: 'Number', icon: '#' },
    { value: 'email', label: 'Email', icon: '@' },
    { value: 'textarea', label: 'Textarea', icon: '¶' },
    { value: 'select', label: 'Dropdown', icon: 'v' },
    { value: 'checkbox', label: 'Checkbox', icon: 'x' },
    { value: 'radio', label: 'Radio', icon: 'o' },
    { value: 'date', label: 'Date', icon: 'd' },
    { value: 'file', label: 'File Upload', icon: 'f' },
    { value: 'currency', label: 'Currency (USD/AFN)', icon: '$' },
    { value: 'payment_status', label: 'Payment Status', icon: 'â' },
  ];

  const addField = () => {
    if (!newField.name || !newField.label) {
      setError('Field name and label are required');
      return;
    }

    setSchema(prev => ({
      fields: [...prev.fields, { ...newField }]
    }));
    
    setNewField({
      name: '',
      type: 'text',
      label: '',
      required: false,
    });
    setError(null);
  };

  const removeField = (index) => {
    setSchema(prev => ({
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (schema.fields.length === 0) {
      setError('Please add at least one field');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/categories/${categoryId}/form`, { schema });
      alert('Form created successfully!');
      onFormCreated && onFormCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating form');
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeColor = (type) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      textarea: 'bg-indigo-100 text-indigo-800',
      select: 'bg-yellow-100 text-yellow-800',
      checkbox: 'bg-pink-100 text-pink-800',
      radio: 'bg-orange-100 text-orange-800',
      date: 'bg-cyan-100 text-cyan-800',
      file: 'bg-red-100 text-red-800',
      currency: 'bg-emerald-100 text-emerald-800',
      payment_status: 'bg-amber-100 text-amber-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div style={builderStyles.wrapper}>
      {/* Header */}
      <div style={builderStyles.headerCard}>
        <div style={builderStyles.headerContent}>
          <div>
            <h1 style={builderStyles.headerTitle}>Create Form</h1>
            <p style={builderStyles.headerSubtitle}>Category: <span style={builderStyles.categoryHighlight}>{categoryName}</span></p>
          </div>
          <div style={builderStyles.headerIconBox}>
            <span style={builderStyles.headerIconText}>{categoryName.charAt(0)}</span>
          </div>
        </div>
        <p style={builderStyles.headerDescription}>
          Design your form schema below. Once created, the schema is locked and cannot be modified.
        </p>
      </div>

      {error && (
        <div style={builderStyles.errorCard}>
          <AlertTriangle style={builderStyles.errorIcon} />
          <div>
            <h3 style={builderStyles.errorTitle}>Error</h3>
            <p style={builderStyles.errorText}>{error}</p>
          </div>
        </div>
      )}

      <div style={builderStyles.gridContainer}>
        {/* Add New Field */}
        <div style={builderStyles.fieldCard}>
          <h2 style={builderStyles.cardTitle}>
            <Plus style={builderStyles.titleIcon} />
            Add New Field
          </h2>
          
          <div style={builderStyles.fieldForm}>
            <div>
              <label style={builderStyles.fieldLabel}>Field Name</label>
              <input
                type="text"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                style={builderStyles.input}
                placeholder="e.g., weight"
              />
            </div>

            <div>
              <label style={builderStyles.fieldLabel}>Field Type</label>
              <div style={builderStyles.typeGrid}>
                {fieldTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setNewField({ ...newField, type: type.value })}
                    style={{
                      ...builderStyles.typeButton,
                      ...(newField.type === type.value ? builderStyles.typeButtonActive : {})
                    }}
                  >
                    <span style={builderStyles.typeIcon}>{type.icon}</span>
                    <span style={builderStyles.typeLabel}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={builderStyles.fieldLabel}>Label</label>
              <input
                type="text"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                style={builderStyles.input}
                placeholder="e.g., Weight (kg)"
              />
            </div>

            <div style={builderStyles.checkboxContainer}>
              <label style={builderStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  style={builderStyles.checkbox}
                />
                <span style={builderStyles.checkboxText}>Required Field</span>
              </label>
              {newField.required && (
                <span style={builderStyles.requiredBadge}>Required</span>
              )}
            </div>

            <button
              type="button"
              onClick={addField}
              style={builderStyles.addFieldButton}
            >
              <Plus style={builderStyles.buttonIcon} />
              Add Field
            </button>
          </div>
        </div>

        {/* Field List */}
        <div style={builderStyles.fieldListCard}>
          <div style={builderStyles.fieldListHeader}>
            <h2 style={builderStyles.cardTitle}>
              <span style={builderStyles.fieldCount}>{schema.fields.length}</span>
              Form Fields
            </h2>
            {schema.fields.length > 0 && (
              <button
                type="button"
                onClick={() => setSchema({ fields: [] })}
                style={builderStyles.clearButton}
              >
                <X style={builderStyles.clearIcon} />
                Clear All
              </button>
            )}
          </div>

          {schema.fields.length === 0 ? (
            <div style={builderStyles.emptyState}>
              <div style={builderStyles.emptyIcon}>
                <Plus style={builderStyles.emptyPlusIcon} />
              </div>
              <p style={builderStyles.emptyText}>No fields added yet</p>
              <p style={builderStyles.emptySubtext}>Add fields from the left panel</p>
            </div>
          ) : (
            <div style={builderStyles.fieldList}>
              {schema.fields.map((field, index) => (
                <div
                  key={index}
                  style={builderStyles.fieldItem}
                >
                  <div style={builderStyles.fieldItemContent}>
                    <div style={builderStyles.fieldItemHeader}>
                      <span style={builderStyles.fieldLabel}>{field.label}</span>
                      <span style={{
                        ...builderStyles.fieldTypeBadge,
                        backgroundColor: getFieldTypeColor(field.type).replace('bg-', '').replace('text-', ' ').replace('800', '').replace('100', '')
                      }}>
                        {field.type}
                      </span>
                      {field.required && (
                        <span style={builderStyles.requiredBadge}>Required</span>
                      )}
                    </div>
                    <p style={builderStyles.fieldName}>{field.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    style={builderStyles.deleteButton}
                  >
                    <Trash2 style={builderStyles.deleteIcon} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Form */}
      <div style={builderStyles.submitCard}>
        <div style={builderStyles.submitContent}>
          <div style={builderStyles.submitIconBox}>
            <Save style={builderStyles.submitIcon} />
          </div>
          <div>
            <h3 style={builderStyles.submitTitle}>Save Form Schema</h3>
            <p style={builderStyles.submitSubtitle}>This action cannot be undone</p>
          </div>
        </div>
        <div style={builderStyles.submitButtons}>
          <button
            type="button"
            onClick={() => setSchema({ fields: [] })}
            style={builderStyles.resetButton}
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || schema.fields.length === 0}
            style={{
              ...builderStyles.submitButton,
              ...(loading || schema.fields.length === 0 ? builderStyles.submitButtonDisabled : {})
            }}
          >
            {loading ? (
              <>
                <div style={builderStyles.loadingSpinner}></div>
                Creating...
              </>
            ) : (
              <>
                <Save style={builderStyles.buttonIcon} />
                Create Form
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div style={builderStyles.warningCard}>
        <div style={builderStyles.warningIconBox}>
          <AlertTriangle style={builderStyles.warningIcon} />
        </div>
        <div>
          <h3 style={builderStyles.warningTitle}>Important Notice</h3>
          <p style={builderStyles.warningText}>
            Once the form is created, the schema <strong>cannot be modified</strong>. This ensures data consistency and prevents breaking changes. Make sure all fields are correctly configured before submitting.
          </p>
        </div>
      </div>
    </div>
  );
}

const builderStyles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 25%, #0a0e27 50%, #1e1b4b 75%, #0a0e27 100%)",
    padding: "20px",
    position: "relative"
  },
  headerCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  headerTitle: {
    fontSize: "36px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    margin: "0",
    letterSpacing: "-0.02em"
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: "18px",
    margin: 0
  },
  categoryHighlight: {
    color: "#60a5fa",
    fontWeight: "bold"
  },
  headerIconBox: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
  },
  headerIconText: {
    color: "white",
    fontSize: "32px",
    fontWeight: "bold"
  },
  headerDescription: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0
  },
  errorCard: {
    marginBottom: "24px",
    padding: "16px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "2px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "start",
    gap: "12px"
  },
  errorIcon: {
    width: "24px",
    height: "24px",
    color: "#f87171",
    flexShrink: 0,
    marginTop: "2px"
  },
  errorTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f87171",
    margin: "0 0 4px 0"
  },
  errorText: {
    fontSize: "14px",
    color: "#fca5a5",
    margin: 0
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "32px",
    marginBottom: "32px"
  },
  fieldCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "white",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  titleIcon: {
    width: "24px",
    height: "24px",
    color: "#3b82f6"
  },
  fieldForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  fieldLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px"
  },
  input: {
    width: "100%",
    background: "rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "12px",
    padding: "10px 16px",
    color: "white",
    fontSize: "14px",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px"
  },
  typeButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid " + "rgba(255, 255, 255, 0.18)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    background: "transparent",
    color: "#cbd5e1",
    cursor: "pointer"
  },
  typeButtonActive: {
    borderColor: "#3b82f6",
    background: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6"
  },
  typeIcon: {
    fontSize: "20px",
    fontWeight: "bold"
  },
  typeLabel: {
    fontSize: "12px",
    fontWeight: "500"
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer"
  },
  checkbox: {
    width: "20px",
    height: "20px",
    color: "#3b82f6",
    border: "2px solid " + "rgba(255, 255, 255, 0.18)",
    borderRadius: "10px"
  },
  checkboxText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#cbd5e1"
  },
  requiredBadge: {
    padding: "2px 8px",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#f87171",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "8px"
  },
  addFieldButton: {
    width: "100%",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
  },
  buttonIcon: {
    width: "20px",
    height: "20px"
  },
  fieldListCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
  },
  fieldListHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px"
  },
  fieldCount: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600"
  },
  clearButton: {
    fontSize: "14px",
    color: "#f87171",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    padding: "8px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  clearIcon: {
    width: "16px",
    height: "16px"
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 0"
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 16px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyPlusIcon: {
    width: "32px",
    height: "32px",
    color: "#64748b"
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 4px 0"
  },
  emptySubtext: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0
  },
  fieldList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "384px",
    overflowY: "auto",
    paddingRight: "8px"
  },
  fieldItem: {
    padding: "16px",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
    backdropFilter: "blur(20px)",
    borderRadius: "12px",
    border: "2px solid rgba(255, 255, 255, 0.18)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "start",
    justifyContent: "space-between",
    gap: "12px"
  },
  fieldItemContent: {
    flex: 1
  },
  fieldItemHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px"
  },
  fieldLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "white"
  },
  fieldTypeBadge: {
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"
  },
  fieldName: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  deleteButton: {
    opacity: 0,
    padding: "8px",
    color: "#f87171",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  deleteIcon: {
    width: "20px",
    height: "20px"
  },
  submitCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
  },
  submitContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  submitIconBox: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #10b981, #38ef7d)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
  },
  submitIcon: {
    width: "24px",
    height: "24px",
    color: "white"
  },
  submitTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "white",
    margin: "0"
  },
  submitSubtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0
  },
  submitButtons: {
    display: "flex",
    gap: "12px"
  },
  resetButton: {
    padding: "12px 24px",
    border: "2px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "12px",
    color: "#cbd5e1",
    fontWeight: "600",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  submitButton: {
    padding: "12px 32px",
    background: "linear-gradient(135deg, #10b981, #38ef7d)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid " + "rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  warningCard: {
    marginTop: "24px",
    padding: "24px",
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.05))",
    border: "2px solid rgba(245, 158, 11, 0.2)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "start",
    gap: "16px"
  },
  warningIconBox: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
  },
  warningIcon: {
    width: "24px",
    height: "24px",
    color: "white"
  },
  warningTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fbbf24",
    margin: "0 0 8px 0"
  },
  warningText: {
    fontSize: "14px",
    color: "#fcd34d",
    margin: 0
  }
};

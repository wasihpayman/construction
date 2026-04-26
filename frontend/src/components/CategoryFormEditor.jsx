import React, { useState } from 'react';
import { Plus, Trash2, Lock, Unlock, Settings } from 'lucide-react';
import api from '../services/api';

export default function CategoryFormEditor({ categoryId, categoryName, existingForm, onFormUpdated }) {
  const [schema, setSchema] = useState(existingForm?.schema || { fields: [] });
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
  ];

  const systemFields = ['name', 'currency', 'payment_status', 'amount', 'date'];

  const addUserField = () => {
    const newField = {
      name: '',
      type: 'text',
      label: '',
      required: false,
      locked: false,
      system: false,
      order: schema.fields.length + 1
    };

    setSchema(prev => ({
      fields: [...prev.fields, newField]
    }));
  };

  const removeField = (index) => {
    const field = schema.fields[index];
    
    // Don't allow removing system fields
    if (field.system) {
      setError('Cannot remove system fields');
      return;
    }

    setSchema(prev => ({
      fields: prev.fields.filter((_, i) => i !== index)
    }));
    setError(null);
  };

  const updateField = (index, property, value) => {
    const field = schema.fields[index];
    
    // Don't allow modifying system field properties
    if (field.system && ['name', 'type', 'locked', 'system', 'required'].includes(property)) {
      return;
    }

    setSchema(prev => ({
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, [property]: value } : field
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      // Separate system fields from user fields
      const systemFieldsList = schema.fields.filter(field => field.system);
      const userFields = schema.fields.filter(field => !field.system);
      
      // Validate user fields
      for (const field of userFields) {
        if (!field.name || !field.label) {
          setError('All user fields must have a name and label');
          return;
        }
      }

      // Combine with system fields
      const finalSchema = {
        fields: [...systemFieldsList, ...userFields]
      };

      await api.put(`/categories/${categoryId}/form`, { schema: finalSchema });
      alert('Form updated successfully!');
      onFormUpdated && onFormUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating form');
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
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div style={editorStyles.wrapper}>
      {/* Header */}
      <div style={editorStyles.headerCard}>
        <div style={editorStyles.headerContent}>
          <div>
            <h1 style={editorStyles.headerTitle}>Edit Form Fields</h1>
            <p style={editorStyles.headerSubtitle}>
              Category: <span style={editorStyles.categoryHighlight}>{categoryName}</span>
            </p>
          </div>
          <div style={editorStyles.headerIconBox}>
            <Settings style={editorStyles.headerIcon} />
          </div>
        </div>
        <p style={editorStyles.headerDescription}>
          System fields are locked and cannot be modified. You can add custom fields below.
        </p>
      </div>

      {error && (
        <div style={editorStyles.errorCard}>
          <p style={editorStyles.errorText}>{error}</p>
        </div>
      )}

      {/* System Fields */}
      <div style={editorStyles.sectionCard}>
        <h2 style={editorStyles.sectionTitle}>
          <Lock style={editorStyles.sectionIcon} />
          System Fields (Locked)
        </h2>
        
        <div style={editorStyles.fieldList}>
          {schema.fields.filter(field => field.system).map((field, index) => (
            <div key={index} style={editorStyles.fieldItem}>
              <div style={editorStyles.fieldItemContent}>
                <div style={editorStyles.fieldItemHeader}>
                  <h3 style={editorStyles.fieldLabel}>{field.label}</h3>
                  <div style={{
                    ...editorStyles.fieldTypeBadge,
                    background: "rgba(59, 130, 246, 0.1)",
                    color: "#3b82f6",
                    border: "1px solid rgba(59, 130, 246, 0.3)"
                  }}>
                    <Lock size={12} style={{ marginRight: '4px' }} />
                    System
                  </div>
                </div>
                <p style={editorStyles.fieldName}>Type: {field.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Fields */}
      <div style={editorStyles.sectionCard}>
        <h2 style={editorStyles.sectionTitle}>
          <Unlock style={editorStyles.sectionIcon} />
          Custom Fields
        </h2>
        
        <button
          type="button"
          onClick={addUserField}
          style={editorStyles.addFieldButton}
        >
          <Plus style={editorStyles.buttonIcon} />
          Add Custom Field
        </button>

        <div style={editorStyles.fieldList}>
          {schema.fields.filter(field => !field.system).map((field, index) => {
            const originalIndex = schema.fields.findIndex(f => f === field);
            return (
              <div key={originalIndex} style={editorStyles.fieldItem}>
                <div style={editorStyles.fieldItemContent}>
                  <div style={editorStyles.fieldItemHeader}>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(originalIndex, 'label', e.target.value)}
                      placeholder="Field Label"
                      style={editorStyles.fieldInput}
                    />
                    <div style={{ ...editorStyles.fieldTypeBadge, ...getFieldTypeColor(field.type) }}>
                      {field.type}
                    </div>
                  </div>
                  <p style={editorStyles.fieldName}>Name: {field.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeField(originalIndex)}
                  style={editorStyles.deleteButton}
                >
                  <Trash2 style={editorStyles.deleteIcon} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div style={editorStyles.submitCard}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...editorStyles.submitButton,
            ...(loading ? editorStyles.submitButtonDisabled : {})
          }}
        >
          {loading ? 'Updating...' : 'Update Form'}
        </button>
      </div>
    </div>
  );
}

const editorStyles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 25%, #0a0e27 50%, #1e1b4b 75%, #0a0e27 100%)",
    padding: "20px"
  },
  headerCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px"
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "36px",
    fontWeight: "800",
    margin: "0"
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: "18px",
    margin: "0"
  },
  categoryHighlight: {
    color: "#60a5fa"
  },
  headerIconBox: {
    width: "64px",
    height: "64px",
    background: "rgba(96, 165, 250, 0.1)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  headerIcon: {
    width: "32px",
    height: "32px",
    color: "#60a5fa"
  },
  headerDescription: {
    color: "#94a3b8",
    fontSize: "16px",
    margin: "0"
  },
  errorCard: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px"
  },
  errorText: {
    color: "#ef4444",
    margin: "0"
  },
  sectionCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px"
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 20px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  sectionIcon: {
    width: "20px",
    height: "20px"
  },
  addFieldButton: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: "12px",
    padding: "12px 20px",
    color: "#22c55e",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    transition: "all 0.3s ease"
  },
  buttonIcon: {
    width: "16px",
    height: "16px"
  },
  fieldList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  fieldItem: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
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
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0"
  },
  fieldInput: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    padding: "8px 12px",
    color: "#ffffff",
    fontSize: "14px",
    flex: 1
  },
  fieldName: {
    color: "#64748b",
    fontSize: "12px",
    margin: "0"
  },
  fieldTypeBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center"
  },
  deleteButton: {
    padding: "8px",
    color: "#ef4444",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  deleteIcon: {
    width: "16px",
    height: "16px"
  },
  submitCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center"
  },
  submitButton: {
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  }
};

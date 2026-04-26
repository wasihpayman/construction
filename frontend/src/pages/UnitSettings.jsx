import { useEffect, useState } from "react";
import api from "../services/api";
import "../css/UnitSettings.css";
import { Settings, Save, Building2, Package, Plus, Trash2, Edit, Eye } from "lucide-react";

export default function UnitSettings() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [buildingConfig, setBuildingConfig] = useState({
    totalFloors: 5,
    floors: [
      {
        floorNumber: 1,
        unitsPerFloor: 8,
        unitNamingConvention: 'A-{floor}-{unit}',
        positionLabels: ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right', 'Side-Left', 'Side-Right'],
        unitPrefix: 'A',
        basePrice: 50000,
        priceIncrement: 1000,
        baseArea: 100
      },
      {
        floorNumber: 2,
        unitsPerFloor: 8,
        unitNamingConvention: 'B-{floor}-{unit}',
        positionLabels: ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right', 'Side-Left', 'Side-Right'],
        unitPrefix: 'B',
        basePrice: 55000,
        priceIncrement: 1200,
        baseArea: 110
      },
      {
        floorNumber: 3,
        unitsPerFloor: 6,
        unitNamingConvention: 'C-{floor}-{unit}',
        positionLabels: ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right'],
        unitPrefix: 'C',
        basePrice: 60000,
        priceIncrement: 1500,
        baseArea: 120
      },
      {
        floorNumber: 4,
        unitsPerFloor: 6,
        unitNamingConvention: 'D-{floor}-{unit}',
        positionLabels: ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right', 'Center-Left', 'Center-Right'],
        unitPrefix: 'D',
        basePrice: 65000,
        priceIncrement: 1800,
        baseArea: 130
      },
      {
        floorNumber: 5,
        unitsPerFloor: 4,
        unitNamingConvention: 'E-{floor}-{unit}',
        positionLabels: ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right'],
        unitPrefix: 'E',
        basePrice: 70000,
        priceIncrement: 2000,
        baseArea: 140
      }
    ]
  });

  useEffect(() => {
    loadProjects();
    loadSettings();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await api.get("/unit-settings");
      if (response.data) {
        setBuildingConfig(response.data);
      }
    } catch (error) {
      console.error("Error loading unit settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.post("/unit-settings", buildingConfig);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addFloor = () => {
    const newFloorNumber = buildingConfig.totalFloors + 1;
    const newFloor = {
      floorNumber: newFloorNumber,
      unitsPerFloor: 4,
      unitNamingConvention: `${String.fromCharCode(64 + newFloorNumber)}-{floor}-{unit}`,
      positionLabels: ['Front-Left', 'Front-Right', 'Back-Left', 'Back-Right'],
      unitPrefix: String.fromCharCode(64 + newFloorNumber),
      basePrice: 50000 + (newFloorNumber * 5000),
      priceIncrement: 1000 + (newFloorNumber * 200),
      baseArea: 100 + (newFloorNumber * 10)
    };
    
    setBuildingConfig(prev => ({
      ...prev,
      totalFloors: newFloorNumber,
      floors: [...prev.floors, newFloor]
    }));
  };

  const removeFloor = (floorNumber) => {
    setBuildingConfig(prev => ({
      ...prev,
      floors: prev.floors.filter(floor => floor.floorNumber !== floorNumber)
    }));
  };

  const updateFloor = (floorNumber, field, value) => {
    setBuildingConfig(prev => ({
      ...prev,
      floors: prev.floors.map(floor => 
        floor.floorNumber === floorNumber 
          ? { ...floor, [field]: value }
          : floor
      )
    }));
  };

  const generateUnits = () => {
    const generatedUnits = [];
    
    buildingConfig.floors.forEach(floor => {
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
          project_id: selectedProject || null,
          generated: true
        });
      }
    });
    
    return generatedUnits;
  };

  const saveGeneratedUnits = async () => {
    try {
      const units = generateUnits();
      await api.post("/units/generate", {
        project_id: selectedProject,
        units: units
      });
      alert("Units generated successfully!");
    } catch (error) {
      console.error("Error generating units:", error);
      alert("Error generating units. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="unit-settings-container">
      <div className="settings-header">
        <h1>
          <Settings size={24} />
          Unit Settings
        </h1>
      </div>
      
      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header">
            <Building2 size={20} />
            <h2>Project Selection</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="form-select"
              >
                <option value="">Choose a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <div className="card-header">
            <Building2 size={20} />
            <h2>Building Configuration</h2>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-primary"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {buildingConfig.floors.map((floor) => (
                <div key={floor.floorNumber} className="floor-card">
                  <div className="floor-header">
                    <h3 className="floor-title">
                      <Building2 size={16} />
                      Floor {floor.floorNumber}
                    </h3>
                    <button
                      onClick={() => removeFloor(floor.floorNumber)}
                      className="btn-danger"
                      title="Remove floor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Units per Floor</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={floor.unitsPerFloor}
                        onChange={(e) => updateFloor(floor.floorNumber, 'unitsPerFloor', parseInt(e.target.value))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Unit Prefix</label>
                      <input
                        type="text"
                        value={floor.unitPrefix}
                        onChange={(e) => updateFloor(floor.floorNumber, 'unitPrefix', e.target.value)}
                        className="form-input"
                        maxLength={5}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Naming Convention</label>
                    <input
                      type="text"
                      value={floor.unitNamingConvention}
                      onChange={(e) => updateFloor(floor.floorNumber, 'unitNamingConvention', e.target.value)}
                      className="form-input"
                      placeholder="e.g., A-{floor}-{unit}"
                    />
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Base Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={floor.basePrice || 50000}
                        onChange={(e) => updateFloor(floor.floorNumber, 'basePrice', parseInt(e.target.value))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price Increment ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={floor.priceIncrement || 1000}
                        onChange={(e) => updateFloor(floor.floorNumber, 'priceIncrement', parseInt(e.target.value))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Base Area (m²)</label>
                      <input
                        type="number"
                        min="0"
                        value={floor.baseArea || 100}
                        onChange={(e) => updateFloor(floor.floorNumber, 'baseArea', parseInt(e.target.value))}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="position-labels-container">
                    <label className="form-label">Position Labels</label>
                    {floor.positionLabels.map((label, index) => (
                      <div key={index} className="position-label-item">
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => {
                            const newLabels = [...floor.positionLabels];
                            newLabels[index] = e.target.value;
                            updateFloor(floor.floorNumber, 'positionLabels', newLabels);
                          }}
                          className="position-input"
                          placeholder={`Position ${index + 1}`}
                        />
                        <button
                          onClick={() => {
                            const newLabels = floor.positionLabels.filter((_, i) => i !== index);
                            updateFloor(floor.floorNumber, 'positionLabels', newLabels);
                          }}
                          className="btn-danger"
                          title="Remove position"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="add-floor-container">
              <button onClick={addFloor} className="btn-add">
                <Plus size={16} />
                Add Floor
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="preview-card">
        <div className="preview-header">
          <div className="preview-title">
            <Package size={20} />
            <h2>Units Preview</h2>
          </div>
          <div className="preview-count">
            {generateUnits().length} units
          </div>
        </div>
        <div className="preview-body">
          {buildingConfig.floors.map(floor => (
            <div key={floor.floorNumber} className="floor-preview">
              <h3 className="floor-preview-title">
                <Building2 size={14} />
                Floor {floor.floorNumber} ({floor.unitsPerFloor} units)
              </h3>
              <div className="units-preview-grid">
                {Array.from({ length: floor.unitsPerFloor }, (_, i) => {
                  const unitName = floor.unitNamingConvention
                    .replace('{floor}', floor.floorNumber)
                    .replace('{unit}', i + 1);
                  const positionLabel = floor.positionLabels[i];
                  
                  return (
                    <div
                      key={i}
                      className="unit-preview-item"
                      title={unitName + " - " + (positionLabel || "Position " + (i + 1))}
                    >
                      <div className="unit-preview-name">{unitName}</div>
                      <div className="unit-preview-position">{positionLabel || "Pos " + (i + 1)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedProject && (
        <div className="generate-container">
          <button onClick={saveGeneratedUnits} className="btn-generate">
            <Package size={20} />
            Generate Units for Project
          </button>
        </div>
      )}
    </div>
  );
}

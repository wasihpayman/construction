import { useEffect, useState } from "react";
import api from "../services/api";

export default function MaterialPurchases() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState({
    project_id: "",
    material_name: "",
    quantity: "",
    unit_price: "",
    supplier_name: "",
    purchase_date: "",
    description: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/material-purchases");
    const p = await api.get("/projects");

    setItems(res.data);
    setProjects(p.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await api.post("/material-purchases", {
      ...form,
      total_price: form.quantity * form.unit_price,
    });

    setForm({
      project_id: "",
      material_name: "",
      quantity: "",
      unit_price: "",
      supplier_name: "",
      purchase_date: "",
      description: "",
    });

    load();
  };

  return (
    <div>
      <h1>Material Purchases</h1>

      {/* PROJECT SELECT ✔ */}
      <select name="project_id" onChange={handleChange} value={form.project_id}>
        <option value="">Select Project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* MATERIAL NAME (MANUAL INPUT) ✔ */}
      <input
        name="material_name"
        placeholder="Material Name (type manually)"
        value={form.material_name}
        onChange={handleChange}
      />

      <input
        name="quantity"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
      />

      <input
        name="unit_price"
        placeholder="Unit Price"
        value={form.unit_price}
        onChange={handleChange}
      />

      <input
        name="supplier_name"
        placeholder="Supplier Name"
        value={form.supplier_name}
        onChange={handleChange}
      />

      <input
        type="date"
        name="purchase_date"
        value={form.purchase_date}
        onChange={handleChange}
      />

      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <button onClick={handleSubmit}>Save</button>

      <hr />

      {/* LIST */}
      {items.map((i) => (
        <div key={i.id}>
          <h4>Material: {i.material?.name}</h4>
          <p>Project: {i.project?.name}</p>
          <p>Quantity: {i.quantity} x Unit Price: {i.unit_price}</p>
          <p>Supplier: {i.supplier_name}</p>
          <p>Date: {i.purchase_date}</p>
          <p><strong>Total: {i.total_price}</strong></p>
          {i.description && <p>Description: {i.description}</p>}
          <hr />
        </div>
      ))}
    </div>
  );
}
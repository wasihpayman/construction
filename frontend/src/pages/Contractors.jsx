import { useEffect, useState } from "react";
import api from "../services/api";

export default function Contractors() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/contractors");
    setItems(res.data);
  };

  const handleSubmit = async () => {
    await api.post("/contractors", form);
    setForm({});
    load();
  };

  return (
    <div>
      <h1>Contractors</h1>

      <div>
        <input name="name" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
        <input name="company_name" placeholder="Company" onChange={e => setForm({ ...form, company_name: e.target.value })} />
        <input name="phone_number" placeholder="Phone" onChange={e => setForm({ ...form, phone_number: e.target.value })} />
        <input name="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />

        <button onClick={handleSubmit}>Save</button>
      </div>

      {items.map(i => (
        <div key={i.id}>
          🧑 {i.name} | 🏢 {i.company_name}
        </div>
      ))}
    </div>
  );
}
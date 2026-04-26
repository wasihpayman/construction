import { useEffect, useState } from "react";
import api from "../services/api";

export default function Income() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/income").then(res => setItems(res.data));
  }, []);

  return (
    <div>
      <h1>Income</h1>
      {items.map(i => (
        <div key={i.id}>
          {i.title} - {i.amount}
        </div>
      ))}
    </div>
  );
}
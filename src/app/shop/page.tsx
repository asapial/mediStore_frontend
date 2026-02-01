"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
}

interface Medicine {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  manufacturer: string;
  category: Category;
  seller: Seller;
}

export default function ShopPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines?`;
      if (search) url += `name=${search}&`;
      if (selectedCategory) url += `categoryId=${selectedCategory}&`;

      const res = await fetch(url);
      const data = await res.json();
      setMedicines(data.data);
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories`);
      const data = await res.json();
      setCategories(data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [search, selectedCategory]);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Shop - All Medicines</h1>

      {/* Search & Filter */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px", flex: "1", minWidth: "200px" }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: "10px", minWidth: "200px" }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchMedicines}
          style={{ padding: "10px 20px", background: "#0070f3", color: "#fff", border: "none", borderRadius: "5px" }}
        >
          Filter
        </button>
      </div>

      {loading ? (
        <p>Loading medicines...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {medicines.map((med) => (
            <div
              key={med.id}
              style={{
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
                backgroundColor: "#fff",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-5px)";
                el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
              }}
            >
              <img
                src={med.image}
                alt={med.name}
                style={{ width: "100%", height: "180px", objectFit: "cover" }}
              />
              <div style={{ padding: "15px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "1.2rem", color: "#333" }}>{med.name}</h3>
                <p style={{ fontSize: "0.9rem", color: "#555", minHeight: "50px" }}>{med.description}</p>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>
                  <strong>Category:</strong> {med.category.name}
                </p>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>
                  <strong>Seller:</strong> {med.seller.name} ({med.seller.email})
                </p>
                <p style={{ fontSize: "1rem", color: "#000", fontWeight: "bold" }}>${med.price}</p>
                <p style={{ fontSize: "0.85rem", color: med.stock > 0 ? "green" : "red" }}>
                  <strong>Stock:</strong> {med.stock > 0 ? med.stock : "Out of stock"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

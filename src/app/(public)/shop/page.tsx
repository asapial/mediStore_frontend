"use client";

import SectionContainer from "@/utils/SectionContainer";
import { useEffect, useState } from "react";
import { BiSearch, BiCategory, BiDollar, BiUser, BiCartAlt } from "react-icons/bi";
import { motion } from "framer-motion";

interface Category { id: string; name: string; }
interface Seller { id: string; name: string; email: string; }
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

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchMedicines(); }, [search, selectedCategory]);

  return (
    <SectionContainer className="min-h-screen py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Shop - All Medicines</h1>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 min-w-[200px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <button
          onClick={fetchMedicines}
          className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading medicines...</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {medicines.map((med) => (
            <motion.div
              key={med.id}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between transition-all"
            >
              {/* Image */}
              <img
                src={med.image || "https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"}
                alt={med.name}
                className="w-full h-48 object-cover"
              />

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{med.name}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{med.description}</p>

                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <BiCategory /> <span>{med.category.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <BiUser /> <span>{med.seller.name} ({med.seller.email})</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-md mt-1">
                  <BiDollar /> <span>${med.price}</span>
                </div>

                <div className={`mt-1 text-sm font-medium ${med.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  Stock: {med.stock > 0 ? med.stock : "Out of stock"}
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 flex gap-2">
                <a
                  href={`/shop/${med.id}`}
                  className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  View Details
                </a>
                {/* {med.stock > 0 && (
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <BiCartAlt /> Add to Cart
                  </button>
                )} */}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </SectionContainer>
  );
}

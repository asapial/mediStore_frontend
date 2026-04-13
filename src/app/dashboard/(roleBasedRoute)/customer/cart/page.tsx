"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart, FaTrash, FaMinus, FaPlus, FaCheckSquare,
  FaSquare, FaArrowRight,
} from "react-icons/fa";

interface CartItem {
  id: string; cartId: string; medicineId: string;
  quantity: number; addedAt: string;
  medicine: {
    id: string; name: string; description: string;
    image: string | null; price: number; discountPrice?: number | null;
    stock: number; manufacturer: string; categoryId: string;
  };
}

export default function CartPage() {
  const [items,    setItems]    = useState<CartItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<string | null>(null);
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/cart", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const cartItems: CartItem[] = data.data?.items || [];
      setItems(cartItems);
      // Select all by default
      setSelected(new Set(cartItems.map(i => i.id)));
    } catch (err: any) { toast.error(err.message || "Failed to load cart"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const toggleSelect = (id: string) =>
    setSelected(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map(i => i.id)));
  };

  const updateQty = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    try {
      const res = await fetch("/api/cart/update", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: qty }),
      });
      if (!res.ok) throw new Error();
      setItems(p => p.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
    } catch { toast.error("Failed to update quantity"); }
  };

  const removeItem = async (itemId: string) => {
    setRemoving(itemId);
    try {
      const res = await fetch("/api/cart/remove", {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) throw new Error();
      setItems(p => p.filter(i => i.id !== itemId));
      setSelected(p => { const n = new Set(p); n.delete(itemId); return n; });
      toast.success("Item removed");
    } catch { toast.error("Failed to remove"); }
    finally { setRemoving(null); }
  };

  const selectedItems  = items.filter(i => selected.has(i.id));
  // effective price = discountPrice if set and valid, else price
  const effPrice = (m: CartItem["medicine"]) =>
    m.discountPrice != null && m.discountPrice > 0 && m.discountPrice < m.price ? m.discountPrice : m.price;
  const originalTotal  = selectedItems.reduce((s, i) => s + i.quantity * i.medicine.price, 0);
  const subtotal       = selectedItems.reduce((s, i) => s + i.quantity * effPrice(i.medicine), 0);
  const discountSaving = originalTotal - subtotal;
  const totalQty       = selectedItems.reduce((s, i) => s + i.quantity, 0);

  const goCheckout = () => {
    if (selectedItems.length === 0) { toast.error("Select at least one item"); return; }
    // Store selected items in sessionStorage for checkout
    sessionStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    router.push("/dashboard/customer/checkout");
  };

  if (loading) return (
    <div className="medi-page flex items-center justify-center min-h-[60vh]">
      <p style={{ color: "#8A6650" }}>Loading cart…</p>
    </div>
  );

  if (items.length === 0) return (
    <div className="medi-page text-center py-20">
      <FaShoppingCart className="mx-auto text-6xl mb-4 opacity-20" style={{ color: "#1B3A5C" }} />
      <p className="text-xl font-bold mb-2" style={{ color: "#1B3A5C" }}>Your cart is empty</p>
      <p style={{ color: "#8A6650" }}>Browse medicines to add items to your cart.</p>
      <button onClick={() => router.push("/shop")} className="medi-btn-primary mt-6">
        Shop Now
      </button>
    </div>
  );

  return (
    <div className="medi-page">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaShoppingCart className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>My Cart</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>
              {items.length} item{items.length !== 1 ? "s" : ""} · {selected.size} selected
            </p>
          </div>
        </div>
        {/* Select all toggle */}
        <button onClick={toggleAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#F5EDE3", color: "#5C4033", border: "1px solid #DDD0C4" }}>
          {selected.size === items.length
            ? <FaCheckSquare style={{ color: "#2E7D32" }} />
            : <FaSquare style={{ color: "#8A6650" }} />}
          {selected.size === items.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item, i) => {
              const isSelected = selected.has(item.id);
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                  className="medi-card p-4 flex items-start gap-4 cursor-pointer transition-all"
                  style={{ borderLeft: `4px solid ${isSelected ? "#2E7D32" : "#DDD0C4"}` }}
                  onClick={() => toggleSelect(item.id)}>

                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    {isSelected
                      ? <FaCheckSquare style={{ color: "#2E7D32", fontSize: 18 }} />
                      : <FaSquare style={{ color: "#DDD0C4", fontSize: 18 }} />}
                  </div>

                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden"
                    style={{ background: "#EEE4D9" }}
                    onClick={e => e.stopPropagation()}>
                    {item.medicine.image
                      ? <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{item.medicine.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#8A6650" }}>{item.medicine.manufacturer}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {(() => {
                        const hasDisc = item.medicine.discountPrice != null && item.medicine.discountPrice > 0 && item.medicine.discountPrice < item.medicine.price;
                        return hasDisc ? (
                          <>
                            <span className="font-bold" style={{ color: "#C2703A" }}>${item.medicine.discountPrice!.toFixed(2)}</span>
                            <span className="text-xs line-through" style={{ color: "#aaa" }}>${item.medicine.price.toFixed(2)}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FFEBEE", color: "#C62828" }}>
                              -{Math.round(((item.medicine.price - item.medicine.discountPrice!) / item.medicine.price) * 100)}%
                            </span>
                          </>
                        ) : (
                          <span className="font-bold" style={{ color: "#C2703A" }}>${item.medicine.price.toFixed(2)}</span>
                        );
                      })()}
                      <span className={`badge-${item.medicine.stock === 0 ? "rejected" : item.medicine.stock < 10 ? "lowstock" : "instock"}`}>
                        {item.medicine.stock === 0 ? "Out of Stock" : item.medicine.stock < 10 ? "Low Stock" : "In Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Qty + Remove */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0"
                    onClick={e => e.stopPropagation()}>
                    {/* Qty stepper */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold disabled:opacity-40"
                        style={{ background: "#EEE4D9", color: "#5C4033" }}>
                        <FaMinus style={{ fontSize: 10 }} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm" style={{ color: "#1B3A5C" }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.medicine.stock}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold disabled:opacity-40"
                        style={{ background: "#EEE4D9", color: "#5C4033" }}>
                        <FaPlus style={{ fontSize: 10 }} />
                      </button>
                    </div>
                    {/* Subtotal */}
                    <p className="text-sm font-black" style={{ color: "#1B3A5C" }}>
                      ${(item.quantity * effPrice(item.medicine)).toFixed(2)}
                    </p>
                    {/* Remove */}
                    <button onClick={() => removeItem(item.id)}
                      disabled={removing === item.id}
                      className="text-xs flex items-center gap-1 disabled:opacity-40"
                      style={{ color: "#C62828" }}>
                      <FaTrash style={{ fontSize: 10 }} /> Remove
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="medi-card p-6 h-fit sticky top-4">
          <h2 className="font-bold text-lg mb-4" style={{ color: "#1B3A5C" }}>Order Summary</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: "#8A6650" }}>Selected items</span>
              <span style={{ color: "#5C4033" }}>{selectedItems.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#8A6650" }}>Total quantity</span>
              <span style={{ color: "#5C4033" }}>{totalQty}</span>
            </div>
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between text-xs" style={{ color: "#8A6650" }}>
                <span className="truncate max-w-[60%]">{item.medicine.name} ×{item.quantity}</span>
                <span>${(item.quantity * effPrice(item.medicine)).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3" style={{ borderColor: "#DDD0C4" }}>
              {discountSaving > 0 && (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "#8A6650" }}>Original Total</span>
                    <span className="line-through" style={{ color: "#aaa" }}>${originalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "#2E7D32" }}>Discount Savings</span>
                    <span style={{ color: "#2E7D32" }}>–${discountSaving.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="font-bold" style={{ color: "#1B3A5C" }}>Subtotal</span>
                <span className="font-black text-lg" style={{ color: "#C2703A" }}>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button onClick={goCheckout}
            disabled={selectedItems.length === 0}
            className="medi-btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50">
            Proceed to Checkout <FaArrowRight />
          </button>
          {selectedItems.length < items.length && (
            <p className="text-xs text-center mt-2" style={{ color: "#8A6650" }}>
              {items.length - selectedItems.length} unselected item{items.length - selectedItems.length > 1 ? "s" : ""} won't be ordered
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

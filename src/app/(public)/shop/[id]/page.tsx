"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SectionContainer from "@/utils/SectionContainer";
import { motion } from "framer-motion";
import { BiCategory, BiDollar, BiUser, BiBuilding, BiCartAlt, BiPlus, BiMinus } from "react-icons/bi";


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

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Fetch medicine details
  const fetchMedicine = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/${id}`);
      const data = await res.json();
      setMedicine(data.data);
    } catch (err) {
      console.error("Error fetching medicine:", err);
      toast.error("Failed to load medicine details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart status for this medicine
  const fetchMedicineCartStatus = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/status/${id}`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setInCart(data.data.inCart);
        setCartQuantity(data.data.quantity);
      }
    } catch (err) {
      console.error("Error fetching cart status:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMedicine();
      fetchMedicineCartStatus();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!medicine) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ medicineId: medicine.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");

      toast.success(`${quantity} ${medicine.name} added to cart!`);
      setInCart(true);
      setCartQuantity((prev) => prev + quantity);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !medicine) {
    return <p className="text-center py-10 text-muted-foreground">Loading medicine details...</p>;
  }

  return (
    <SectionContainer className="min-h-[70vh] py-10">
      <motion.div
        className="flex flex-col md:flex-row gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Medicine Image */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-full md:w-2/5 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md"
        >
          <img
            src={medicine.image || "https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"}
            alt={medicine.name}
            className="w-full h-96 object-cover"
          />
        </motion.div>

        {/* Medicine Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-3/5 flex flex-col justify-between"
        >
          <Card className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-md flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <h1 className="text-3xl font-extrabold">{medicine.name}</h1>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <BiBuilding /> {medicine.manufacturer}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BiCategory /> {medicine.category.name}
                </Badge>
                <Badge
                  variant={medicine.stock > 0 ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {medicine.stock > 0 ? (
                    <>
                      <BiCartAlt /> {medicine.stock} in stock
                    </>
                  ) : (
                    "Out of stock"
                  )}
                </Badge>
                {inCart && <Badge variant="outline">In Cart: {cartQuantity}</Badge>}
              </div>
            </CardHeader>

            <CardContent className="mt-4 space-y-4">
              <p className="text-slate-700 dark:text-slate-300">{medicine.description}</p>

              <div className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                <BiDollar /> ${medicine.price.toFixed(2)}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center border rounded-lg overflow-hidden w-32">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1"
                  >
                    <BiMinus />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={medicine.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="text-center border-0 focus:ring-0 p-2"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setQuantity((q) => Math.min(medicine.stock, q + 1))}
                    className="px-3 py-1"
                  >
                    <BiPlus />
                  </Button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={medicine.stock === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                >
                  {inCart ? `Add More (${cartQuantity})` : "Add to Cart"}
                </Button>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                <BiUser /> Sold by: {medicine.seller.name} ({medicine.seller.email})
              </div>
            </CardContent>

            <CardFooter className="pt-4 text-xs text-muted-foreground">
              Medicine ID: {medicine.id}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}

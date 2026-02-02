"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setInCart(data.data.inCart);
        setCartQuantity(data.data.quantity);
      } else {
        console.warn(data.message || "Failed to fetch cart status");
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

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!medicine) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          medicineId: medicine.id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add to cart");

      toast.success(`${quantity} ${medicine.name} added to cart!`);
      
      // Update cart status and quantity
      setInCart(true);
      setCartQuantity((prev) => prev + quantity);
    } catch (err) {
      console.error(err);
      // toast.error(err.message || "Error adding to cart");
    }
  };

  if (loading || !medicine) {
    return <p className="text-center py-10 text-muted-foreground">Loading medicine details...</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-5">
        <Card className="w-full md:w-2/5 bg-background p-5 dark:bg-slate-900 overflow-hidden hover:scale-[1.02] transition-transform duration-200">
          <img
            src={medicine.image || "https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"}
            alt={medicine.name}
            className="w-full h-96 object-cover"
          />
        </Card>

        <Card className="w-full md:w-3/5 bg-background p-5 dark:bg-slate-900 flex flex-col justify-between">
          <CardHeader className="space-y-2">
            <h1 className="text-3xl font-extrabold">{medicine.name}</h1>
            <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{medicine.category.name}</Badge>
              <Badge variant={medicine.stock > 0 ? "default" : "destructive"}>
                {medicine.stock > 0 ? `${medicine.stock} in stock` : "Out of stock"}
              </Badge>
              {inCart && <Badge variant="outline">In Cart: {cartQuantity}</Badge>}
            </div>
          </CardHeader>

          <CardContent className="mt-4 space-y-4">
            <p>{medicine.description}</p>
            <p className="text-2xl font-bold">${medicine.price.toFixed(2)}</p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg overflow-hidden w-32">
                <Button
                  variant="outline"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={medicine.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="text-center border-0 focus:ring-0"
                />
                <Button
                  variant="outline"
                  onClick={() => setQuantity((q) => Math.min(medicine.stock, q + 1))}
                  className="px-3 py-1"
                >
                  +
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={medicine.stock === 0}
                className="bg-primary dark:bg-blue-600 hover:bg-primary/90 px-6"
              >
                {inCart ? `Add More (${cartQuantity})` : "Add to Cart"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Sold by: {medicine.seller.name} ({medicine.seller.email})
            </p>
          </CardContent>

          <CardFooter className="pt-4">
            <p className="text-xs text-muted-foreground">Medicine ID: {medicine.id}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

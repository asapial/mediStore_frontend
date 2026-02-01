"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // optional toast for feedback

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

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMedicine = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/medicines/${id}`);
      const data = await res.json();
      setMedicine(data.data);
    } catch (err) {
      console.error("Error fetching medicine:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMedicine();
  }, [id]);

  const handleAddToCart = () => {
    if (!medicine) return;
    // Here you can integrate with your cart logic
    toast.success(`${quantity} ${medicine.name} added to cart!`);
  };

  if (loading || !medicine) {
    return <p className="text-center py-10">Loading medicine details...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <Card className="bg-background dark:bg-slate-800 shadow-lg">
          <img
            src={medicine.image}
            alt={medicine.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </Card>

        {/* Details */}
        <Card className="bg-background dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">{medicine.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{medicine.manufacturer}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{medicine.category.name}</Badge>
              <Badge variant={medicine.stock > 0 ? "default" : "destructive"}>
                {medicine.stock > 0 ? `${medicine.stock} in stock` : "Out of stock"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="mt-4 text-foreground dark:text-gray-300">
            <p className="mb-4">{medicine.description}</p>
            <p className="text-xl font-bold mb-4">${medicine.price.toFixed(2)}</p>

            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={1}
                max={medicine.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24"
              />
              <Button
                onClick={handleAddToCart}
                disabled={medicine.stock === 0}
                className="bg-primary dark:bg-blue-600 hover:bg-primary/90"
              >
                Add to Cart
              </Button>
            </div>

            <p className="text-sm mt-4 text-muted-foreground">
              Sold by: {medicine.seller.name} ({medicine.seller.email})
            </p>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-muted-foreground">
              {/* Optional: You can add more details here */}
              ID: {medicine.id}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

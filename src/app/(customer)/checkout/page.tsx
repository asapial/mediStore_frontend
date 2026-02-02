"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Medicine {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  stock: number;
  manufacturer: string;
}

interface CartItem {
  id: string;
  cartId: string;
  medicineId: string;
  quantity: number;
  medicine: Medicine;
}

interface CartData {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch cart");
      setCart(data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      toast.error("Please enter a delivery address");
      textareaRef.current?.focus();
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: trimmedAddress,
          items: cart.items.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");

      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error placing order");
    } finally {
      setPlacingOrder(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <p className="text-center py-10 text-muted-foreground">Loading cart...</p>;
  if (!cart || cart.items.length === 0) return <p className="text-center py-10 text-muted-foreground">Your cart is empty.</p>;

  return (
    <div className="p-5 md:p-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-foreground dark:text-white">Checkout</h1>

      {/* Cart Items Table */}
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Review your items</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cart.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={item.medicine.image || "https://via.placeholder.com/80"}
                      alt={item.medicine.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell>{item.medicine.name}</TableCell>
                  <TableCell>${item.medicine.price.toFixed(2)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${(item.quantity * item.medicine.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Total Quantity: {cart.totalQuantity}</p>
            <p className="text-xl font-bold">Total Price: ${cart.totalPrice.toFixed(2)}</p>
          </div>
        </CardFooter>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full resize-none h-24"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Make sure to include house number, street, city, and postal code.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="bg-primary dark:bg-blue-600 hover:bg-primary/90 px-6"
            onClick={placeOrder}
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

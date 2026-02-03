"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardHeader, CardContent, CardFooter, CardTitle
} from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { BiCartAlt, BiPackage, BiDollar, BiMap } from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

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
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error placing order");
    } finally {
      setPlacingOrder(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

    if (loading) return (
        <MedicineLoadingPage text="orders"></MedicineLoadingPage>
    );
  if (!cart || cart.items.length === 0)
    return <p className="text-center py-10 text-slate-500">Your cart is empty.</p>;

  return (
    <SectionContainer   className="min-h-screen p-5 md:p-10 space-y-6 bg-gradient-to-br from-emerald-50 via-emerald-100/10 to-emerald-50  dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 my-5">
        <BiCartAlt className="text-emerald-600 text-3xl" /> Checkout
      </h1>

      {/* Cart Items Table */}
      <Card className="overflow-x-auto shadow-lg border border-slate-200 dark:border-slate-700 my-5">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-slate-900 dark:text-white">Review your items</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cart.items.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02, backgroundColor: "#f0fdf4" }}
                  className="transition-colors rounded-md"
                >
                  <TableCell>
                    <img
                      src={item.medicine.image || "https://via.placeholder.com/80"}
                      alt={item.medicine.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.medicine.name}</TableCell>
                  <TableCell className="text-slate-500 flex items-center gap-1">
                    <BiPackage className="text-emerald-500" /> {item.medicine.manufacturer}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <BiDollar /> {item.medicine.price.toFixed(2)}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    ${(item.quantity * item.medicine.price).toFixed(2)}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-2 text-slate-900 dark:text-white">
            <p className="text-lg font-semibold">Total Quantity: {cart.totalQuantity}</p>
            <p className="text-xl font-bold text-emerald-600">Total Price: ${cart.totalPrice.toFixed(2)}</p>
          </div>
        </CardFooter>
      </Card>

      {/* Delivery Address */}
      <Card className="shadow-lg border border-slate-200 dark:border-slate-700 my-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BiMap className="text-emerald-500" /> Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full resize-none h-24 border border-slate-300 focus:ring-2 focus:ring-emerald-400 rounded-md"
          />
          <p className="text-sm text-slate-500 mt-2">
            Include house number, street, city, and postal code for smooth delivery.
          </p>
        </CardContent>
        <CardFooter>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 px-6 transition-all flex items-center gap-2"
              onClick={placeOrder}
              disabled={placingOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
              <BiCartAlt />
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </SectionContainer>
  );
}

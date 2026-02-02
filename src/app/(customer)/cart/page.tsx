"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface Medicine {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  stock: number;
  manufacturer: string;
  sellerId: string;
  categoryId: string;
  createdAt: string;
}

interface CartItem {
  id: string;
  cartId: string;
  medicineId: string;
  quantity: number;
  addedAt: string;
  medicine: Medicine;
}

interface CartData {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch cart from API
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
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error fetching cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update quantity locally
  const handleQuantityChange = (itemId: string, value: number) => {
    setCart((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity: value } : item
      );
      return {
        ...prev,
        items: updatedItems,
        totalQuantity: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        totalPrice: updatedItems.reduce(
          (sum, i) => sum + i.quantity * i.medicine.price,
          0
        ),
      };
    });
  };

  // Call API to update quantity
  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update cart item");
      toast.success("Cart updated successfully");
      fetchCart(); // optional to sync with server
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating cart");
    }
  };

  // Remove item
  const removeCartItem = async (itemId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove item");
      toast.success("Item removed from cart");
      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.filter((i) => i.id !== itemId);
        return {
          ...prev,
          items: updatedItems,
          totalQuantity: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          totalPrice: updatedItems.reduce(
            (sum, i) => sum + i.quantity * i.medicine.price,
            0
          ),
        };
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error removing item");
    }
  };

  if (loading) return <p className="text-center py-10 text-muted-foreground">Loading cart...</p>;
  if (!cart || cart.items.length === 0)
    return <p className="text-center py-10 text-muted-foreground">Your cart is empty.</p>;

  return (
    <div className="p-5 md:p-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-foreground dark:text-white">My Cart</h1>

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Items in your cart</CardTitle>
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
                <TableHead>Stock Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cart.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={item.medicine.image || "https://via.placeholder.com/100"}
                      alt={item.medicine.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.medicine.name}</TableCell>
                  <TableCell>${item.medicine.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateCartItem(item.id, Math.max(1, item.quantity - 1))
                        }
                      >
                        -
                      </Button> */}

                      <Input
                        type="number"
                        min={1}
                        max={item.medicine.stock}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, Math.max(1, Number(e.target.value)))
                        }
                        onBlur={(e) =>
                          updateCartItem(item.id, Math.max(1, Number(e.target.value)))
                        }
                        className="w-16 text-center border-0 focus:ring-0"
                      />

                      {/* <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateCartItem(item.id, Math.min(item.medicine.stock, item.quantity + 1))
                        }
                      >
                        +
                      </Button> */}
                    </div>
                  </TableCell>
                  <TableCell>${(item.quantity * item.medicine.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.medicine.stock === 0
                          ? "destructive"
                          : item.quantity > item.medicine.stock
                          ? "secondary"
                          : "default"
                      }
                    >
                      {item.medicine.stock === 0
                        ? "Out of stock"
                        : item.quantity > item.medicine.stock
                        ? "Low stock"
                        : "In stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCartItem(item.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold">Total Quantity: {cart.totalQuantity}</p>
            <p className="text-xl font-bold">Total Price: ${cart.totalPrice.toFixed(2)}</p>
          </div>

          <Button
            className="bg-primary dark:bg-blue-600 hover:bg-primary/90 px-6"
            onClick={() => router.push("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { BiTrash, BiCartAlt, BiPackage, BiCategory, BiDollar } from "react-icons/bi";
import SectionContainer from "@/utils/SectionContainer";
import MedicineLoadingPage from "@/components/shared/LoadingPage";

interface Category { id: string; name: string; }
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
        } catch (err: unknown) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Error fetching cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);

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
                totalPrice: updatedItems.reduce((sum, i) => sum + i.quantity * i.medicine.price, 0),
            };
        });
    };

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
            fetchCart();
        } catch (err: unknown) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Error updating cart");
        }
    };

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
                    totalPrice: updatedItems.reduce((sum, i) => sum + i.quantity * i.medicine.price, 0),
                };
            });
        } catch (err: unknown) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Error removing item");
        }
    };

    if (loading) return (
        <MedicineLoadingPage text="medicines"></MedicineLoadingPage>
    );
    if (!cart || cart.items.length === 0)
        return <p className="text-center py-10 text-slate-500 min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/10 to-emerald-50  dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">Your cart is empty.</p>;

    return (
        <SectionContainer className="bg-gradient-to-br from-emerald-50 via-emerald-100/10 to-emerald-50  dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 my-5">
                <BiCartAlt className="text-emerald-600 text-3xl" /> My Cart
            </h1>

            <Card className="overflow-x-auto shadow-lg border border-slate-200 dark:border-slate-700 my-5">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl text-slate-900 dark:text-white">
                        Items in your cart
                    </CardTitle>
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
                                            src={item.medicine.image || "https://via.placeholder.com/100"}
                                            alt={item.medicine.name}
                                            className="w-20 h-20 object-cover rounded-md"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium flex flex-col gap-1">
                                        <span>{item.medicine.name}</span>
                                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                                            <BiPackage /> {item.medicine.manufacturer}
                                            <BiCategory /> Category: {item.medicine.categoryId}
                                        </div>
                                    </TableCell>
                                    <TableCell><BiDollar className="inline mr-1" />{item.medicine.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
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
                                                className="w-16 text-center border-0 focus:ring-1 focus:ring-emerald-400 rounded"
                                            />
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
                                            className="flex items-center gap-1"
                                        >
                                            <BiTrash /> Remove
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>

                <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-slate-900 dark:text-white">
                        <p className="text-lg font-semibold">Total Quantity: {cart.totalQuantity}</p>
                        <p className="text-xl font-bold text-emerald-600">Total Price: ${cart.totalPrice.toFixed(2)}</p>
                    </div>

                    <Button
                        className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 px-6 transition-all flex items-center gap-2"
                        onClick={() => router.push("/checkout")}
                    >
                        Proceed to Checkout <BiCartAlt />
                    </Button>
                </CardFooter>
            </Card>
        </SectionContainer>
    );
}

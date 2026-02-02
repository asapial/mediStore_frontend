"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Medicine {
    name: string;
    description: string;
    price: number;
    image: string | null;
}

interface OrderItem {
    id: string;
    medicineId: string;
    quantity: number;
    price: number;
    status: string;
    medicine: Medicine;
}

interface Order {
    id: string;
    status: string;
    address: string;
    createdAt: string;
    items: OrderItem[];
}

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            setOrders(data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return <p className="text-center py-10 text-muted-foreground">Loading orders...</p>;
    }

    if (!orders.length) {
        return <p className="text-center py-10 text-muted-foreground">No orders found.</p>;
    }

    return (
        <div className="p-5 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-foreground dark:text-white">Your Orders</h1>

            {orders.map((order) => {
                const totalPrice = order.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );

                return (
                    <Card key={order.id} className="shadow-xl bg-background dark:bg-slate-900">
                        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg md:text-xl font-bold">
                                    Order ID: {order.id}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Address: {order.address}</p>
                                <p className="text-sm text-muted-foreground">
                                    Placed on: {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <Badge
                                variant="secondary"
                                className={`uppercase ${order.status === "DELIVERED"
                                        ? "bg-green-500 text-white"
                                        : order.status === "CANCELLED"
                                            ? "bg-red-500 text-white"
                                            : ""
                                    }`}
                            >
                                {order.status}
                            </Badge>
                        </CardHeader>

                        <CardContent className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-muted-foreground/20">
                                        <th className="py-2 px-4">Medicine</th>
                                        <th className="py-2 px-4">Quantity</th>
                                        <th className="py-2 px-4">Price</th>
                                        <th className="py-2 px-4">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="border-b border-muted-foreground/10">
                                            <td className="py-2 px-4">{item.medicine.name}</td>
                                            <td className="py-2 px-4">{item.quantity}</td>
                                            <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                                            <td className="py-2 px-4">${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>

                        <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-lg font-bold text-foreground dark:text-white">
                                Total: ${totalPrice.toFixed(2)}
                            </p>
                            <Button
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="bg-primary dark:bg-blue-600 hover:bg-primary/90 px-6"
                            >
                                Details
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}

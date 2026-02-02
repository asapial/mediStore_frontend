"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/${id}`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch order");
            setOrder(data.data);
        } catch (err: unknown) {
            console.error(err);

            toast.error(
                err instanceof Error
                    ? err.message
                    : "Error fetching order details"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    if (loading) {
        return <p className="text-center py-10 text-muted-foreground">Loading order details...</p>;
    }

    if (!order) {
        return <p className="text-center py-10 text-muted-foreground">Order not found.</p>;
    }

    const totalPrice = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="p-5 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground dark:text-white">
                    Order Details
                </h1>
                <Button onClick={() => router.back()} variant="outline">
                    Back
                </Button>
            </div>

            <Card className="shadow-xl bg-background dark:bg-slate-900">
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
                                : "bg-gray-200 text-gray-900"
                            }`}
                    >
                        {order.status}
                    </Badge>
                </CardHeader>

                <CardContent className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-muted-foreground/20">
                                <th className="py-2 px-4">Image</th>
                                <th className="py-2 px-4">Medicine</th>
                                <th className="py-2 px-4">Description</th>
                                <th className="py-2 px-4">Quantity</th>
                                <th className="py-2 px-4">Price</th>
                                <th className="py-2 px-4">Subtotal</th>
                                <th className="py-2 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id} className="border-b border-muted-foreground/10">
                                    <td className="py-2 px-4 w-20">
                                        <img
                                            src={item.medicine.image || "https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"}
                                            //   src={"https://i.ibb.co/wNXj2FR6/serum-sweet-Purple.png"}
                                            alt={item.medicine.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    </td>
                                    <td className="py-2 px-4">{item.medicine.name}</td>
                                    <td className="py-2 px-4">{item.medicine.description}</td>
                                    <td className="py-2 px-4">{item.quantity}</td>
                                    <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                                    <td className="py-2 px-4">${(item.price * item.quantity).toFixed(2)}</td>
                                    <td className="py-2 px-4">
                                        <Badge
                                            variant={
                                                item.status === "DELIVERED"
                                                    ? "default"
                                                    : item.status === "CANCELLED"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </td>
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
                        onClick={() => router.push("/checkout")}
                        className="bg-primary dark:bg-blue-600 hover:bg-primary/90 px-6"
                    >
                        Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FaUser, FaBoxOpen } from "react-icons/fa";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface Seller {
    id: string;
    name: string;
    image: string | null;
}

interface Medicine {
    id: string;
    name: string;
    image: string | null;
    manufacturer: string;
    seller: Seller;
}

interface OrderItem {
    id: string;
    quantity: number;
    status: string;
    price: number;
    medicine: Medicine;
}

interface Order {
    id: string;
    userId: string;
    status: string;
    address: string;
    createdAt: string;
    items: OrderItem[];
}

export default function AdminOrderDetailsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/order`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
            setOrders(data.data);
        } catch (err: unknown) {
            console.error(err);

            toast.error(
                err instanceof Error
                    ? err.message
                    : "Error fetching orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const statusColor = (status: string):
        "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" => {
        switch (status) {
            case "PLACED":
                return "default";
            case "PROCESSING":
                return "secondary";
            case "SHIPPED":
                return "outline";       // instead of "warning"
            case "DELIVERED":
                return "secondary";     // instead of "success"
            case "CANCELLED":
                return "destructive";
            default:
                return "default";
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-6">
            <h1 className="text-3xl font-extrabold mb-6">All Orders</h1>

            {loading ? (
                <p className="text-center py-10 text-muted-foreground flex justify-center items-center gap-3">Loading orders <Spinner className="size-4" /></p>
            ) : orders.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">No orders found.</p>
            ) : (
                orders.map((order) => (
                    <Card key={order.id} className="overflow-x-auto">
                        <CardHeader>
                            <CardTitle>
                                <div className="flex items-center justify-between">
                                    <span>Order ID: <span className="font-mono">{order.id}</span></span>
                                    <Badge variant={statusColor(order.status)}>{order.status}</Badge>
                                </div>
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <FaUser /> User: {order.userId} | Address: {order.address} | Date: {new Date(order.createdAt).toLocaleString()}
                            </div>
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
                                        <TableHead>Manufacturer</TableHead>
                                        <TableHead>Seller</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <img
                                                    src={item.medicine.image || "https://via.placeholder.com/80"}
                                                    alt={item.medicine.name}
                                                    className="w-20 h-20 object-cover rounded-md"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{item.medicine.name}</TableCell>
                                            <TableCell>${item.price.toFixed(2)}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                                            <TableCell>{item.medicine.manufacturer}</TableCell>
                                            <TableCell>{item.medicine.seller.name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

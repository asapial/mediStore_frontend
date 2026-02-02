"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FaUserEdit, FaUserSlash, FaUserCheck } from "react-icons/fa";

interface User {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: "CUSTOMER" | "SELLER" | "ADMIN";
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
    emailVerified: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch users");
            setUsers(data.data);
        } catch (err: unknown) {
            console.error(err);

            toast.error(
                err instanceof Error
                    ? err.message
                    : "Error fetching users"
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleBan = async (userId: string, ban: boolean) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${userId}/ban`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ban }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update user");
            toast.success(`User ${ban ? "banned" : "unbanned"} successfully`);
            fetchUsers();
        } catch (err: unknown) {
            console.error(err);

            toast.error(
                err instanceof Error
                    ? err.message
                    : "Error updating user"
            );
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-6 md:p-10">
            <h1 className="text-3xl font-extrabold mb-6">Manage Users</h1>

            <Card className="overflow-x-auto">
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7} className="animate-pulse h-10 bg-gray-100 dark:bg-gray-800 rounded" />
                                    </TableRow>
                                ))
                                : users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <img
                                                src={user.image || "https://via.placeholder.com/40"}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.isBanned ? (
                                                <Badge variant="destructive">Banned</Badge>
                                            ) : (
                                                <Badge variant="default">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={user.isBanned ? "secondary" : "destructive"} // changed "success" → "secondary"
                                                onClick={() => toggleBan(user.id, !user.isBanned)}
                                            >
                                                {user.isBanned ? <FaUserCheck /> : <FaUserSlash />}
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <FaUserEdit />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
